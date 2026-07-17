import os, json, subprocess, imageio_ffmpeg

HERE = os.path.dirname(os.path.abspath(__file__))
FF = imageio_ffmpeg.get_ffmpeg_exe()
meta = json.load(open(os.path.join(HERE, "meta_pa.json")))
fps = meta["frames"] / (meta["elapsed_ms"] / 1000.0)
frames = os.path.join(HERE, "frames_pa", "frame_%05d.png")
out = os.path.join(HERE, "pa_demo_raw.mp4")
# 1) encode at real fps (no speed change)
cmd = [FF, "-y", "-framerate", f"{fps:.3f}", "-i", frames,
       "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", "-preset", "slow",
       os.path.join(HERE, "pa_demo_rt.mp4")]
print("encode real-time fps=%.2f" % fps)
r = subprocess.run(cmd, capture_output=True, text=True)
print(r.returncode, (r.stderr[-200:] if r.returncode else "ok"))
# 2) upconvert to 30fps (frame duplication; fast, smooth enough for UI)
cmd2 = [FF, "-y", "-i", os.path.join(HERE, "pa_demo_rt.mp4"),
        "-vf", "fps=30", "-c:v", "libx264", "-pix_fmt", "yuv420p",
        "-crf", "16", "-preset", "slow", out]
print("interpolate -> 30fps")
r2 = subprocess.run(cmd2, capture_output=True, text=True)
print(r2.returncode, (r2.stderr[-200:] if r2.returncode else "ok"))
print("WROTE", out)
