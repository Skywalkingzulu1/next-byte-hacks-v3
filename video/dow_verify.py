from moviepy import VideoFileClip
v = VideoFileClip("video/DoctorsOnWheels-demo.mp4")
print("duration", round(v.duration, 1))
print("size", v.size, "fps", v.fps)
print("has_audio", v.audio is not None)
