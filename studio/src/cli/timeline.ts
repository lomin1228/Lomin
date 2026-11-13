import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { iphoneDuo } from "../content/iphone-duo";
import type { CaptionCue, Timeline, TimelineSegment } from "../domain/types";
import { projectDataDir, projectPublicDir, studioRoot, timelinePath } from "../lib/paths";

const FPS = iphoneDuo.resolution.fps;
const GAP_FRAMES = 8;

type Cue = { start: number; end: number; text: string };

function mediaDuration(file: string): number {
  const output = execFileSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file],
    { encoding: "utf8" },
  );
  return Number(output.trim());
}

function vttSeconds(value: string): number {
  const clean = value.trim().replace(",", ".");
  const [hours, minutes, rest] = clean.split(":");
  const [seconds, millis = "0"] = rest.split(".");
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds) + Number(millis) / 1000;
}

export function parseVtt(text: string): Cue[] {
  const cues: Cue[] = [];
  for (const block of text.replace(/\r/g, "").split(/\n\n+/)) {
    const lines = block.split("\n").filter((line) => line.trim().length > 0);
    const timingIndex = lines.findIndex((line) => line.includes("-->"));
    if (timingIndex < 0) continue;
    const [rawStart, rawEnd] = lines[timingIndex].split("-->").map((part) => part.trim());
    const body = lines
      .slice(timingIndex + 1)
      .join(" ")
      .replace(/<[^>]+>/g, "")
      .trim();
    if (!body) continue;
    cues.push({ start: vttSeconds(rawStart), end: vttSeconds(rawEnd), text: body });
  }
  return cues;
}

function cuesToFrames(cues: Cue[], durationFrames: number): CaptionCue[] {
  const frames: CaptionCue[] = [];
  for (const cue of cues) {
    const startFrame = Math.max(0, Math.round(cue.start * FPS));
    const endFrame = Math.min(durationFrames, Math.max(startFrame + 1, Math.round(cue.end * FPS)));
    const previous = frames[frames.length - 1];
    if (previous && startFrame - previous.startFrame < 12) {
      previous.endFrame = endFrame;
      previous.text = `${previous.text} ${cue.text}`.replace(/\s+/g, " ");
      continue;
    }
    frames.push({ startFrame, endFrame, text: cue.text });
  }
  return frames;
}

function sentenceCues(text: string, durationFrames: number): CaptionCue[] {
  const parts = text.split(/(?<=[。！？.!?])\s+/).map((part) => part.trim()).filter(Boolean);
  const pieces = parts.length > 0 ? parts : [text];
  const weight = pieces.reduce((sum, part) => sum + part.length, 0) || 1;
  const cues: CaptionCue[] = [];
  let cursor = 0;
  pieces.forEach((part, index) => {
    const span = index === pieces.length - 1
      ? durationFrames - cursor
      : Math.max(1, Math.round((part.length / weight) * durationFrames));
    cues.push({ startFrame: cursor, endFrame: Math.min(durationFrames, cursor + span), text: part });
    cursor += span;
  });
  return cues;
}

function srtStamp(frame: number): string {
  const total = Math.round((frame / FPS) * 1000);
  const hours = Math.floor(total / 3_600_000);
  const minutes = Math.floor((total % 3_600_000) / 60_000);
  const seconds = Math.floor((total % 60_000) / 1000);
  const millis = total % 1000;
  const pad = (value: number, length = 2) => String(value).padStart(length, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${pad(millis, 3)}`;
}

function writeSrt(file: string, cues: { start: number; end: number; text: string }[]): void {
  const body = cues
    .map((cue, index) => `${index + 1}\n${srtStamp(cue.start)} --> ${srtStamp(cue.end)}\n${cue.text}\n`)
    .join("\n");
  fs.writeFileSync(file, body);
}

export function buildTimeline(): Timeline {
  const pacePath = path.join(projectPublicDir, "pace.json");
  const speechRate = fs.existsSync(pacePath)
    ? (JSON.parse(fs.readFileSync(pacePath, "utf8")).label as string)
    : (JSON.parse(fs.readFileSync(path.join(projectPublicDir, "assets.json"), "utf8")).speechRate as string);
  let cursor = 0;
  const segments: TimelineSegment[] = iphoneDuo.segments.map((segment) => {
    const audioName = `audio/en/${segment.id}.mp3`;
    const audioPath = path.join(projectPublicDir, audioName);
    const seconds = mediaDuration(audioPath);
    const durationFrames = Math.max(1, Math.round(seconds * FPS));
    const vtt = fs.readFileSync(path.join(projectPublicDir, "audio", "en", `${segment.id}.vtt`), "utf8");
    const captions = cuesToFrames(parseVtt(vtt), durationFrames);
    const shotsForSegment = iphoneDuo.shots.filter((shot) => shot.segmentId === segment.id);
    let shotCursor = 0;
    const shots = shotsForSegment.map((shot, index) => {
      const frames = index === shotsForSegment.length - 1
        ? durationFrames - shotCursor
        : Math.round(shot.portion * durationFrames);
      const entry = { id: shot.id, scene: shot.scene, startFrame: shotCursor, durationFrames: frames };
      shotCursor += frames;
      return entry;
    });
    const publishers = [...new Set(segment.evidenceIds.map((id) => {
      const evidence = iphoneDuo.evidence.find((item) => item.id === id);
      return iphoneDuo.sources.find((item) => item.id === evidence?.sourceId)?.publisher ?? "";
    }).filter(Boolean))];
    const timelineSegment: TimelineSegment = {
      id: segment.id,
      chapterId: segment.chapterId,
      sceneIds: shots.map((shot) => shot.scene),
      evidenceIds: segment.evidenceIds,
      sourceLabel: publishers.join(" · ") || "Source on file",
      audioFile: `projects/iphone-duo/${audioName}`,
      startFrame: cursor,
      durationFrames,
      narration: segment.narration,
      captions: captions.length > 0 ? captions : sentenceCues(segment.narration, durationFrames),
      translations: segment.translations,
      shots,
    };
    cursor += durationFrames + GAP_FRAMES;
    return timelineSegment;
  });
  const durationInFrames = cursor - GAP_FRAMES;
  const timeline: Timeline = {
    fps: FPS,
    width: iphoneDuo.resolution.width,
    height: iphoneDuo.resolution.height,
    durationInFrames,
    durationSec: durationInFrames / FPS,
    speech: { provider: "edge-tts", model: "en-US-AndrewNeural", rate: speechRate },
    musicFile: "projects/iphone-duo/audio/score.wav",
    segments,
  };

  const subtitleDir = path.join(projectPublicDir, "subtitles");
  fs.mkdirSync(subtitleDir, { recursive: true });
  const englishCues = segments.flatMap((segment) =>
    segment.captions.map((cue) => ({
      start: segment.startFrame + cue.startFrame,
      end: segment.startFrame + cue.endFrame,
      text: cue.text,
    })),
  );
  writeSrt(path.join(subtitleDir, "en.srt"), englishCues);
  for (const language of ["es", "zh"] as const) {
    const cues = segments.flatMap((segment) =>
      sentenceCues(segment.translations[language], segment.durationFrames).map((cue) => ({
        start: segment.startFrame + cue.startFrame,
        end: segment.startFrame + cue.endFrame,
        text: cue.text,
      })),
    );
    writeSrt(path.join(subtitleDir, `${language}.srt`), cues);
  }

  fs.mkdirSync(projectDataDir, { recursive: true });
  const body = JSON.stringify(timeline, null, 2);
  fs.writeFileSync(timelinePath, body);
  fs.writeFileSync(path.join(projectDataDir, "timeline.json"), body);
  fs.writeFileSync(path.join(studioRoot, "src/remotion/timeline.json"), body);
  console.log(`Timeline ${timeline.durationSec.toFixed(1)}s, ${timeline.durationInFrames} frames`);
  return timeline;
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) buildTimeline();
