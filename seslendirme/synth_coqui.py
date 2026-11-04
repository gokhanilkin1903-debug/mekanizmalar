import json, subprocess, sys, os, wave
from TTS.utils.synthesizer import Synthesizer

D = os.path.dirname(os.path.abspath(__file__))
M = os.path.join(D, "tts_models--tr--common-voice--glow-tts")
V = os.path.join(D, "vocoder_models--tr--common-voice--hifigan")
OUT = os.path.join(D, "seg")
os.makedirs(OUT, exist_ok=True)

# (start second, slot end second, text) — lowercase, numbers as words
SEGS = [
    (0.3, 4.2, "tek motorla, iki mil ters yönde dönebilir mi?"),
    (4.4, 11.2, "sırrı, iki yüzü de dişli olan bu taç dişli. mavi pinyon giriş; yeşil pinyon ve dikey mil çıkış."),
    (11.4, 18.4, "mavi dişli üstten, yeşil dişli alttan kavrar. bu yüzden ikisi ters yönlerde döner."),
    (18.8, 25.0, "dişlerin kavradığı bu noktada, hareket doksan derece yön değiştirir."),
    (25.3, 31.1, "on dört diş, kırk dişi çevirir. taç dişli, üçte bir hızla döner."),
    (31.3, 36.0, "mikserlerden saatlere kadar her yerde! takip et."),
]

syn = Synthesizer(tts_checkpoint=os.path.join(M, "model_file.pth"), tts_config_path=os.path.join(M, "config.json"),
                  vocoder_checkpoint=os.path.join(V, "model_file.pth"), vocoder_config=os.path.join(V, "config.json"), use_cuda=False)

plan = []
for i, (a, b, text) in enumerate(SEGS):
    raw = os.path.join(OUT, f"raw{i}.wav")
    syn.save_wav(syn.tts(text), raw)
    with wave.open(raw) as w: dur = w.getnframes() / w.getframerate()
    slot = b - a
    tempo = min(1.25, max(1.1, dur / slot))
    fin = os.path.join(OUT, f"seg{i}.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", raw, "-af", f"atempo={tempo:.3f},highpass=f=70,loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "44100", "-ac", "2", fin], check=True)
    plan.append({"i": i, "start": a, "slot": slot, "raw": round(dur, 2), "tempo": round(tempo, 3), "final": round(dur / tempo, 2)})
    print(plan[-1], flush=True)
json.dump(plan, open(os.path.join(OUT, "plan.json"), "w"), indent=1)
