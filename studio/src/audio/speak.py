#!/usr/bin/env python3
"""Synthesize one narration file with retries. Edge's service sometimes returns no audio."""

import asyncio
import json
import sys
from pathlib import Path

from edge_tts import Communicate


def stamp(ticks: int) -> str:
    millis = int(ticks / 10_000)
    hours, millis = divmod(millis, 3_600_000)
    minutes, millis = divmod(millis, 60_000)
    seconds, millis = divmod(millis, 1000)
    return f"{hours:02d}:{minutes:02d}:{seconds:02d}.{millis:03d}"


def write_vtt(metadata: Path, destination: Path, fallback: str) -> None:
    cues = []
    if metadata.exists():
        for line in metadata.read_text(encoding="utf-8").splitlines():
            if not line.strip():
                continue
            item = json.loads(line)
            if item.get("type") != "SentenceBoundary":
                continue
            start = int(item["offset"])
            end = start + int(item["duration"])
            cues.append((start, end, item["text"].strip()))
    if not cues:
        cues = [(0, 600_000_000, fallback.strip())]
    lines = ["WEBVTT", ""]
    for start, end, text in cues:
        lines.append(f"{stamp(start)} --> {stamp(end)}")
        lines.append(text)
        lines.append("")
    destination.write_text("\n".join(lines), encoding="utf-8")


async def speak(text: str, voice: str, rate: str, media: Path, subtitles: Path) -> None:
    partial_audio = media.with_suffix(".partial.mp3")
    partial_meta = media.with_suffix(".partial.jsonl")
    partial_vtt = subtitles.with_suffix(".partial.vtt")
    last_error = "no attempt"
    for attempt in range(1, 9):
        try:
            communicate = Communicate(text, voice, rate=rate)
            await communicate.save(str(partial_audio), str(partial_meta))
            if partial_audio.stat().st_size < 1000:
                raise RuntimeError("audio file was empty")
            write_vtt(partial_meta, partial_vtt, text)
            partial_audio.replace(media)
            partial_meta.replace(media.with_suffix(".jsonl"))
            partial_vtt.replace(subtitles)
            return
        except Exception as error:
            last_error = f"{type(error).__name__}: {error}"
            print(f"attempt {attempt} failed: {last_error}", file=sys.stderr)
            await asyncio.sleep(1.2 * attempt)
    raise SystemExit(last_error)


def main() -> None:
    text_file, voice, rate, media, subtitles = sys.argv[1:]
    text = Path(text_file).read_text(encoding="utf-8").strip()
    asyncio.run(speak(text, voice, rate, Path(media), Path(subtitles)))


if __name__ == "__main__":
    main()
