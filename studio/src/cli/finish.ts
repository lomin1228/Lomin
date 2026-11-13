import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { projectPublicDir, studioRoot } from "../lib/paths";

export function finish(): void {
  const source = path.join(studioRoot, "out", "iphone-duo.mp4");
  if (!fs.existsSync(source)) throw new Error("Render output is missing.");
  const mastered = path.join(studioRoot, "out", "iphone-duo-master.mp4");
  execFileSync(
    "ffmpeg",
    ["-y", "-i", source, "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", mastered],
    { stdio: "inherit" },
  );
  fs.copyFileSync(mastered, path.join(projectPublicDir, "iphone-duo.mp4"));
  const probe = execFileSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height,codec_name", "-of", "json", mastered],
    { encoding: "utf8" },
  );
  fs.writeFileSync(path.join(studioRoot, "out", "probe.json"), probe);
  console.log(probe);
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) finish();
