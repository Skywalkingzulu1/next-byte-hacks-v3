from moviepy import VideoFileClip
for f in ["video/DoctorsOnWheels-demo.mp4", "video/DoctorsOnWheels-promo.mp4", "video/PriorAuthFlow-demo.mp4"]:
    v = VideoFileClip(f)
    print(f, "dur", round(v.duration, 1), "size", v.size, "audio", v.audio is not None)
