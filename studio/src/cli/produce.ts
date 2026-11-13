import { spawn } from "node:child_process";
import path from "node:path";
import { seed } from "./seed";
import { narrate } from "./narrate";
import { buildTimeline } from "./timeline";
import { runQa } from "./qa";
import { finish } from "./finish";
import { studioRoot } from "../lib/paths";

function command(bin: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, { cwd: studioRoot, stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${bin} exited ${code}`))));
  });
}

async function main(): Promise<void> {
  seed();
  await command("python3", ["src/audio/score.py"]);
  await narrate();
  buildTimeline();
  runQa();
  await command("npx", ["remotion", "render", "src/remotion/index.ts", "Documentary", "out/iphone-duo.mp4", "--concurrency=2"]);
  finish();
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
