import type { Project, QaFinding, Timeline } from "../domain/types";
import { launchCountries } from "../content/iphone-duo";

const figure = /\d+(?:\.\d+)?/g;

export function figureTokens(text: string): string[] {
  return text.match(figure) ?? [];
}

function hasBounded(haystack: string, token: string): boolean {
  const escaped = token.replace(".", "\\.");
  return new RegExp(`(?<!\\d)${escaped}(?!\\d)`).test(haystack);
}

export function checkProject(project: Project): QaFinding[] {
  const findings: QaFinding[] = [];
  const sourceIds = new Set(project.sources.map((source) => source.id));
  const evidenceIds = new Set(project.evidence.map((item) => item.id));

  for (const source of project.sources) {
    if (!source.url.startsWith("https://")) {
      findings.push({ severity: "error", code: "source-url", message: `${source.id} has no https URL.` });
    }
    if (!source.accessed) {
      findings.push({ severity: "error", code: "source-access", message: `${source.id} has no access date.` });
    }
  }

  for (const item of project.evidence) {
    if (!sourceIds.has(item.sourceId)) {
      findings.push({ severity: "error", code: "evidence-source", message: `${item.id} cites a missing source.` });
    }
    if (!item.passage.trim() || !item.limitations.trim()) {
      findings.push({ severity: "error", code: "evidence-body", message: `${item.id} needs a passage and a limitation.` });
    }
  }

  const shotPortions = new Map<string, number>();
  for (const shot of project.shots) {
    if (!project.segments.some((segment) => segment.id === shot.segmentId)) {
      findings.push({ severity: "error", code: "shot-segment", message: `${shot.id} points at a missing segment.` });
    }
    shotPortions.set(shot.segmentId, (shotPortions.get(shot.segmentId) ?? 0) + shot.portion);
    if (shot.provider !== "remotion" && shot.status === "approved" && shot.tier === "final") {
      findings.push({
        severity: "error",
        code: "unverified-provider",
        message: `${shot.id} is an approved final but its provider is not the local renderer.`,
      });
    }
  }

  for (const segment of project.segments) {
    const portion = shotPortions.get(segment.id) ?? 0;
    if (Math.abs(portion - 1) > 0.02) {
      findings.push({
        severity: "error",
        code: "shot-portion",
        message: `${segment.id} shot portions sum to ${portion.toFixed(2)}, not 1.`,
      });
    }
    if (segment.evidenceIds.length === 0) {
      findings.push({ severity: "error", code: "segment-evidence", message: `${segment.id} has no evidence.` });
    }
    const blob = project.evidence
      .filter((item) => segment.evidenceIds.includes(item.id))
      .map((item) => `${item.claim}\n${item.passage}\n${item.limitations}`)
      .join("\n");
    for (const id of segment.evidenceIds) {
      if (!evidenceIds.has(id)) {
        findings.push({ severity: "error", code: "segment-evidence", message: `${segment.id} cites missing ${id}.` });
      }
    }
    for (const token of figureTokens(segment.narration)) {
      if (!hasBounded(blob, token)) {
        findings.push({
          severity: "error",
          code: "unsourced-figure",
          message: `${segment.id} says "${token}", which is not in its evidence.`,
        });
      }
    }
    if (!segment.translations.es.trim() || !segment.translations.zh.trim()) {
      findings.push({ severity: "error", code: "translation", message: `${segment.id} is missing a translation.` });
    }
  }

  const launchPassage = project.evidence.find((item) => item.id === "e-launch")?.passage ?? "";
  const aliases: Record<string, string> = {
    "United Kingdom": "UK",
    "United States": "U.S.",
  };
  for (const country of launchCountries) {
    const needle = aliases[country.name] ?? country.name;
    if (!launchPassage.includes(needle)) {
      findings.push({
        severity: "error",
        code: "map-country",
        message: `Map dot ${country.name} is not in the launch evidence.`,
      });
    }
  }

  const words = project.segments.reduce((sum, segment) => sum + segment.narration.split(/\s+/).filter(Boolean).length, 0);
  if (words < 620 || words > 820) {
    findings.push({
      severity: "warning",
      code: "word-count",
      message: `English narration is ${words} words. A 5-minute cut wants roughly 650–780.`,
    });
  }

  return findings;
}

export function checkTimeline(project: Project, timeline: Timeline): QaFinding[] {
  const findings: QaFinding[] = [];
  if (timeline.width !== project.resolution.width || timeline.height !== project.resolution.height) {
    findings.push({ severity: "error", code: "resolution", message: "Timeline resolution does not match the project." });
  }
  if (timeline.fps !== project.resolution.fps) {
    findings.push({ severity: "error", code: "fps", message: "Timeline frame rate does not match the project." });
  }
  if (timeline.segments.length !== project.segments.length) {
    findings.push({ severity: "error", code: "timeline-segments", message: "Timeline is missing a narration segment." });
  }
  const target = project.intendedDurationSec;
  if (timeline.durationSec < target - 25 || timeline.durationSec > target + 25) {
    findings.push({
      severity: "error",
      code: "duration",
      message: `Cut is ${timeline.durationSec.toFixed(1)}s. The request was ${target}s, with 25 seconds of slack.`,
    });
  }
  for (const segment of timeline.segments) {
    if (segment.durationFrames < timeline.fps) {
      findings.push({ severity: "error", code: "short-segment", message: `${segment.id} is under one second.` });
    }
    if (segment.captions.length === 0) {
      findings.push({ severity: "warning", code: "captions", message: `${segment.id} has no lyric cues.` });
    }
  }
  return findings;
}

export function errorsOf(findings: QaFinding[]): QaFinding[] {
  return findings.filter((finding) => finding.severity === "error");
}
