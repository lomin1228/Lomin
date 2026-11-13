import fs from "node:fs";
import path from "node:path";
import { iphoneDuo } from "../content/iphone-duo";
import { openDb, saveApproval, saveProject } from "../db/client";
import { fontDir, projectDataDir, projectPublicDir, studioRoot } from "../lib/paths";

const fontSources = [
  ["@fontsource/fredoka/files/fredoka-latin-600-normal.woff", "fredoka.woff"],
  ["@fontsource/nunito/files/nunito-latin-400-normal.woff", "nunito.woff"],
  ["@fontsource/nunito/files/nunito-latin-700-normal.woff", "nunito-bold.woff"],
];

function writeSources(): void {
  const lines = [
    `# Sources — ${iphoneDuo.title}`,
    "",
    "These pages were opened before the claims were written. A claim in the film has to point at one of them.",
    "",
  ];
  for (const source of iphoneDuo.sources) {
    lines.push(`- ${source.publisher}. ${source.title}. ${source.published}. Accessed ${source.accessed}. ${source.url}`);
  }
  lines.push("", "## Claims", "");
  for (const item of iphoneDuo.evidence) {
    lines.push(`### ${item.id}`);
    lines.push(item.claim);
    lines.push("");
    lines.push(`Source: ${item.sourceId}. Reliability: ${item.reliability}.`);
    lines.push("");
    lines.push(`Passage: ${item.passage}`);
    lines.push("");
    lines.push(`Limitation: ${item.limitations}`);
    lines.push("");
  }
  const body = lines.join("\n");
  fs.writeFileSync(path.join(projectDataDir, "SOURCES.md"), body);
  fs.writeFileSync(path.join(projectPublicDir, "SOURCES.md"), body);
}

export function seed(): void {
  fs.mkdirSync(projectDataDir, { recursive: true });
  fs.mkdirSync(projectPublicDir, { recursive: true });
  fs.mkdirSync(fontDir, { recursive: true });
  for (const [from, to] of fontSources) {
    fs.copyFileSync(path.join(studioRoot, "node_modules", from), path.join(fontDir, to));
  }
  fs.writeFileSync(path.join(projectPublicDir, "project.json"), JSON.stringify(iphoneDuo, null, 2));
  writeSources();
  const db = openDb();
  saveProject(db, iphoneDuo);
  const note = "The user asked for this 5-minute pilot after the research pages were read.";
  for (const stage of ["research", "thesis", "script", "storyboard", "render"]) {
    saveApproval(db, iphoneDuo.id, stage, note);
  }
  db.close();
  console.log(`Seeded ${iphoneDuo.id}`);
}

if (import.meta.url === `file://${process.argv[1]}`) seed();
