from __future__ import annotations

import json
import shlex
import subprocess
from pathlib import Path

from .config import Settings
from .models import Scene, ShortClip, VideoPlan


def run_command(command: list[str]) -> None:
    printable = " ".join(shlex.quote(part) for part in command)
    print(f"$ {printable}")
    subprocess.run(command, check=True)


def write_srt(plan: VideoPlan, path: Path) -> None:
    cursor = 0
    blocks: list[str] = []
    for scene in plan.scenes:
        start = _srt_time(cursor)
        cursor += scene.duration_seconds
        end = _srt_time(cursor)
        blocks.append(f"{scene.index}\n{start} --> {end}\n{scene.narration}\n")
    path.write_text("\n".join(blocks), encoding="utf-8")


def render_placeholder_clip(settings: Settings, scene: Scene, output_path: Path, vertical: bool = False) -> None:
    size = "1080x1920" if vertical else "1920x1080"
    title = _escape_drawtext(scene.title)
    subtitle = _escape_drawtext(scene.mood)
    vf = (
        f"drawtext=text='{title}':fontcolor=white:fontsize=52:"
        "x=(w-text_w)/2:y=(h-text_h)/2-80:box=1:boxcolor=black@0.35:boxborderw=24,"
        f"drawtext=text='{subtitle}':fontcolor=white:fontsize=34:"
        "x=(w-text_w)/2:y=(h-text_h)/2+10:box=1:boxcolor=black@0.25:boxborderw=18"
    )
    run_command(
        [
            settings.ffmpeg_bin,
            "-y",
            "-f",
            "lavfi",
            "-i",
            f"color=c=0x18211f:s={size}:d={scene.duration_seconds}",
            "-vf",
            vf,
            "-r",
            "24",
            "-pix_fmt",
            "yuv420p",
            str(output_path),
        ]
    )


def render_silent_audio(settings: Settings, seconds: int, output_path: Path) -> None:
    run_command(
        [
            settings.ffmpeg_bin,
            "-y",
            "-f",
            "lavfi",
            "-i",
            "anullsrc=channel_layout=stereo:sample_rate=44100",
            "-t",
            str(seconds),
            "-q:a",
            "9",
            "-acodec",
            "libmp3lame",
            str(output_path),
        ]
    )


def concatenate_clips(settings: Settings, clips: list[Path], output_path: Path) -> None:
    list_file = output_path.with_suffix(".concat.txt")
    list_file.write_text(
        "".join(f"file '{clip.resolve()}'\n" for clip in clips),
        encoding="utf-8",
    )
    run_command(
        [
            settings.ffmpeg_bin,
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(list_file),
            "-c",
            "copy",
            str(output_path),
        ]
    )


def mux_audio_and_subtitles(
    settings: Settings,
    video_path: Path,
    audio_path: Path,
    subtitle_path: Path,
    output_path: Path,
) -> None:
    subtitle_filter = f"subtitles={shlex.quote(str(subtitle_path))}:force_style='Fontsize=22,Outline=2,Shadow=1'"
    run_command(
        [
            settings.ffmpeg_bin,
            "-y",
            "-i",
            str(video_path),
            "-i",
            str(audio_path),
            "-vf",
            subtitle_filter,
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "18",
            "-c:a",
            "aac",
            "-shortest",
            str(output_path),
        ]
    )


def render_short(
    settings: Settings,
    short: ShortClip,
    source_video: Path,
    output_path: Path,
    start_seconds: int,
) -> None:
    caption = _escape_drawtext(short.caption)
    vf = (
        "scale=-2:1920,crop=1080:1920,"
        f"drawtext=text='{caption}':fontcolor=white:fontsize=58:"
        "x=(w-text_w)/2:y=h*0.72:box=1:boxcolor=black@0.45:boxborderw=24"
    )
    run_command(
        [
            settings.ffmpeg_bin,
            "-y",
            "-ss",
            str(start_seconds),
            "-i",
            str(source_video),
            "-t",
            str(short.duration_seconds),
            "-vf",
            vf,
            "-c:v",
            "libx264",
            "-preset",
            "medium",
            "-crf",
            "19",
            "-c:a",
            "aac",
            str(output_path),
        ]
    )


def write_metadata(plan: VideoPlan, path: Path) -> None:
    payload = {
        "youtube": {
            "title": plan.title,
            "description": f"{plan.logline}\n\nEnglish narration with subtitles.",
            "tags": ["ai animation", "fantasy story", "cinematic story", "ambient story"],
        },
        "shorts": [
            {"index": short.index, "title": short.title, "hook": short.hook, "caption": short.caption}
            for short in plan.shorts
        ],
    }
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def _srt_time(seconds: int) -> str:
    hours, remainder = divmod(seconds, 3600)
    minutes, secs = divmod(remainder, 60)
    return f"{hours:02}:{minutes:02}:{secs:02},000"


def _escape_drawtext(value: str) -> str:
    return value.replace("\\", "\\\\").replace(":", "\\:").replace("'", "\\'")
