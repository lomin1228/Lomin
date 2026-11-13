import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, interpolate, spring, useVideoConfig } from "remotion";
import type { SceneId } from "../domain/types";
import { BatteryChart, ShareDonut } from "./charts";
import { WorldMap } from "./map";

const ink = "#1c1915";
const paper = "#fffaf3";

function enter(frame: number, fps: number, delay = 0): number {
  return spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 140 } });
}

function Card({
  frame,
  fps,
  delay = 0,
  children,
  style,
}: {
  frame: number;
  fps: number;
  delay?: number;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const shown = enter(frame, fps, delay);
  return (
    <div
      style={{
        background: paper,
        color: ink,
        border: "5px solid " + ink,
        borderRadius: 22,
        boxShadow: "8px 8px 0 " + ink,
        padding: "22px 26px",
        transform: `translateY(${(1 - shown) * 36}px)`,
        opacity: Math.min(1, Math.max(0, shown)),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Stage({ kicker, source, children }: { kicker: string; source: string; children: ReactNode }) {
  return (
    <AbsoluteFill style={{ background: "#f3ecdf", color: ink, fontFamily: "Nunito, sans-serif" }}>
      <div style={{ position: "absolute", top: 32, left: 56, right: 56, display: "flex", justifyContent: "space-between", fontFamily: "Fredoka, sans-serif", fontSize: 28 }}>
        <span>FIELD NOTES</span>
        <span>{kicker}</span>
      </div>
      <div style={{ position: "absolute", left: 56, right: 56, top: 96, bottom: 180 }}>{children}</div>
      <div style={{ position: "absolute", left: 64, bottom: 168, fontSize: 22 }}>{source}</div>
    </AbsoluteFill>
  );
}

function FoldPhone({ open }: { open: number }) {
  const wing = 28 + open * 150;
  return (
    <svg width="460" height="320" viewBox="0 0 460 320">
      <rect x={230 - wing} y="16" width={wing} height="288" rx="28" fill={ink} />
      <rect x="230" y="16" width={wing} height="288" rx="28" fill={ink} />
      <rect x={230 - wing + 14} y="34" width={Math.max(0, wing - 28)} height="252" rx="16" fill="#8fd0c6" />
      <rect x="244" y="34" width={Math.max(0, wing - 28)} height="252" rx="16" fill="#2d5f9a" />
      <rect x="222" y="16" width="16" height="288" fill="#ef5d2a" />
    </svg>
  );
}

function Headline({ children }: { children: ReactNode }) {
  return <div style={{ fontFamily: "Fredoka, sans-serif", fontSize: 64, lineHeight: 0.95 }}>{children}</div>;
}

export function SceneFrame({
  scene,
  frame,
  source,
}: {
  scene: SceneId;
  frame: number;
  duration: number;
  source: string;
}) {
  const { fps } = useVideoConfig();
  if (scene === "cold-open") {
    const open = interpolate(frame, [8, 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    return (
      <Stage kicker="iPhone Duo" source={source}>
        <div style={{ display: "flex", gap: 36, alignItems: "center", height: "100%" }}>
          <div style={{ flex: 1 }}>
            <Headline>The first foldable iPhone, on paper.</Headline>
            <p style={{ fontSize: 32, maxWidth: 760 }}>September 9, 2026. Cupertino. A 7.6-inch inner display. A 5.4-inch outer one.</p>
          </div>
          <FoldPhone open={open} />
        </div>
      </Stage>
    );
  }
  if (scene === "dimensions") {
    const stats = [
      ["Closed depth", "11.3 mm"],
      ["Open depth", "5.2 mm"],
      ["Weight", "254 g"],
      ["Open width", "164.6 mm"],
    ];
    return (
      <Stage kicker="The body" source={source}>
        <Headline>Same weight. Different thickness.</Headline>
        <div style={{ display: "flex", gap: 18, marginTop: 28 }}>
          {stats.map(([label, value], index) => (
            <Card key={label} frame={frame} fps={fps} delay={index * 4} style={{ flex: 1 }}>
              <div style={{ fontSize: 22 }}>{label}</div>
              <div style={{ fontFamily: "Fredoka, sans-serif", fontSize: 48 }}>{value}</div>
            </Card>
          ))}
        </div>
      </Stage>
    );
  }
  if (scene === "aspect") {
    const inner = (1878 / 2670).toFixed(3);
    const outer = (1398 / 2034).toFixed(3);
    return (
      <Stage kicker="The pixels" source={source}>
        <div style={{ display: "flex", gap: 24, height: "100%" }}>
          <Card frame={frame} fps={fps} style={{ flex: 1 }}>
            <div style={{ fontSize: 28 }}>Inner grid</div>
            <Headline>1878 × 2670</Headline>
            <div style={{ fontSize: 30 }}>430 ppi · width ÷ height {inner}</div>
          </Card>
          <Card frame={frame} fps={fps} delay={6} style={{ flex: 1 }}>
            <div style={{ fontSize: 28 }}>Outer grid</div>
            <Headline>1398 × 2034</Headline>
            <div style={{ fontSize: 30 }}>460 ppi · width ÷ height {outer}</div>
          </Card>
        </div>
      </Stage>
    );
  }
  if (scene === "stack") {
    const layers = ["Nano-textured polymer", "Glass", "Folding panel", "Glass", "Adhesive glide", "Titanium plate"];
    return (
      <Stage kicker="The crease" source={source}>
        <Headline>The stack Apple described.</Headline>
        <div style={{ marginTop: 20 }}>
          {layers.map((layer, index) => (
            <div key={layer} style={{ transform: `translateY(${(1 - enter(frame, fps, index * 3)) * 20}px)`, marginBottom: 10 }}>
              <Card frame={frame} fps={fps} delay={index * 3} style={{ padding: "12px 20px", fontSize: 30, fontFamily: "Fredoka, sans-serif" }}>
                {layer}
                {layer.startsWith("Nano") ? " · up to 40% stiffer, rivals unnamed" : ""}
              </Card>
            </div>
          ))}
        </div>
      </Stage>
    );
  }
  if (scene === "hinge") {
    const count = Math.round(interpolate(frame, [0, 35], [0, 100], { extrapolateRight: "clamp" }));
    return (
      <Stage kicker="The hinge" source={source}>
        <div style={{ display: "flex", alignItems: "center", gap: 40, height: "100%" }}>
          <Headline>{count}+</Headline>
          <div style={{ fontSize: 36, maxWidth: 720 }}>components, carbon fiber plates, and a magnet array for the close. The cover is 100% recycled titanium.</div>
        </div>
      </Stage>
    );
  }
  if (scene === "durability") {
    const badges = ["Grade 5 titanium", "Ceramic Shield 2 · 3× scratch claim", "IP68 · 6 m · 30 min · not permanent", "35% recycled mass · packaging excluded"];
    return (
      <Stage kicker="What the footnote keeps" source={source}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {badges.map((badge, index) => (
            <Card key={badge} frame={frame} fps={fps} delay={index * 5} style={{ fontFamily: "Fredoka, sans-serif", fontSize: 34 }}>
              {badge}
            </Card>
          ))}
        </div>
      </Stage>
    );
  }
  if (scene === "silicon") {
    const stickers = ["2 nm", "CPU +20% vs A19 Pro", "GPU +40%", "Neural Engine 2×", "Bandwidth +50%", "Sustained +35% vs iPhone 17 Pro"];
    return (
      <Stage kicker="A20 Pro, Apple's numbers" source={source}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
          {stickers.map((sticker, index) => (
            <Card key={sticker} frame={frame} fps={fps} delay={index * 5} style={{ fontFamily: "Fredoka, sans-serif", fontSize: 36 }}>
              {sticker}
            </Card>
          ))}
        </div>
        <p style={{ fontSize: 28 }}>No independent lab result was in the pages read for this film.</p>
      </Stage>
    );
  }
  if (scene === "battery") {
    return (
      <Stage kicker="Two tests, not one" source={source}>
        <BatteryChart frame={frame} />
        <Card frame={frame} fps={fps} delay={10} style={{ marginTop: 12, fontSize: 30 }}>
          24 hours is mixed use with both displays, on LTE and 5G. It is not 24 hours of video. August 2026, preproduction units.
        </Card>
      </Stage>
    );
  }
  if (scene === "market") {
    return (
      <Stage kicker="A small category" source={source}>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <ShareDonut frame={frame} />
          <div>
            <Headline>19.6 million.</Headline>
            <p style={{ fontSize: 30, maxWidth: 560 }}>Full-year 2025, up 18%. Q3 alone was 2.5%, up 14%. A quarter is not the year. Neither number is an iPhone Duo sales figure.</p>
          </div>
        </div>
      </Stage>
    );
  }
  if (scene === "price") {
    return (
      <Stage kicker="The price on the release" source={source}>
        <div style={{ display: "flex", gap: 24 }}>
          <Card frame={frame} fps={fps} style={{ flex: 1.1 }}>
            <div style={{ fontSize: 28 }}>United States, 256GB</div>
            <Headline>$1,999</Headline>
            <div style={{ fontSize: 28 }}>$83.29 a month for 24 months is financing, not a discount.</div>
          </Card>
          <Card frame={frame} fps={fps} delay={8} style={{ flex: 1, background: "#ffe7a3" }}>
            <div style={{ fontFamily: "Fredoka, sans-serif", fontSize: 28 }}>Secondary · The Verge</div>
            <div style={{ fontSize: 30 }}>$100 over Galaxy Z Fold 8. $100 under Z Fold 8 Ultra. Samsung's price page was not opened.</div>
          </Card>
        </div>
      </Stage>
    );
  }
  if (scene === "map") {
    return (
      <Stage kicker="Where preorders were named" source={source}>
        <WorldMap frame={frame} />
        <div style={{ marginTop: 8, fontSize: 26 }}>Dots are capitals of the countries Apple named. The star is Cupertino, the dateline. Not factories. Not stores.</div>
      </Stage>
    );
  }
  if (scene === "thesis") {
    const cards = ["Polymer stack, rivals unnamed", "Hinge, 100+ parts", "Two batteries, one pack", "1.6% of 2025 shipments"];
    return (
      <Stage kicker="What survives" source={source}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {cards.map((card, index) => (
            <Card key={card} frame={frame} fps={fps} delay={index * 4} style={{ fontFamily: "Fredoka, sans-serif", fontSize: 36 }}>
              {card}
            </Card>
          ))}
        </div>
      </Stage>
    );
  }
  return (
    <Stage kicker="Read these, not the keynote" source={source}>
      <Headline>Apple. Counterpoint. The Verge.</Headline>
      <p style={{ fontSize: 30, maxWidth: 1100 }}>
        Newsroom and tech specs for the phone. Counterpoint for the 2025 market and the Q3 note. The Verge for the Samsung price gap, labeled as theirs.
      </p>
    </Stage>
  );
}
