#!/usr/bin/env python
"""ask_agy.py — ask the local Antigravity (agy) CLI a question and print its reply.

Usage:
  python tools/ask_agy.py "your question or prompt here"
  python tools/ask_agy.py "refactor this function" --model kilo/kilo-auto/free

The agy binary path is configurable via AGY_BIN env var (default below).
Output is written to tools/agy_last.txt and printed as "OK -> path".
"""
import sys, os, subprocess, shlex

AGY_BIN = os.environ.get("AGY_BIN", r"C:\Users\SBTI Gaming 11\AppData\Local\agy\bin\agy.exe")

def main():
    if len(sys.argv) < 2:
        print("usage: ask_agy.py <prompt> [--model X]")
        sys.exit(1)
    # naive arg parse: everything before a --model flag is the prompt
    args = sys.argv[1:]
    model = None
    prompt_parts = []
    i = 0
    while i < len(args):
        if args[i] == "--model" and i + 1 < len(args):
            model = args[i + 1]; i += 2; continue
        prompt_parts.append(args[i]); i += 1
    prompt = " ".join(prompt_parts)

    cmd = [AGY_BIN, "--print", prompt]
    if model:
        cmd += ["--model", model]

    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=360,
                           encoding="utf-8", errors="replace")
        out = (r.stdout or "") + (r.stderr or "")
        if r.returncode != 0 and not r.stdout.strip():
            out = "ERROR (exit %d): %s" % (r.returncode, r.stderr.strip() or r.stdout.strip())
    except Exception as e:
        out = "ERROR: %s" % e

    out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "agy_last.txt")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(out)
    print("OK -> " + out_path)

if __name__ == "__main__":
    main()
