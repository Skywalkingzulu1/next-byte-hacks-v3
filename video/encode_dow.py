import os, json, subprocess, imageio_ffmpeg
HERE = os.path.dirname(os.path.abspath(__file__))
FF = imageio_ffmpeg.get_ffmpeg_exe()
meta = json.load(open(os.path.join(HERE, "meta_dow.json")))
fps = meta["frames"] / (meta["elapsed_ms"] / 1000.0)
frames = os.path.join(HERE, "frames_dow", "frame_%05d.png")
# real-time then upconvert
subprocess.run([FF, "-y", "-framerate", f"{fps:.3f}", "-i", frames,
               "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", "-preset", "slow",
               os.path.join(HERE, "dow_demo_rt.mp4")], capture_output=True)
subprocess.run([FF, "-y", "-i", os.path.join(HERE, "dow_demo_rt.mp4"),
               "-vf", "fps=30", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", "-preset", "slow",
               os.path.join(HERE, "dow_demo_raw.mp4")], capture_output=True)
print("dow_demo_raw.mp4 done")
