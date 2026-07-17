import os
from PIL import Image, ImageDraw, ImageFont
from moviepy import ImageClip, AudioFileClip, concatenate_videoclips, vfx

HERE = os.path.dirname(os.path.abspath(__file__))
def p(n): return os.path.join(HERE, n)
W, H = 1280, 720

def font(sz):
    try: return ImageFont.truetype("C:\\Windows\\Fonts\\segoeui.ttf", sz)
    except Exception: return ImageFont.load_default()

def slide(name, lines, bg=(10, 10, 15), accent=(34, 197, 94)):
    img = Image.new("RGB", (W, H), bg)
    d = ImageDraw.Draw(img)
    y = 250
    for i, (text, sz, fill, off) in enumerate(lines):
        d.text((W // 2, y + off), text, font=font(sz), fill=fill, anchor="mm")
    img.save(p(name))
    return name

# Title
slide("dow_0_title.png", [
    ("Doctors on Wheels", 70, (34, 197, 94), 0),
    ("Care that comes to you", 30, (210, 210, 220), 70),
    ("South Africa  ·  docsonwheels.co.za", 24, (150, 150, 170), 120),
])

# "Find a doctor" slide (book page was thin)
slide("dow_5_find.png", [
    ("Find a Doctor", 56, (34, 197, 94), 0),
    ("Video call from anywhere  ·  Home visit to your door", 26, (210, 210, 220), 70),
])

# "Triage" slide
slide("dow_6_triage.png", [
    ("Rich Triage Questionnaire", 52, (34, 197, 94), 0),
    ("Chief complaint  ·  Duration  ·  Pain 0-10", 24, (200, 200, 215), 64),
    ("Medications  ·  Allergies  ·  Red flags (chest pain, breathlessness)", 24, (200, 200, 215), 100),
])

# "Secure pay + tip" slide
slide("dow_7_pay.png", [
    ("Secure Checkout with Yoco", 52, (34, 197, 94), 0),
    ("Pay by card in Rands  ·  Call-out fee shown up front", 24, (200, 200, 215), 64),
    ("100% of your tip goes to the doctor", 24, (200, 200, 215), 100),
])

# Closing
slide("dow_8_close.png", [
    ("Doctors on Wheels", 60, (34, 197, 94), 0),
    ("Care that comes to you", 30, (210, 210, 220), 70),
    ("docsonwheels.co.za", 26, (150, 150, 170), 120),
])

def clip(name, dur):
    return (ImageClip(p(name)).resized((W, H)).with_duration(dur)
            .with_effects([vfx.CrossFadeIn(0.4)]))

clips = [
    clip("dow_0_title.png", 5),
    clip("dow_1_landing.png", 6),
    clip("dow_2_register.png", 5),
    clip("dow_3_login.png", 5),
    clip("dow_4_dashboard.png", 8),
    clip("dow_5_find.png", 8),
    clip("dow_6_triage.png", 9),
    clip("dow_7_pay.png", 9),
    clip("dow_8_close.png", 6),
]

video = concatenate_videoclips(clips, method="compose")
audio = AudioFileClip(p("dow_voiceover.wav"))
if video.duration > audio.duration:
    video = video.subclipped(0, audio.duration)
video = video.with_audio(audio)

out = p("DoctorsOnWheels-demo.mp4")
video.write_videofile(out, codec="libx264", audio_codec="aac", fps=30,
                      preset="slow", threads=4,
                      ffmpeg_params=["-crf", "17", "-pix_fmt", "yuv420p",
                                     "-b:a", "192k", "-ar", "48000"])
print("WROTE", out, "duration", round(audio.duration, 1), "s")
