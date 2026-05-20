from __future__ import annotations

from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any
import json


STYLE_BRIEF = (
    "Original hand-painted pastoral fantasy animation. Soft watercolor skies, "
    "warm lantern light, expressive characters, ancient forests, cozy villages, "
    "gentle camera movement, cinematic storybook atmosphere. Do not imitate any "
    "living artist; keep the look original and internally consistent."
)


@dataclass
class Scene:
    index: int
    title: str
    narration: str
    visual_prompt: str
    mood: str
    duration_seconds: int


@dataclass
class ShortClip:
    index: int
    title: str
    hook: str
    source_scene_indexes: list[int]
    caption: str
    duration_seconds: int


@dataclass
class VideoPlan:
    title: str
    logline: str
    style_brief: str
    chapters: list[str]
    scenes: list[Scene]
    shorts: list[ShortClip]

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    def write(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(self.to_dict(), indent=2), encoding="utf-8")

    @classmethod
    def read(cls, path: Path) -> "VideoPlan":
        payload = json.loads(path.read_text(encoding="utf-8"))
        return cls(
            title=payload["title"],
            logline=payload["logline"],
            style_brief=payload["style_brief"],
            chapters=list(payload["chapters"]),
            scenes=[Scene(**scene) for scene in payload["scenes"]],
            shorts=[ShortClip(**short) for short in payload["shorts"]],
        )
