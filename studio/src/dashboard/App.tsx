import { useEffect, useState } from "react";
import { iphoneDuo } from "../content/iphone-duo";
import type { QaFinding, Timeline } from "../domain/types";
import { providerStatuses } from "../providers/registry";
import "./styles.css";

const sections = [
  ["project", "Project"],
  ["research", "Research"],
  ["evidence", "Evidence"],
  ["script", "Script"],
  ["storyboard", "Storyboard"],
  ["shots", "Shots"],
  ["assets", "Generation"],
  ["audio", "Audio"],
  ["timeline", "Timeline"],
  ["qa", "Quality"],
  ["render", "Render"],
  ["cost", "Cost"],
] as const;

type AssetFile = { speechRate?: string; assets?: { id: string; provider: string; model: string; output: string; estimatedCostUsd: number; status: string }[] };

export function App() {
  const [active, setActive] = useState<(typeof sections)[number][0]>("project");
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [qa, setQa] = useState<QaFinding[] | null>(null);
  const [assets, setAssets] = useState<AssetFile | null>(null);
  const [videoOk, setVideoOk] = useState(false);

  useEffect(() => {
    fetch("/projects/iphone-duo/timeline.json").then((response) => (response.ok ? response.json() : null)).then(setTimeline).catch(() => setTimeline(null));
    fetch("/projects/iphone-duo/qa.json").then((response) => (response.ok ? response.json() : null)).then((body) => setQa(body?.findings ?? null)).catch(() => setQa(null));
    fetch("/projects/iphone-duo/assets.json").then((response) => (response.ok ? response.json() : null)).then(setAssets).catch(() => setAssets(null));
    fetch("/projects/iphone-duo/iphone-duo.mp4", { method: "HEAD" }).then((response) => setVideoOk(response.ok)).catch(() => setVideoOk(false));
  }, []);

  const providers = providerStatuses();
  const errors = qa?.filter((finding) => finding.severity === "error").length ?? 0;

  return (
    <div className="app">
      <nav>
        <strong>Field Notes</strong>
        {sections.map(([id, label]) => (
          <button key={id} className={active === id ? "active" : ""} onClick={() => setActive(id)}>
            {label}
          </button>
        ))}
      </nav>
      <main>
        {active === "project" ? (
          <section>
            <h1>{iphoneDuo.title}</h1>
            <p>{iphoneDuo.durationNote}</p>
            <div className="grid">
              <div className="card"><b>Channel target</b><div>{iphoneDuo.channelTargetMinutes[0]}–{iphoneDuo.channelTargetMinutes[1]} min</div></div>
              <div className="card"><b>This episode</b><div>{iphoneDuo.intendedDurationSec / 60} min · {iphoneDuo.style}</div></div>
              <div className="card"><b>Frame</b><div>{iphoneDuo.resolution.width}×{iphoneDuo.resolution.height} · {iphoneDuo.resolution.fps} fps</div></div>
              <div className="card"><b>QA</b><div className={qa ? (errors ? "error" : "ok") : "meta"}>{qa ? (errors ? `${errors} errors` : "Passed") : "Not run"}</div></div>
            </div>
          </section>
        ) : null}

        {active === "research" ? (
          <section>
            <h2>Research question</h2>
            <p>{iphoneDuo.researchQuestion}</p>
            <h2>Thesis</h2>
            <p>{iphoneDuo.thesis}</p>
            <div className="grid">
              {iphoneDuo.chapters.map((chapter) => (
                <div key={chapter.id} className="card"><b>{chapter.title}</b><div>{chapter.summary}</div></div>
              ))}
            </div>
          </section>
        ) : null}

        {active === "evidence" ? (
          <section>
            <h2>Evidence</h2>
            {iphoneDuo.evidence.map((item) => {
              const source = iphoneDuo.sources.find((entry) => entry.id === item.sourceId);
              return (
                <article key={item.id} className="claim">
                  <b>{item.id}</b> · {item.reliability}
                  <p>{item.claim}</p>
                  <p className="meta">{item.passage}</p>
                  <p>Limitation: {item.limitations}</p>
                  {source ? <a href={source.url}>{source.publisher} — {source.title}</a> : null}
                </article>
              );
            })}
          </section>
        ) : null}

        {active === "script" ? (
          <section>
            <h2>Narration</h2>
            {iphoneDuo.segments.map((segment) => (
              <article key={segment.id} className="claim">
                <b>{segment.id}</b> · {segment.emotion}
                <p>{segment.narration}</p>
                <p className="meta">ES · {segment.translations.es}</p>
                <p className="meta">中文 · {segment.translations.zh}</p>
              </article>
            ))}
          </section>
        ) : null}

        {active === "storyboard" ? (
          <section>
            <h2>Visual bible</h2>
            <p>{iphoneDuo.bible.camera}</p>
            <p>{iphoneDuo.bible.characters}</p>
            <p>{iphoneDuo.bible.maps}</p>
            <p>{iphoneDuo.bible.charts}</p>
            <div className="grid">
              {Object.entries(iphoneDuo.bible.palette).map(([name, color]) => (
                <div key={name} className="card" style={{ background: color, color: "#1c1915" }}><b>{name}</b><div>{color}</div></div>
              ))}
            </div>
          </section>
        ) : null}

        {active === "shots" ? (
          <section>
            <h2>Shot manifest</h2>
            <table>
              <tbody>
                {iphoneDuo.shots.map((shot) => (
                  <tr key={shot.id}>
                    <th>{shot.id}</th>
                    <td>{shot.scene}<br />{shot.visual}</td>
                    <td>{shot.provider} · {shot.model}<br />{shot.status} · {shot.tier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}

        {active === "assets" ? (
          <section>
            <h2>Providers</h2>
            {providers.map((provider) => (
              <article key={provider.id} className="claim">
                <b>{provider.id}</b> · {provider.kind} · <span className={provider.configured ? "ok" : "warning"}>{provider.configured ? "ready" : "unavailable"}</span>
                <p>{provider.detail}</p>
              </article>
            ))}
          </section>
        ) : null}

        {active === "audio" ? (
          <section>
            <h2>Audio</h2>
            <p>Master voice en-US-AndrewNeural at {assets?.speechRate ?? "not generated"}. Spanish and Chinese are sidecar tracks and lyric files.</p>
            <ul>
              {iphoneDuo.languages.map((language) => (
                <li key={language.code}>{language.label} · {language.voice} · {language.role}</li>
              ))}
            </ul>
            <p className="meta">{assets ? `${assets.assets?.length ?? 0} asset records` : "No asset log yet."}</p>
          </section>
        ) : null}

        {active === "timeline" ? (
          <section>
            <h2>Timeline</h2>
            {timeline ? (
              <table>
                <tbody>
                  {timeline.segments.map((segment) => (
                    <tr key={segment.id}>
                      <th>{segment.id}</th>
                      <td>{(segment.startFrame / timeline.fps).toFixed(1)}s · {(segment.durationFrames / timeline.fps).toFixed(1)}s</td>
                      <td>{segment.shots.map((shot) => shot.scene).join(" → ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p>Timeline has not been built.</p>}
          </section>
        ) : null}

        {active === "qa" ? (
          <section>
            <h2>Quality control</h2>
            {qa ? qa.map((finding, index) => (
              <p key={index} className={finding.severity}>{finding.severity} · {finding.code} · {finding.message}</p>
            )) : <p>QA has not been run.</p>}
            {qa && qa.length === 0 ? <p className="ok">No findings.</p> : null}
          </section>
        ) : null}

        {active === "render" ? (
          <section>
            <h2>Export</h2>
            {videoOk ? <video src="/projects/iphone-duo/iphone-duo.mp4" controls /> : <p>The master file is not in the public folder yet.</p>}
            <p className="meta">Sidecar lyrics: /projects/iphone-duo/subtitles/en.srt, es.srt, zh.srt</p>
          </section>
        ) : null}

        {active === "cost" ? (
          <section>
            <h2>Budget</h2>
            <p>Project limit ${iphoneDuo.budgetUsd.toFixed(2)}. Cloud video and image models are not called. Narration and render are local, recorded at $0.</p>
            <p>{timeline ? `Cut length ${timeline.durationSec.toFixed(1)} seconds.` : "Length appears after the timeline is built."}</p>
          </section>
        ) : null}
      </main>
    </div>
  );
}
