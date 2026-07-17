import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, sosfiltfilt

SR = 24000

def load(p):
    a, sr = sf.read(p)
    if a.ndim > 1: a = a.mean(axis=1)
    if sr != SR:
        import resampy
        a = resampy.resample(a, sr, SR)
    return a.astype(np.float32)

def normalize(a, target=-3.0):
    a = a - a.mean()
    peak = np.max(np.abs(a)) + 1e-8
    a = a / peak * (10 ** (target / 20))
    return a

def compressor(a, thresh=-18.0, ratio=3.0, attack=0.005, release=0.12):
    thresh = 10 ** (thresh / 20)
    env = np.zeros_like(a)
    a_abs = np.abs(a)
    coef_a = np.exp(-1 / (SR * attack))
    coef_r = np.exp(-1 / (SR * release))
    for i in range(1, len(a)):
        coef = coef_a if a_abs[i] > env[i-1] else coef_r
        env[i] = coef * env[i-1] + (1 - coef) * a_abs[i]
    env = np.maximum(env, 1e-8)
    gain = np.ones_like(a)
    mask = env > thresh
    gain[mask] = (thresh / env[mask]) ** (1 - 1/ratio)
    return a * gain

def soft_limit(a, ceiling=-1.0):
    ceil = 10 ** (ceiling / 20)
    # tanh soft clip
    return np.tanh(a / ceil) * ceil

# ---- Music bed: gentle evolving pad (two detuned sines + slow tremolo) ----
def music_bed(dur, sr=SR):
    t = np.linspace(0, dur, int(dur * sr), endpoint=False)
    # base chord (A minor-ish): 220, 261.6, 329.6 Hz
    freqs = [110.0, 164.8, 220.0, 329.6]
    sig = np.zeros_like(t)
    for f in freqs:
        sig += np.sin(2 * np.pi * f * t) * (0.18 / len(freqs))
    # slow tremolo + lowpass for warmth
    trem = 0.7 + 0.3 * np.sin(2 * np.pi * 0.08 * t)
    sig *= trem
    sos = butter(2, 800, btype='lowpass', fs=sr, output='sos')
    sig = sosfiltfilt(sos, sig)
    # fade in/out edges
    fade = int(sr * 2)
    sig[:fade] *= np.linspace(0, 1, fade)
    sig[-fade:] *= np.linspace(1, 0, fade)
    return sig.astype(np.float32)

voice = load("video/pa_voice_bella.wav")
voice = normalize(compressor(voice), target=-4.0)
voice = soft_limit(voice, ceiling=-1.0)

dur = len(voice) / SR
bed = music_bed(dur)
bed = normalize(bed, target=-16.0)  # bed sits ~12dB under voice

mix = voice + bed * 0.5
mix = normalize(mix, target=-2.0)
mix = soft_limit(mix, ceiling=-0.5)

sf.write("video/pa_audio_final.wav", mix, SR)
print(f"pa_audio_final.wav: {dur:.1f}s -> mixed voice + music bed")
