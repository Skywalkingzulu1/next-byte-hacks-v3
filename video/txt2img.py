import argparse, pathlib, torch
from diffusers import StableDiffusionPipeline

OUT = pathlib.Path(__file__).resolve().parent / "images"
OUT.mkdir(exist_ok=True)

# Lightweight SD 1.5 checkpoint (runs comfortably on a 4GB RTX 3050).
MODEL = "runwayml/stable-diffusion-v1-5"

parser = argparse.ArgumentParser(description="Local Stable Diffusion txt2img (RTX 3050)")
parser.add_argument("prompt", help="text prompt")
parser.add_argument("-n", "--neg", default="blurry, low quality, deformed, watermark, text, extra limbs", help="negative prompt")
parser.add_argument("-s", "--steps", type=int, default=30)
parser.add_argument("-W", "--width", type=int, default=512)
parser.add_argument("-H", "--height", type=int, default=512)
parser.add_argument("-g", "--guidance", type=float, default=7.5)
parser.add_argument("-o", "--out", default=str(OUT / "output.png"))
args = parser.parse_args()

dtype = torch.float16 if torch.cuda.is_available() else torch.float32
device = "cuda" if torch.cuda.is_available() else "cpu"

print(f"Loading {MODEL} on {device} ({dtype})...")
pipe = StableDiffusionPipeline.from_pretrained(MODEL, torch_dtype=dtype)
pipe = pipe.to(device)
pipe.enable_attention_slicing()  # keeps VRAM low on 4GB
pipe.enable_model_cpu_offload() if hasattr(pipe, "enable_model_cpu_offload") else None

print("Generating...")
image = pipe(
    prompt=args.prompt,
    negative_prompt=args.neg,
    num_inference_steps=args.steps,
    guidance_scale=args.guidance,
    width=args.width,
    height=args.height,
).images[0]

path = pathlib.Path(args.out)
image.save(path)
print("Saved:", path.resolve())
