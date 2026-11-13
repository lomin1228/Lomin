import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { iphoneDuo } from "../content/iphone-duo";
import { openDb, saveAsset, upsertJob } from "../db/client";
import type { AssetRecord, LanguageTrack } from "../domain/types";
import { projectPublicDir, studioRoot } from "../lib/paths";

function run(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("python3", ["src/audio/speak.py", ...args], { cwd: studioRoot, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`speak.py exited ${code}`))));
  });
}

function mediaDuration(file: string): number {
  const output = execFileSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file],
    { encoding: "utf8" },
  );
  return Number(output.trim());
}

async function speak(language: LanguageTrack, segmentId: string, text: string, rate: string, force = false): Promise<AssetRecord> {
  const dir = path.join(projectPublicDir, "audio", language.code);
  fs.mkdirSync(dir, { recursive: true });
  const textFile = path.join(dir, `${segmentId}.txt`);
  const media = path.join(dir, `${segmentId}.mp3`);
  const subtitles = path.join(dir, `${segmentId}.vtt`);
  const previous = fs.existsSync(textFile) ? fs.readFileSync(textFile, "utf8") : "";
  const already = fs.existsSync(media) && fs.statSync(media).size > 1000 && fs.existsSync(subtitles) && fs.statSync(subtitles).size > 10;
  if (!force && already && previous === text) {
    return {
      id: `narration-${language.code}-${segmentId}`,
      kind: "narration",
      provider: "edge-tts",
      model: language.voice,
      params: { rate, segmentId, language: language.code },
      taskId: null,
      estimatedCostUsd: 0,
      output: path.relative(projectPublicDir, media),
      status: "ready",
    };
  }
  fs.writeFileSync(textFile, text);
  let lastError = "";
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      await run([textFile, language.voice, rate, media, subtitles]);
      if (!fs.existsSync(media) || fs.statSync(media).size < 1000) {
        throw new Error("media file was empty");
      }
      return {
        id: `narration-${language.code}-${segmentId}`,
        kind: "narration",
        provider: "edge-tts",
        model: language.voice,
        params: { rate, segmentId, language: language.code },
        taskId: null,
        estimatedCostUsd: 0,
        output: path.relative(projectPublicDir, media),
        status: "ready",
      };
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      console.warn(`retry ${attempt} ${language.code} ${segmentId}: ${lastError}`);
      await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
    }
  }
  throw new Error(`${language.code} ${segmentId} failed: ${lastError}`);
}

function englishSeconds(): number {
  return iphoneDuo.segments.reduce((sum, segment) => {
    return sum + mediaDuration(path.join(projectPublicDir, "audio", "en", `${segment.id}.mp3`));
  }, 0);
}

export async function narrate(): Promise<void> {
  fs.mkdirSync(projectPublicDir, { recursive: true });
  const db = openDb();
  const assets: AssetRecord[] = [];
  const english = iphoneDuo.languages.find((language) => language.code === "en");
  if (!english) throw new Error("missing english track");

  const only = (process.env.ONLY_LANGS ?? "en,es,zh").split(",").map((item) => item.trim());
  let rate = process.env.SPEECH_RATE || "+0%";
  if (only.includes("en")) {
    console.log(`English pass at ${rate}`);
    for (const segment of iphoneDuo.segments) {
      const jobId = `narrate-en-${segment.id}`;
      upsertJob(db, { id: jobId, projectId: iphoneDuo.id, kind: "narration", status: "running", attempts: 1 });
      const asset = await speak(english, segment.id, segment.narration, rate, false);
      saveAsset(db, iphoneDuo.id, asset);
      upsertJob(db, { id: jobId, projectId: iphoneDuo.id, kind: "narration", status: "ready", attempts: 1 });
      assets.push(asset);
    }
    console.log(`English narration ${englishSeconds().toFixed(1)}s`);
  }

  for (const language of iphoneDuo.languages.filter((item) => item.role === "sidecar" && only.includes(item.code))) {
    for (const segment of iphoneDuo.segments) {
      const text = segment.translations[language.code === "es" ? "es" : "zh"];
      const jobId = `narrate-${language.code}-${segment.id}`;
      upsertJob(db, { id: jobId, projectId: iphoneDuo.id, kind: "narration", status: "running", attempts: 1 });
      const asset = await speak(language, segment.id, text, "+0%");
      saveAsset(db, iphoneDuo.id, asset);
      upsertJob(db, { id: jobId, projectId: iphoneDuo.id, kind: "narration", status: "ready", attempts: 1 });
      assets.push(asset);
    }
  }

  const latest = [...new Map(assets.map((asset) => [asset.id, asset])).values()];
  fs.writeFileSync(path.join(projectPublicDir, "assets.json"), JSON.stringify({ speechRate: rate, assets: latest }, null, 2));
  db.close();
  console.log(`Narration ready at ${rate}`);
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  narrate().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
