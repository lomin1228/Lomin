#!/usr/bin/env python3
"""Original bed for the pilot. 32 beats at 90 bpm, looping cleanly."""

import math
import struct
import wave
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "projects" / "iphone-duo" / "audio" / "score.wav"
SR = 44100
BPM = 90
BEATS = 32
SAMPLES = int(SR * 60 / BPM) * BEATS

NOTES = [220.00, 261.63, 329.63, 261.63]  # A minor triad, one note per beat


def main() -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    frames = bytearray()
    for index in range(SAMPLES):
        beat = index / (SR * 60 / BPM)
        note = NOTES[int(beat) % len(NOTES)]
        local = beat - math.floor(beat)
        envelope = math.sin(math.pi * min(local, 1)) ** 2 * (1 - local)
        tone = math.sin(2 * math.pi * note * index / SR)
        fifth = 0.35 * math.sin(2 * math.pi * note * 1.5 * index / SR)
        sample = 0.18 * envelope * (tone + fifth)
        frames += struct.pack("<h", max(-32767, min(32767, int(sample * 32767))))
    with wave.open(str(OUT), "w") as handle:
        handle.setnchannels(1)
        handle.setsampwidth(2)
        handle.setframerate(SR)
        handle.writeframes(frames)
    print(f"Wrote {OUT} ({SAMPLES / SR:.2f}s)")


if __name__ == "__main__":
    main()
