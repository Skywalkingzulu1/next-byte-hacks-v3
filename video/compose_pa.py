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

# ---------- Intro (2.5s) ----------
def make_intro():
    img = Image.new("RGB", (W, H), (8, 9, 16))
    d = ImageDraw.Draw(img)
    # accent bar
    d.rectangle([0, H//2 - 4, W, H//2 + 4], fill=(99, 102, 241))
    d.text((W//2, H//2 - 120), "PriorAuthFlow", font=font(110, True), fill=(235, 235, 245), anchor="mm")
    d.text((W//2, H//2 + 10), "AI-driven prior authorization", font=font(40), fill=(160, 165, 190), anchor="mm")
    d.text((W//2, H//2 + 70), "Next Byte Hacks V3", font=font(30), fill=(120, 125, 150), anchor="mm")
    img.save(p("v2_intro.png"))

def make_outro():
    img = Image.new("RGB", (W, H), (8, 9, 16))
    d = ImageDraw.Draw(img)
    d.rectangle([0, H//2 - 4, W, H//2 + 4], fill=(34, 197, 94))
    d.text((W//2, H//2 - 90), "PriorAuthFlow", font=font(100, True), fill=(235, 235, 245), anchor="mm")
    d.text((W//2, H//2 + 20), "Callable · Paid · Auditable", font=font(42), fill=(34, 197, 94), anchor="mm")
    d.text((W//2, H//2 + 80), "github.com/Skywalkingzulu1/next-byte-hacks-v3", font=font(26), fill=(150, 155, 175), anchor="mm")
    img.save(p("v2_outro.png"))

make_intro(); make_outro()

# ---------- Caption overlay on the demo clip ----------
captions = json.load(open(p("captions_pa.json")))
def caption_clips(demo_dur):
    out = []
    for c in captions:
        start = max(0, c["start"]/1000.0)
        end = min(demo_dur, c["end"]/1000.0)
        if end <= start: continue
        # lower-third bar via TextClip (PIL-free)
        try:
            tc = (TextClip(text=c["text"], font_size=46, color="white",
                           font="C:\\Windows\\Fonts\\segoeui.ttf",
                           size=(W - 240, None), method="caption")
                  .with_position(("center", H - 180))
                  .with_start(start).with_end(end)
                  .with_effects([vfx.CrossFadeIn(0.3), vfx.CrossFadeOut(0.3)]))
            out.append(tc)
        except Exception as e:
            print("caption skip:", e)
    return out

demo = VideoFileClip(p("pa_demo_raw.mp4"))
intro = ImageClip(p("v2_intro.png")).resized((W, H)).with_duration(2.5).with_effects([vfx.CrossFadeIn(0.4), vfx.CrossFadeOut(0.4)])
outro = ImageClip(p("v2_outro.png")).resized((W, H)).with_duration(3.0).with_effects([vfx.CrossFadeIn(0.4), vfx.CrossFadeOut(0.4)])

demo = demo.with_effects([vfx.CrossFadeIn(0.4)])
captioned = CompositeVideoClip([demo] + caption_clips(demo.duration))
seq = concatenate_videoclips([intro, captioned, outro], method="compose")

audio = AudioFileClip(p("pa_audio_final.wav"))
audio = audio.subclipped(0, seq.duration)
seq = seq.with_audio(audio)

out = p("PriorAuthFlow-v2.mp4")
seq.write_videofile(out, codec="libx264", audio_codec="aac", fps=30,
                     preset="slow", threads=4,
                     ffmpeg_params=["-crf", "16", "-pix_fmt", "yuv420p", "-b:a", "192k", "-ar", "48000"])
print("WROTE", out)
