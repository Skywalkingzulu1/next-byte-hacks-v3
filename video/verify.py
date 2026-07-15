from moviepy import VideoFileClip
v = VideoFileClip("video/PriorAuthFlow-demo.mp4")
print("duration", round(v.duration, 1))
print("size", v.size)
print("fps", v.fps)
print("has_audio", v.audio is not None)
if v.audio is not None:
    print("audio_duration", round(v.audio.duration, 1))
