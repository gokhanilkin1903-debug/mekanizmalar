import json, os, subprocess, sys, urllib.request, urllib.error
VOICE = sys.argv[1]; OUT = sys.argv[2]; SEGS = json.load(open(sys.argv[3]))
os.makedirs(OUT, exist_ok=True)
key = os.environ["ELEVENLABS_API_KEY"]
texts = [s[2] for s in SEGS]
plan = []
for i, (a, b, text) in enumerate(SEGS):
    body = {"text": text, "model_id": "eleven_multilingual_v2", "language_code": sys.argv[4] if len(sys.argv) > 4 else "tr",
            "voice_settings": {"stability": 0.5, "similarity_boost": 0.75, "style": 0.15, "use_speaker_boost": True}}
    if i > 0: body["previous_text"] = texts[i - 1]
    if i < len(texts) - 1: body["next_text"] = texts[i + 1]
    req = urllib.request.Request(f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}?output_format=mp3_44100_128",
        data=json.dumps(body).encode(), headers={"xi-api-key": key, "Content-Type": "application/json"})
    raw = os.path.join(OUT, f"raw{i}.mp3")
    if not (os.path.exists(raw) and os.path.getsize(raw) > 1000):
        try:
            with urllib.request.urlopen(req, timeout=120) as r: data = r.read()
        except urllib.error.HTTPError as e:
            print("API_HATA", e.code, e.read()[:300].decode(errors="ignore"), flush=True); sys.exit(3)
        open(raw, "wb").write(data)
    dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", raw]))
    slot = b - a
    tempo = min(1.15, max(1.0, dur / slot))
    fin = os.path.join(OUT, f"seg{i}.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", f"silenceremove=start_periods=1:start_threshold=-50dB,atempo={tempo:.3f},loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "44100", "-ac", "2", fin], check=True)
    d2 = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", fin]))
    plan.append({"i": i, "start": a, "slot": round(slot, 2), "raw": round(dur, 2), "tempo": round(tempo, 3), "final": round(d2, 2), "chars": len(text)})
    print(plan[-1], flush=True)
json.dump(plan, open(os.path.join(OUT, "plan.json"), "w"), indent=1)
