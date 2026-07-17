import os, json
from PIL import Image, ImageDraw, ImageFont
from moviepy import (ImageClip, AudioFileClip, VideoFileClip, concatenate_videoclips,
                     CompositeVideoClip, TextClip, vfx)

HERE = os.path.dirname(os.path.abspath(__file__))
def p(n): return os.path.join(HERE, n)
W, H = 1920, 1080

def font(sz, bold=False):
    try:
        name = "C:\\Windows\\Fonts\\segoeui.ttf" if not bold else "C:\\Windows\\Fonts\\segoeuib.ttf"
        return ImageFont.truetype(name, sz)
    except Exception:
        return ImageFont.load_default()

def make_intro():
    img = Image.new("RGB", (W, H), (6, 12, 10))
    d = ImageDraw.Draw(img)
    d.rectangle([0, H//2 - 4, W, H//2 + 4], fill=(34, 197, 94))
    d.text((W//2, H//2 - 120), "Doctors on Wheels", font=font(110, True), fill=(235, 245, 238), anchor="mm")
    d.text((W//2, H//2 + 10), "Care that comes to you", font=font(44), fill=(180, 220, 195), anchor="mm")
    d.text((W//2, H//2 + 75), "docsonwheels.co.za", font=font(30), fill=(140, 180, 155), anchor="mm")
    img.save(p("v2_intro_dow.png"))

def make_outro():
    img = Image.new("RGB", (W, H), (6, 12, 10))
    d = ImageDraw.Draw(img)
    d.rectangle([0, H//2 - 4, W, H//2 + 4], fill=(34, 197, 94))
    d.text((W//2, H//2 - 90), "Doctors on Wheels", font=font(100, True), fill=(235, 245, 238), anchor="mm")
    d.text((W//2, H//2 + 20), "Care that comes to you", font=font(42), fill=(34, 197, 94), anchor="mm")
    d.text((W//2, H//2 + 80), "docsonwheels.co.za", font=font(26), fill=(150, 185, 165), anchor="mm")
    img.save(p("v2_outro_dow.png"))

make_intro(); make_outro()

captions = json.load(open(p("captions_dow.json")))
def caption_clips(dur):
    out = []
    for c in captions:
        s = max(0, c["start"]/1000.0); e = min(dur, c["end"]/1000.0)
        if e <= s: continue
        try:
            tc = (TextClip(text=c["text"], font_size=46, color="white",
                           font="C:\\Windows\\Fonts\\segoeui.ttf",
                           size=(W - 240, None), method="caption")
                  .with_position(("center", H - 180)).with_start(s).with_end(e)
                  .with_effects([vfx.CrossFadeIn(0.3), vfx.CrossFadeOut(0.3)]))
            out.append(tc)
        except Exception as ex: print("cap skip", ex)
    return out

demo = VideoFileClip(p("dow_demo_raw.mp4")).with_effects([vfx.CrossFadeIn(0.4)])
intro = ImageClip(p("v2_intro_dow.png")).resized((W, H)).with_duration(2.5).with_effects([vfx.CrossFadeIn(0.4), vfx.CrossFadeOut(0.4)])
outro = ImageClip(p("v2_outro_dow.png")).resized((W, H)).with_duration(3.0).with_effects([vfx.CrossFadeIn(0.4), vfx.CrossFadeOut(0.4)])
captioned = CompositeVideoClip([demo] + caption_clips(demo.duration))
seq = concatenate_videoclips([intro, captioned, outro], method="compose")
audio = AudioFileClip(p("dow_audio_final.wav")).subclipped(0, seq.duration)
seq = seq.with_audio(audio)
seq.write_videofile(p("DoctorsOnWheels-v2.mp4"), codec="libx264", audio_codec="aac", fps=30,
                    preset="slow", threads=4,
                    ffmpeg_params=["-crf", "16", "-pix_fmt", "yuv420p", "-b:a", "192k", "-ar", "48000"])
print("WROTE DoctorsOnWheels-v2.mp4")
