# Field Notes — documentary studio

Local pipeline for a flashcard-cartoon explainer channel. The channel target is 15–20 minutes. The pilot in this folder is a 5-minute research short on iPhone Duo.

The film is drawn in Remotion from a sourced script. It does not call a video model. Charts are drawn with D3 from the evidence file. The map uses Natural Earth 110m land (public domain) and capitals of the countries Apple named.

## Make the pilot

```bash
cd studio
npm install
npm test
npm run produce
npm run studio
```

`produce` seeds the project, writes an original music bed, narrates English plus Spanish and Chinese with edge-tts, builds the timeline and lyric files, refuses to render if quality checks fail, then exports a 1920×1080 master.

Useful pieces:

| Command | What it does |
| --- | --- |
| `npm run seed` | Writes the project, source manifest, and SQLite record |
| `npm run narrate` | Speech, with retries. English rate is adjusted toward 5 minutes |
| `npm run timeline` | Shot timing, English lyric cues, `en`/`es`/`zh` subtitles |
| `npm test` | Every spoken figure must appear in that segment's evidence |
| `npm run qa` | Evidence checks plus duration, once a timeline exists |
| `npm run studio` | Review desk at http://127.0.0.1:3000 |

Outputs:

- `out/iphone-duo-master.mp4`
- `public/projects/iphone-duo/subtitles/en.srt`
- `public/projects/iphone-duo/subtitles/es.srt`
- `public/projects/iphone-duo/subtitles/zh.srt`
- `data/iphone-duo/SOURCES.md`

## Providers

Copy `.env.example` to `.env`. Empty keys stay unavailable. Runway, fal, and ElevenLabs are not called. Claude is not called; the pilot's research is the checked-in evidence, taken from pages that were opened.

Approved final shots use `provider: remotion`. A paid provider cannot be marked final in this build, which is what the QA check enforces.

## Editing one shot

Shots live in `src/content/iphone-duo.ts` and are timed in `public/projects/iphone-duo/timeline.json`. After a visual change, render a frame range instead of the whole film:

```bash
npx remotion render src/remotion/index.ts Documentary out/shot.mp4 --frames=0-90
```
