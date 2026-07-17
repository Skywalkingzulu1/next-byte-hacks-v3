import os
from PIL import Image, ImageDraw, ImageFont
from moviepy import ImageClip, AudioFileClip, concatenate_videoclips, vfx

HERE = os.path.dirname(os.path.abspath(__file__))
IMGDIR = os.path.join(HERE, "images")
def p(n): return os.path.join(IMGDIR, n)
W, H = 1280, 720

def font(sz):
    try: return ImageFont.truetype("C:\\Windows\\Fonts\\segoeui.ttf", sz)
    except Exception: return ImageFont.load_default()

def caption(name, text, outname, accent=(34, 197, 94), sub=None):
    img = Image.open(p(name)).convert("RGB").resize((W, H))
    d = ImageDraw.Draw(img)
    # bottom gradient bar
    bar = 150
    for i in range(bar):
        a = int(180 * (i / bar))
        d.rectangle([0, H - bar + i, W, H - bar + i + 1], fill=(0, 0, 0, 0))  # no-op keep
    d.rectangle([0, H - 150, W, H], fill=(5, 8, 12))
    d.text((60, H - 118), text, font=font(40), fill=accent, anchor="lm")
    if sub:
        d.text((60, H - 70), sub, font=font(24), fill=(210, 210, 220), anchor="lm")
    img.save(p(outname))

caption("dow_hero.png", "Doctors on Wheels", "c_hero.png", sub="Care that comes to you")
caption("dow_telehealth.png", "Video call from anywhere", "c_tele.png", sub="See a doctor by secure video")
caption("dow_homevisit.png", "Home visits", "c_home.png", sub="The doctor comes to your door")
caption("dow_triage.png", "Smart triage", "c_triage.png", sub="Prepared, personal care")
caption("dow_payment.png", "Secure Yoco checkout", "c_pay.png", sub="Pay by card in Rands")

def clip(name, dur):
    return (ImageClip(p(name)).resized((W, H)).with_duration(dur)
            .with_effects([vfx.CrossFadeIn(0.4)]))

clips = [clip("c_hero.png", 4), clip("c_tele.png", 4), clip("c_home.png", 4),
         clip("c_triage.png", 4), clip("c_pay.png", 4)]
video = concatenate_videoclips(clips, method="compose")

# Optional ambient narration reusing prior voiceover if present
vof = os.path.join(HERE, "dow_voiceover.wav")
if os.path.exists(vof):
    audio = AudioFileClip(vof)
    if video.duration > audio.duration:
        video = video.subclipped(0, audio.duration)
    video = video.with_audio(audio)

out = os.path.join(HERE, "DoctorsOnWheels-promo.mp4")
video.write_videofile(out, codec="libx264", audio_codec="aac", fps=30,
                      preset="slow", threads=4,
                      ffmpeg_params=["-crf", "17", "-pix_fmt", "yuv420p", "-b:a", "192k", "-ar", "48000"])
print("WROTE", out)
