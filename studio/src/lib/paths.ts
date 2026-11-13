import path from "node:path";
import { fileURLToPath } from "node:url";

export const studioRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const dataDir = path.join(studioRoot, "data");
export const projectDataDir = path.join(dataDir, "iphone-duo");
export const publicDir = path.join(studioRoot, "public");
export const projectPublicDir = path.join(publicDir, "projects", "iphone-duo");
export const dbPath = path.join(dataDir, "studio.sqlite");
export const timelinePath = path.join(projectPublicDir, "timeline.json");
export const fontDir = path.join(publicDir, "fonts");
