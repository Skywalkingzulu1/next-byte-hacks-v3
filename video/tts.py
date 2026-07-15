import numpy as np
import soundfile as sf
from kokoro import KPipeline

TEXT = (
    "Physicians spend thirteen hours every week on prior authorization, "
    "and sixty-eight percent of denials happen because of missing clinical data. "
    "Meet PriorAuthFlow. "
    "Paste a patient chart and a CPT code, and a five-agent pipeline builds a submit-ready prior authorization packet. "
    "Watch it run. "
    "The intake agent structures the request. "
    "The chart retriever pulls diagnoses, labs, and prior treatments. "
    "The criteria matcher checks the payer's rules. "
    "The evidence builder assembles the packet. "
    "Here the chart is complete, so the submitter sends it to the payer's electronic prior authorization endpoint. "
    "Now a chart with missing labs. "
    "The escalation agent catches the gap and flags it for clinician review before submission, preventing a denial. "
    "Under sixty seconds from chart to a submit-ready packet, with a human in the loop only when needed. "
    "PriorAuthFlow. Callable, paid, auditable."
)

pipeline = KPipeline(lang_code="a")  # American English
chunks = []
rate = 24000
for gs, ps, audio in pipeline(TEXT, voice="af_heart", speed=1.0):
    chunks.append(audio)
audio = np.concatenate(chunks) if chunks else np.zeros(rate, dtype=np.float32)
sf.write("video/voiceover.wav", audio, rate)
print(f"voiceover.wav written: {len(audio)/rate:.1f}s @ {rate}Hz")
