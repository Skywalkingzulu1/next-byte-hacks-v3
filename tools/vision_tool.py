#!/usr/bin/env python
"""vision_tool.py — local multimodal LLM as an image-reading tool (Ollama API).

Usage:
  python vision_tool.py <image_path> ["prompt"]
Writes the model's answer to tools/vision_last.txt and prints "OK -> path".
"""
import sys, os, json, urllib.request, base64

MODEL = "moondream"  # small, reliable multimodal model for 4GB VRAM.
                    # NOTE: llama3.2-vision (mllama) failed to load on this machine
                    # ("unknown model architecture: 'mllama'") even after upgrading
                    # Ollama to 0.32.1; moondream is the working choice here.
OLLAMA_URL = "http://localhost:11434/api/chat"
DEFAULT_PROMPT = "Describe this image in detail, including objects, text, UI elements, people, and composition."

def main():
    if len(sys.argv) < 2:
        print("usage: vision_tool.py <image_path> [prompt]"); sys.exit(1)
    img = sys.argv[1]
    prompt = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_PROMPT
    if not os.path.exists(img):
        print(f"ERROR: image not found: {img}"); sys.exit(2)

    with open(img, "rb") as f:
        b64 = base64.b64encode(f.read()).decode()

    payload = {
        "model": MODEL,
        "messages": [
            {"role": "user", "content": prompt, "images": [b64]}
        ],
        "stream": False,
    }
    req = urllib.request.Request(
        OLLAMA_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=240) as resp:
            data = json.loads(resp.read().decode("utf-8"))
        answer = data.get("message", {}).get("content", "")
    except Exception as e:
        answer = f"ERROR: {e}"

    out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "vision_last.txt")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(answer)
    print("OK -> " + out_path)

if __name__ == "__main__":
    main()
