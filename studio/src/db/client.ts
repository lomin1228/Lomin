import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
import type { AssetRecord, Project, QaFinding } from "../domain/types";
import { dataDir, dbPath } from "../lib/paths";

export function openDb(): DatabaseSync {
  fs.mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec(`
    create table if not exists projects (
      id text primary key,
      title text not null,
      document text not null,
      updated_at text not null
    );
    create table if not exists jobs (
      id text primary key,
      project_id text not null,
      kind text not null,
      status text not null,
      attempts integer not null,
      last_error text,
      updated_at text not null
    );
    create table if not exists assets (
      id text primary key,
      project_id text not null,
      document text not null
    );
    create table if not exists qa_findings (
      id integer primary key autoincrement,
      project_id text not null,
      severity text not null,
      code text not null,
      message text not null
    );
    create table if not exists approvals (
      stage text primary key,
      project_id text not null,
      decision text not null,
      note text not null,
      updated_at text not null
    );
  `);
  return db;
}

export function saveProject(db: DatabaseSync, project: Project): void {
  const now = new Date().toISOString();
  db.prepare(
    `insert into projects (id, title, document, updated_at)
     values (?, ?, ?, ?)
     on conflict(id) do update set title = excluded.title, document = excluded.document, updated_at = excluded.updated_at`,
  ).run(project.id, project.title, JSON.stringify(project), now);
}

export function saveAsset(db: DatabaseSync, projectId: string, asset: AssetRecord): void {
  db.prepare(
    `insert into assets (id, project_id, document) values (?, ?, ?)
     on conflict(id) do update set document = excluded.document`,
  ).run(asset.id, projectId, JSON.stringify(asset));
}

export function upsertJob(
  db: DatabaseSync,
  job: { id: string; projectId: string; kind: string; status: string; attempts: number; lastError?: string },
): void {
  db.prepare(
    `insert into jobs (id, project_id, kind, status, attempts, last_error, updated_at)
     values (?, ?, ?, ?, ?, ?, ?)
     on conflict(id) do update set status = excluded.status, attempts = excluded.attempts,
       last_error = excluded.last_error, updated_at = excluded.updated_at`,
  ).run(job.id, job.projectId, job.kind, job.status, job.attempts, job.lastError ?? null, new Date().toISOString());
}

export function replaceFindings(db: DatabaseSync, projectId: string, findings: QaFinding[]): void {
  db.prepare("delete from qa_findings where project_id = ?").run(projectId);
  const insert = db.prepare(
    "insert into qa_findings (project_id, severity, code, message) values (?, ?, ?, ?)",
  );
  for (const finding of findings) insert.run(projectId, finding.severity, finding.code, finding.message);
}

export function saveApproval(db: DatabaseSync, projectId: string, stage: string, note: string): void {
  db.prepare(
    `insert into approvals (stage, project_id, decision, note, updated_at)
     values (?, ?, 'approved', ?, ?)
     on conflict(stage) do update set decision = 'approved', note = excluded.note, updated_at = excluded.updated_at`,
  ).run(stage, projectId, note, new Date().toISOString());
}
