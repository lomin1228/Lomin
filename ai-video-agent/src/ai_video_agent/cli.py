from __future__ import annotations

import argparse
from pathlib import Path

from .config import Settings
from .pipeline import run_pipeline


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate long-form AI videos and vertical shorts.")
    parser.add_argument("theme", help="Story/video theme to generate.")
    parser.add_argument("--hours", type=float, default=2.0, help="Target long-form runtime in hours.")
    parser.add_argument("--scenes", type=int, default=None, help="Number of source scenes/clips.")
    parser.add_argument("--shorts", type=int, default=None, help="Number of vertical shorts to create.")
    parser.add_argument("--plan-only", action="store_true", help="Only create the plan and metadata.")
    parser.add_argument("--project-root", type=Path, default=Path.cwd(), help="Project root containing .env.")
    args = parser.parse_args()

    settings = Settings.load(args.project_root)
    run_pipeline(
        settings=settings,
        theme=args.theme,
        target_hours=args.hours,
        scene_count=args.scenes,
        short_count=args.shorts,
        skip_generation=args.plan_only,
    )


if __name__ == "__main__":
    main()
