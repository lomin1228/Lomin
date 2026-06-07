from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover - optional at runtime
    load_dotenv = None


@dataclass(frozen=True)
class Settings:
    project_root: Path
    output_root: Path
    openai_api_key: str | None
    openai_model: str
    elevenlabs_api_key: str | None
    elevenlabs_voice_id: str
    video_provider_command: str | None
    ffmpeg_bin: str
    ffprobe_bin: str
    default_clip_seconds: int
    default_scene_count: int
    default_short_count: int

    @classmethod
    def load(cls, project_root: Path | None = None) -> "Settings":
        root = project_root or Path.cwd()
        env_path = root / ".env"
        if load_dotenv and env_path.exists():
            load_dotenv(env_path)

        return cls(
            project_root=root,
            output_root=Path(os.getenv("OUTPUT_ROOT", root / "outputs")).expanduser(),
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            openai_model=os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
            elevenlabs_api_key=os.getenv("ELEVENLABS_API_KEY"),
            elevenlabs_voice_id=os.getenv("ELEVENLABS_VOICE_ID", "Rachel"),
            video_provider_command=os.getenv("VIDEO_PROVIDER_COMMAND"),
            ffmpeg_bin=os.getenv("FFMPEG_BIN", "ffmpeg"),
            ffprobe_bin=os.getenv("FFPROBE_BIN", "ffprobe"),
            default_clip_seconds=int(os.getenv("DEFAULT_CLIP_SECONDS", "8")),
            default_scene_count=int(os.getenv("DEFAULT_SCENE_COUNT", "36")),
            default_short_count=int(os.getenv("DEFAULT_SHORT_COUNT", "20")),
        )
