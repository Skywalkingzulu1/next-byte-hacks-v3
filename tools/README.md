# Vision Tool (local image-reading LLM)

Lets the agent "see" images locally via Ollama + a multimodal model.

## Setup
- Ollama installed and running (`ollama serve`).
- A vision model pulled. Default: `moondream` (tiny, runs on 4GB VRAM).
  - To use a larger model: `ollama pull llama3.2-vision` and change `MODEL` in
    `vision_tool.py` (note: mllama failed to load on this PC even on Ollama 0.32.1).

## Usage
```
python tools/vision_tool.py <image_path> ["your question about the image"]
```
- Prints `OK -> tools/vision_last.txt` and writes the model's answer there
  (output is written to a file to avoid Windows console Unicode issues).
- Read the result with:
```
Get-Content tools/vision_last.txt -Encoding UTF8
```

## Why this exists
The agent has no native vision. This tool calls a local multimodal LLM so the
agent can inspect generated images, screenshots, CAD previews, etc.
