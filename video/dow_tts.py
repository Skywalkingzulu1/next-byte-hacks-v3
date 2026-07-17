import numpy as np
import soundfile as sf
from kokoro import KPipeline

TEXT = (
    "Doctors on Wheels brings the doctor to you. "
    "In South Africa, quality care should not depend on where you live or how you get to a clinic. "
    "With Doctors on Wheels, you can see a doctor by secure video call, or book a home visit where the doctor comes to your door. "
    "Open the app and create your account in seconds. "
    "Sign in with the demo login, and your dashboard appears, showing your appointments, your balance, and any discounts you have earned. "
    "Need to see someone? Find a doctor and choose how you want the visit. "
    "A video call from anywhere, or a home visit, with the doctor travelling to your address. "
    "Before the consultation, a rich triage questionnaire captures your chief complaint, how long your symptoms have lasted, your pain on a scale of zero to ten, your current medication, allergies, and any red flags like chest pain or difficulty breathing. "
    "That means the doctor walks in already prepared. "
    "When you confirm your booking, you pay securely with Yoco, by credit or debit card, in Rands, with call-out fees shown up front. "
    "You can even add a tip, and one hundred percent of it goes straight to your doctor. "
    "After the visit, rate your experience and report any issue. "
    "Doctors on Wheels. Care that comes to you."
)

pipeline = KPipeline(lang_code="a")
chunks = []
for gs, ps, audio in pipeline(TEXT, voice="am_adam", speed=1.0):
    chunks.append(audio)
audio = np.concatenate(chunks) if chunks else np.zeros(24000, dtype=np.float32)
sf.write("video/dow_voiceover.wav", audio, 24000)
print(f"dow_voiceover.wav: {len(audio)/24000:.1f}s")
