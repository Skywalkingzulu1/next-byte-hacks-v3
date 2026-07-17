import numpy as np, soundfile as sf
from kokoro import KPipeline

TEXT = (
    "Doctors on Wheels brings the doctor to you. "
    "In South Africa, quality care should not depend on where you live or how you reach a clinic. "
    "With Doctors on Wheels, see a doctor by secure video call, or book a home visit where the doctor comes to your door. "
    "Open the app and create your account in seconds. "
    "Sign in, and your dashboard appears, showing appointments, balance, and any discounts you have earned. "
    "Need to see someone? Find a doctor and choose how you want the visit, a video call from anywhere, or a home visit to your address. "
    "Before the consultation, a rich triage questionnaire captures your symptoms, medications, allergies, and any red flags. "
    "That means the doctor arrives prepared. "
    "When you confirm, you pay securely with Yoco by card, in Rands, with call-out fees shown up front. "
    "You can even tip, and one hundred percent of it goes to your doctor. "
    "After the visit, rate your experience. "
    "Doctors on Wheels. Care that comes to you."
)
pipeline = KPipeline(lang_code="a")
chunks = [a for _, _, a in pipeline(TEXT, voice="am_michael", speed=1.0)]
audio = np.concatenate(chunks) if chunks else np.zeros(24000, dtype=np.float32)
sf.write("video/dow_voice_v2.wav", audio, 24000)
print(f"dow_voice_v2.wav: {len(audio)/24000:.1f}s")
