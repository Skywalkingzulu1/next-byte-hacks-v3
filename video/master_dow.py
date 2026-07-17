import numpy as np, soundfile as sf
from scipy.signal import butter, sosfiltfilt

SR = 24000
def load(p):
    a, sr = sf.read(p)
    if a.ndim > 1: a = a.mean(axis=1)
    if sr != SR:
        import resampy; a = resampy.resample(a, sr, SR)
    return a.astype(np.float32)
def normalize(a, target=-3.0):
    a = a - a.mean(); peak = np.max(np.abs(a)) + 1e-8
    return a / peak * (10 ** (target / 20))
def compressor(a, thresh=-18.0, ratio=3.0, attack=0.005, release=0.12):
    thresh = 10 ** (thresh / 20); env = np.zeros_like(a); a_abs = np.abs(a)
    ca = np.exp(-1/(SR*attack)); cr = np.exp(-1/(SR*release))
    for i in range(1, len(a)):
        co = ca if a_abs[i] > env[i-1] else cr
        env[i] = co*env[i-1] + (1-co)*a_abs[i]
    env = np.maximum(env, 1e-8); gain = np.ones_like(a)
    m = env > thresh; gain[m] = (thresh/env[m])**(1-1/ratio)
    return a*gain
def soft_limit(a, ceiling=-1.0):
    c = 10**(ceiling/20); return np.tanh(a/c)*c
def music_bed(dur, sr=SR):
    t = np.linspace(0, dur, int(dur*sr), endpoint=False)
    freqs = [130.8, 196.0, 261.6, 392.0]
    sig = np.zeros_like(t)
    for f in freqs: sig += np.sin(2*np.pi*f*t)*(0.18/len(freqs))
    trem = 0.7 + 0.3*np.sin(2*np.pi*0.07*t); sig *= trem
    sos = butter(2, 900, btype='lowpass', fs=sr, output='sos'); sig = sosfiltfilt(sos, sig)
    fade = int(sr*2); sig[:fade]*=np.linspace(0,1,fade); sig[-fade:]*=np.linspace(1,0,fade)
    return sig.astype(np.float32)

voice = normalize(compressor(load("video/dow_voice_v2.wav")), target=-4.0)
voice = soft_limit(voice, ceiling=-1.0)
dur = len(voice)/SR
bed = normalize(music_bed(dur), target=-16.0)
mix = normalize(soft_limit(normalize(voice + bed*0.5, target=-2.0), ceiling=-0.5), target=-2.0)
sf.write("video/dow_audio_final.wav", mix, SR)
print(f"dow_audio_final.wav: {dur:.1f}s")
