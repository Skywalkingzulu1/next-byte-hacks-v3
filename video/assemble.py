import os
from PIL import Image, ImageDraw, ImageFont
from moviepy import ImageClip, AudioFileClip, concatenate_videoclips, vfx

HERE = os.path.dirname(os.path.abspath(__file__))
def p(n): return os.path.join(HERE, n)

W, H = 1280, 720

# --- Title card via PIL (avoids font-path issues) ---
img = Image.new("RGB", (W, H), (10, 10, 15))
d = ImageDraw.Draw(img)
try:
    fbig = ImageFont.truetype("C:\\Windows\\Fonts\\segoeui.ttf", 72)
    fsmall = ImageFont.truetype("C:\\Windows\\Fonts\\segoeui.ttf", 30)
except Exception:
    fbig = ImageFont.load_default()
    fsmall = ImageFont.load_default()
d.text((W // 2, 280), "PriorAuthFlow", font=fbig, fill=(99, 102, 241), anchor="mm")
d.text((W // 2, 370), "Chart to submit-ready in under 60 seconds", font=fsmall, fill=(200, 200, 215), anchor="mm")
d.text((W // 2, 430), "Next Byte Hacks V3", font=fsmall, fill=(160, 160, 180), anchor="mm")
title_path = p("shot_0_title.png")
img.save(title_path)

def clip(name, dur):
    c = (ImageClip(p(name))
          .resized((W, H))
          .with_duration(dur)
          .with_effects([vfx.CrossFadeIn(0.4)]))
    return c

clips = [
    clip("shot_0_title.png", 4),
    clip("shot_1_hero.png", 6),
    clip("shot_2_demo.png", 7),
    clip("shot_3_running.png", 6),
    clip("shot_4_happy.png", 15),
    clip("shot_5_escalation.png", 15),
]

video = concatenate_videoclips(clips, method="compose")
audio = AudioFileClip(p("voiceover.wav"))
# trim/extend video to match narration length
if video.duration > audio.duration:
    video = video.subclipped(0, audio.duration)
else:
    # pad last clip by looping is complex; just let audio define end
    pass
video = video.with_audio(audio)

out = p("PriorAuthFlow-demo.mp4")
video.write_videofile(out, codec="libx264", audio_codec="aac", fps=30,
                      preset="medium", threads=4)
print("WROTE", out, "duration", round(audio.duration, 1), "s")
