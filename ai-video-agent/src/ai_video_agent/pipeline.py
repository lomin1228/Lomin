from __future__ import annotations

import re
from pathlib import Path

from .config import Settings
from .llm import build_plan
from .media import (
    concatenate_clips,
    mux_audio_and_subtitles,
    render_short,
    render_silent_audio,
    write_metadata,
    write_srt,
)
from .models import VideoPlan
from .providers import generate_narration, generate_scene_clip


def run_pipeline(
    settings: Settings,
    theme: str,
    target_hours: float,
    scene_count: int | None = None,
    short_count: int | None = None,
    skip_generation: bool = False,
) -> Path:
    scene_total = scene_count or settings.default_scene_count
    short_total = short_count or settings.default_short_count
    project_slug = _slugify(theme)
    run_dir = settings.output_root / project_slug
    scenes_dir = run_dir / "scenes"
    shorts_dir = run_dir / "shorts"
    for directory in (run_dir, scenes_dir, shorts_dir):
        directory.mkdir(parents=True, exist_ok=True)

    plan_path = run_dir / "plan.json"
    if plan_path.exists():
        plan = VideoPlan.read(plan_path)
    else:
        plan = build_plan(settings, theme, target_hours, scene_total, short_total)
        plan.write(plan_path)

    srt_path = run_dir / "subtitles.srt"
    write_srt(plan, srt_path)
    write_metadata(plan, run_dir / "upload_metadata.json")
    (run_dir / "style_bible.txt").write_text(plan.style_brief, encoding="utf-8")

    if skip_generation:
        print(f"Wrote plan only: {run_dir}")
        return run_dir

    scene_clips: list[Path] = []
    for scene in plan.scenes:
        clip_path = scenes_dir / f"scene_{scene.index:03}.mp4"
        if not clip_path.exists():
            generate_scene_clip(settings, scene, clip_path)
        scene_clips.append(clip_path)

    raw_video = run_dir / "longform_raw.mp4"
    concatenate_clips(settings, scene_clips, raw_video)

    audio_path = run_dir / "narration.mp3"
    if not audio_path.exists():
        if not generate_narration(settings, plan, audio_path):
            render_silent_audio(settings, sum(scene.duration_seconds for scene in plan.scenes), audio_path)

    final_video = run_dir / "youtube_horizontal_1920x1080.mp4"
    mux_audio_and_subtitles(settings, raw_video, audio_path, srt_path, final_video)

    scene_offsets = _scene_offsets(plan)
    for short in plan.shorts:
        first_scene = short.source_scene_indexes[0] if short.source_scene_indexes else 1
        start = scene_offsets.get(first_scene, 0)
        output_path = shorts_dir / f"short_{short.index:02}_vertical_1080x1920.mp4"
        render_short(settings, short, final_video, output_path, start)

    print(f"Done: {run_dir}")
    return run_dir


def _scene_offsets(plan: VideoPlan) -> dict[int, int]:
    offsets: dict[int, int] = {}
    cursor = 0
    for scene in plan.scenes:
        offsets[scene.index] = cursor
        cursor += scene.duration_seconds
    return offsets


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", value.strip().lower()).strip("-")
    return slug or "ai-video"
