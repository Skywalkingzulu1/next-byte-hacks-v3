import os
from PIL import Image, ImageDraw, ImageFont
from moviepy import ImageClip, VideoFileClip, concatenate_videoclips, vfx

HERE = os.path.dirname(os.path.abspath(__file__))
def p(n): return os.path.join(HERE, n)
W, H = 1920, 1080

def font(sz, bold=False):
    try:
        name = "C:\\Windows\\Fonts\\segoeui.ttf" if not bold else "C:\\Windows\\Fonts\\segoeuib.ttf"
        return ImageFont.truetype(name, sz)
    except Exception: return ImageFont.load_default()

def captioned_image(name, title, sub, outname):
    img = Image.open(p(name)).convert("RGB").resize((W, H))
    d = ImageDraw.Draw(img)
    d.rectangle([0, H - 170, W, H], fill=(5, 10, 8))
    d.rectangle([0, H - 170, 8, H], fill=(34, 197, 94))
    d.text((60, H - 130), title, font=font(52, True), fill=(235, 245, 238), anchor="lm")
    d.text((60, H - 78), sub, font=font(30), fill=(190, 220, 205), anchor="lm")
    img.save(p(outname))

captioned_image("images/dow_hero.png", "Doctors on Wheels", "Care that comes to you", "v2p_hero.png")
captioned_image("images/dow_telehealth.png", "Video call from anywhere", "See a doctor by secure video", "v2p_tele.png")
captioned_image("images/dow_homevisit.png", "Home visits", "The doctor comes to your door", "v2p_home.png")

def img_clip(n, dur):
    return ImageClip(p(n)).resized((W, H)).with_duration(dur).with_effects([vfx.CrossFadeIn(0.4), vfx.CrossFadeOut(0.4)])
def vid_clip(n, dur):
    return VideoFileClip(p(n)).resized((W, H)).with_duration(dur).with_effects([vfx.CrossFadeIn(0.4), vfx.CrossFadeOut(0.4)])

clips = [img_clip("v2p_hero.png", 3), vid_clip("dow_demo_raw.mp4", 6),
         img_clip("v2p_tele.png", 3), img_clip("v2p_home.png", 3)]
seq = concatenate_videoclips(clips, method="compose")
audio = VideoFileClip(p("DoctorsOnWheels-v2.mp4")).audio.subclipped(0, seq.duration)
seq = seq.with_audio(audio)
seq.write_videofile(p("DoctorsOnWheels-promo-v2.mp4"), codec="libx264", audio_codec="aac", fps=30,
                    preset="slow", threads=4,
                    ffmpeg_params=["-crf", "16", "-pix_fmt", "yuv420p", "-b:a", "192k", "-ar", "48000"])
print("WROTE DoctorsOnWheels-promo-v2.mp4")
