from __future__ import annotations

import json
import shlex
import subprocess
from pathlib import Path

import requests

from .config import Settings
from .media import render_placeholder_clip
from .models import Scene, VideoPlan


def generate_scene_clip(settings: Settings, scene: Scene, output_path: Path) -> None:
    """Generate a scene clip through a provider command or local placeholder renderer.

    VIDEO_PROVIDER_COMMAND can contain these tokens:
    {scene_json} {output_path} {prompt} {duration}

    Example:
    VIDEO_PROVIDER_COMMAND='python tools/kling_generate.py --scene {scene_json} --out {output_path}'
    """
    if not settings.video_provider_command:
        render_placeholder_clip(settings, scene, output_path)
        return

    scene_json = output_path.with_suffix(".scene.json")
    scene_json.write_text(json.dumps(scene.__dict__, indent=2), encoding="utf-8")
    command = settings.video_provider_command.format(
        scene_json=shlex.quote(str(scene_json)),
        output_path=shlex.quote(str(output_path)),
        prompt=shlex.quote(scene.visual_prompt),
        duration=scene.duration_seconds,
    )
    print(f"$ {command}")
    subprocess.run(command, shell=True, check=True)


def generate_narration(settings: Settings, plan: VideoPlan, output_path: Path) -> bool:
    if not settings.elevenlabs_api_key:
        return False

    text = "\n\n".join(scene.narration for scene in plan.scenes)
    response = requests.post(
        f"https://api.elevenlabs.io/v1/text-to-speech/{settings.elevenlabs_voice_id}",
        headers={
            "xi-api-key": settings.elevenlabs_api_key,
            "Content-Type": "application/json",
        },
        json={
            "text": text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {"stability": 0.55, "similarity_boost": 0.75},
        },
        timeout=300,
    )
    response.raise_for_status()
    output_path.write_bytes(response.content)
    return True
