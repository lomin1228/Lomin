# AI Video Agent

Automates the production of:

- one horizontal YouTube video at `1920x1080`
- English narration
- subtitles
- 20 vertical clips at `1080x1920` for TikTok, Instagram Reels, and YouTube Shorts
- upload metadata

The project avoids copying a living artist directly. It uses an original hand-painted pastoral fantasy direction that keeps the mood coherent without naming or imitating a specific living creator.

## How It Works

1. Creates a cinematic story plan with chapters, scenes, narration, and short-form moments.
2. Writes a style bible and subtitle file.
3. Generates one clip per scene.
4. Builds the long horizontal YouTube video.
5. Burns subtitles into the video.
6. Extracts 20 vertical clips from the finished long video.

If API keys are not configured, the project still runs with local FFmpeg placeholder clips. This lets you test the full pipeline before paying for generation.

## Setup

Install FFmpeg first:

```bash
brew install ffmpeg
```

Create and activate a virtual environment:

```bash
cd ai-video-agent
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
cp .env.example .env
```

Add keys to `.env` if you want real planning and narration:

```bash
OPENAI_API_KEY=...
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=...
```

## Run A Plan Only

```bash
ai-video-agent "a lost child finds a hidden forest kingdom after rain" --plan-only
```

This creates:

```text
outputs/<theme>/
  plan.json
  subtitles.srt
  style_bible.txt
  upload_metadata.json
```

## Render A Test Video

```bash
ai-video-agent "a lost child finds a hidden forest kingdom after rain" --scenes 12 --shorts 20
```

The final files appear in:

```text
outputs/<theme>/
  youtube_horizontal_1920x1080.mp4
  shorts/
    short_01_vertical_1080x1920.mp4
    ...
```

For a 2-3 hour production, increase the scene count. AI video models usually generate short clips, so long videos are built by stitching many consistent short clips together:

```bash
ai-video-agent "your full story theme" --hours 2.5 --scenes 900 --shorts 20
```

At 8 seconds per clip, 900 clips is about 2 hours.

## Connect A Real Video Provider

Most video APIs change quickly, so this project uses a provider command hook. Put your provider script behind `VIDEO_PROVIDER_COMMAND` and the pipeline will call it for every scene.

Example `.env`:

```bash
VIDEO_PROVIDER_COMMAND=python tools/kling_generate.py --scene {scene_json} --out {output_path}
```

Available tokens:

- `{scene_json}`: JSON file containing the scene title, narration, visual prompt, mood, and duration.
- `{output_path}`: where the generated `.mp4` should be written.
- `{prompt}`: the scene visual prompt as text.
- `{duration}`: scene duration in seconds.

Recommended providers to connect first:

- Runway, Kling, Veo, Luma, or Seedance for image-to-video clips.
- ElevenLabs for high-quality English narration.
- FFmpeg for final rendering and vertical clips.

## Quality Workflow

For best coherence:

- Generate character sheets and location reference images first.
- Use image-to-video instead of pure text-to-video.
- Keep one style bible for every prompt.
- Review `plan.json` before rendering hundreds of paid clips.
- Start with `--scenes 12` as a cheap proof before scaling to 900+ clips.

## Output Formats

- YouTube long-form: `1920x1080`, horizontal, subtitles burned in.
- Shorts/Reels/TikTok: `1080x1920`, vertical, large caption overlay.

