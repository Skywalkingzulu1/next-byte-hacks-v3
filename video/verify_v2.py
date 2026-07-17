from moviepy import VideoFileClip
v = VideoFileClip("video/PriorAuthFlow-v2.mp4")
print("dur", round(v.duration, 1), "res", v.size, "fps", v.fps, "audio", v.audio is not None)
if v.audio: print("audio_dur", round(v.audio.duration, 1))
