import fs from "node:fs";
import path from "node:path";
import { iphoneDuo } from "../content/iphone-duo";
import { openDb, replaceFindings } from "../db/client";
import { checkProject, checkTimeline, errorsOf } from "../qa/checks";
import { projectPublicDir, timelinePath } from "../lib/paths";

export function runQa(): void {
  const findings = checkProject(iphoneDuo);
  if (fs.existsSync(timelinePath)) {
    const timeline = JSON.parse(fs.readFileSync(timelinePath, "utf8"));
    findings.push(...checkTimeline(iphoneDuo, timeline));
  } else {
    findings.push({ severity: "warning", code: "timeline", message: "Timeline has not been built yet." });
  }
  const db = openDb();
  replaceFindings(db, iphoneDuo.id, findings);
  db.close();
  fs.mkdirSync(projectPublicDir, { recursive: true });
  fs.writeFileSync(path.join(projectPublicDir, "qa.json"), JSON.stringify({ findings }, null, 2));
  for (const finding of findings) console.log(`${finding.severity}\t${finding.code}\t${finding.message}`);
  if (errorsOf(findings).length > 0) process.exit(1);
  console.log("QA passed");
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) runQa();
