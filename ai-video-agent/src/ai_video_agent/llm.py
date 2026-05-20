from __future__ import annotations

import json
import textwrap
from typing import Any

import requests

from .config import Settings
from .models import STYLE_BRIEF, Scene, ShortClip, VideoPlan


PLANNER_SYSTEM = """You are a cinematic video automation planner.
Create an original English long-form fantasy narration plan.
Return valid JSON only. Do not copy living artists. Use an original whimsical
storybook animation direction with coherent characters, locations, and mood."""


def build_plan(
    settings: Settings,
    theme: str,
    target_hours: float,
    scene_count: int,
    short_count: int,
) -> VideoPlan:
    if settings.openai_api_key:
        try:
            return _build_openai_plan(settings, theme, target_hours, scene_count, short_count)
        except Exception as exc:
            print(f"OpenAI planning failed, using local fallback: {exc}")

    return _fallback_plan(theme, target_hours, scene_count, short_count)


def _build_openai_plan(
    settings: Settings,
    theme: str,
    target_hours: float,
    scene_count: int,
    short_count: int,
) -> VideoPlan:
    user_prompt = f"""
    Theme: {theme}
    Target runtime: {target_hours:.1f} hours
    Scene count: {scene_count}
    Short clip count: {short_count}

    Return this exact JSON shape:
    {{
      "title": "...",
      "logline": "...",
      "style_brief": "{STYLE_BRIEF}",
      "chapters": ["..."],
      "scenes": [
        {{
          "index": 1,
          "title": "...",
          "narration": "120-250 words of English narration",
          "visual_prompt": "specific image-to-video prompt",
          "mood": "...",
          "duration_seconds": 8
        }}
      ],
      "shorts": [
        {{
          "index": 1,
          "title": "...",
          "hook": "short opening line",
          "source_scene_indexes": [1, 2],
          "caption": "burned-in caption text",
          "duration_seconds": 35
        }}
      ]
    }}

    Make the story emotionally cinematic, coherent, and safe for YouTube.
    The short clips should be punchy vertical moments derived from the long video.
    """

    response = requests.post(
        "https://api.openai.com/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {settings.openai_api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": settings.openai_model,
            "messages": [
                {"role": "system", "content": PLANNER_SYSTEM},
                {"role": "user", "content": textwrap.dedent(user_prompt)},
            ],
            "response_format": {"type": "json_object"},
        },
        timeout=120,
    )
    response.raise_for_status()
    content = response.json()["choices"][0]["message"]["content"]
    return _parse_plan(json.loads(content), scene_count, short_count)


def _parse_plan(payload: dict[str, Any], scene_count: int, short_count: int) -> VideoPlan:
    scenes = [Scene(**scene) for scene in payload.get("scenes", [])[:scene_count]]
    shorts = [ShortClip(**short) for short in payload.get("shorts", [])[:short_count]]
    if not scenes:
        raise ValueError("Planner returned no scenes")
    if not shorts:
        raise ValueError("Planner returned no shorts")
    return VideoPlan(
        title=payload.get("title", "Untitled Fantasy Journey"),
        logline=payload.get("logline", ""),
        style_brief=payload.get("style_brief", STYLE_BRIEF),
        chapters=list(payload.get("chapters", [])),
        scenes=scenes,
        shorts=shorts,
    )


def _fallback_plan(theme: str, target_hours: float, scene_count: int, short_count: int) -> VideoPlan:
    duration = 8
    chapters = [
        "The Whisper at Dawn",
        "The Road Through the Rain Garden",
        "The Lantern City Beneath the Roots",
        "The Promise at Moonrise",
    ]
    scenes: list[Scene] = []
    for index in range(1, scene_count + 1):
        chapter = chapters[(index - 1) % len(chapters)]
        title = f"{chapter} {index}"
        narration = (
            f"In this part of the journey, the world of {theme} opens a little wider. "
            "A quiet hero follows a trail of blue lanterns through moss, rain, and old stone, "
            "learning that courage can be gentle and wonder can survive even in forgotten places. "
            "The scene should feel cinematic, emotional, and easy to follow for an English-speaking audience."
        )
        visual_prompt = (
            f"{STYLE_BRIEF} Scene {index}: {chapter}. A slow cinematic pan across a detailed "
            "fantasy landscape with layered foreground leaves, glowing windows, drifting clouds, "
            "and one consistent main character seen from a respectful distance."
        )
        scenes.append(
            Scene(
                index=index,
                title=title,
                narration=narration,
                visual_prompt=visual_prompt,
                mood="warm, mysterious, hopeful",
                duration_seconds=duration,
            )
        )

    shorts = [
        ShortClip(
            index=index,
            title=f"Vertical Moment {index}",
            hook="A hidden world was waiting under the forest.",
            source_scene_indexes=[((index - 1) % scene_count) + 1],
            caption="A hidden world was waiting under the forest.",
            duration_seconds=35,
        )
        for index in range(1, short_count + 1)
    ]

    return VideoPlan(
        title=f"The Lantern Road: {theme.title()}",
        logline="A gentle cinematic fantasy journey through a hidden world of memory, courage, and wonder.",
        style_brief=STYLE_BRIEF,
        chapters=chapters,
        scenes=scenes,
        shorts=shorts,
    )
