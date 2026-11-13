export type Reliability = "primary" | "secondary" | "derived";

export type Source = {
  id: string;
  title: string;
  publisher: string;
  url: string;
  published: string;
  accessed: string;
  kind: "primary" | "secondary";
};

export type Evidence = {
  id: string;
  claim: string;
  sourceId: string;
  passage: string;
  reliability: Reliability;
  limitations: string;
  sceneId: string;
};

export type Chapter = { id: string; title: string; summary: string };

export type Segment = {
  id: string;
  chapterId: string;
  narration: string;
  emotion: string;
  evidenceIds: string[];
  visual: string;
  transition: string;
  translations: { es: string; zh: string };
};

export type Shot = {
  id: string;
  chapterId: string;
  segmentId: string;
  scene: SceneId;
  portion: number;
  visual: string;
  subject: string;
  action: string;
  camera: string;
  movement: string;
  lighting: string;
  environment: string;
  animation: string;
  style: string;
  provider: string;
  model: string;
  prompt: string;
  negativePrompt: string;
  audio: string;
  status: "draft" | "approved" | "rejected";
  tier: "preview" | "final";
};

export type SceneId =
  | "cold-open"
  | "dimensions"
  | "aspect"
  | "stack"
  | "hinge"
  | "durability"
  | "silicon"
  | "battery"
  | "market"
  | "price"
  | "map"
  | "thesis"
  | "sources";

export type VisualBible = {
  palette: Record<string, string>;
  type: { display: string; body: string };
  strokePx: number;
  shadow: string;
  camera: string;
  characters: string;
  maps: string;
  charts: string;
};

export type LanguageTrack = {
  code: "en" | "es" | "zh";
  label: string;
  voice: string;
  role: "master" | "sidecar";
};

export type Project = {
  id: string;
  title: string;
  channel: string;
  channelTargetMinutes: [number, number];
  intendedDurationSec: number;
  durationNote: string;
  subject: string;
  researchQuestion: string;
  thesis: string;
  style: string;
  resolution: { width: number; height: number; fps: number };
  budgetUsd: number;
  sources: Source[];
  evidence: Evidence[];
  chapters: Chapter[];
  segments: Segment[];
  shots: Shot[];
  bible: VisualBible;
  languages: LanguageTrack[];
};

export type CaptionCue = { startFrame: number; endFrame: number; text: string };

export type TimelineShot = {
  id: string;
  scene: SceneId;
  startFrame: number;
  durationFrames: number;
};

export type TimelineSegment = {
  id: string;
  chapterId: string;
  sceneIds: SceneId[];
  evidenceIds: string[];
  sourceLabel: string;
  audioFile: string;
  startFrame: number;
  durationFrames: number;
  narration: string;
  captions: CaptionCue[];
  translations: { es: string; zh: string };
  shots: TimelineShot[];
};

export type Timeline = {
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  durationSec: number;
  speech: { provider: string; model: string; rate: string };
  musicFile: string;
  segments: TimelineSegment[];
};

export type QaFinding = {
  severity: "error" | "warning";
  code: string;
  message: string;
};

export type AssetRecord = {
  id: string;
  kind: "narration" | "music" | "video" | "subtitle";
  provider: string;
  model: string;
  params: Record<string, string | number | boolean>;
  taskId: string | null;
  estimatedCostUsd: number;
  output: string;
  status: "ready" | "failed" | "unavailable";
};
