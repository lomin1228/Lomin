import { useEffect, useState, type FC } from "react";
import { AbsoluteFill, Audio, cancelRender, continueRender, delayRender, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { CaptionCue, Timeline, TimelineSegment } from "../domain/types";
import { SceneFrame } from "./scenes";

function useStudioFonts() {
  const [handle] = useState(() => delayRender("Loading Field Notes fonts"));
  useEffect(() => {
    const faces = [
      new FontFace("Fredoka", `url(${staticFile("fonts/fredoka.woff")})`, { weight: "600" }),
      new FontFace("Nunito", `url(${staticFile("fonts/nunito.woff")})`, { weight: "400" }),
      new FontFace("Nunito", `url(${staticFile("fonts/nunito-bold.woff")})`, { weight: "700" }),
    ];
    Promise.all(
      faces.map((face) =>
        face.load().then((loaded) => {
          (document.fonts as unknown as { add: (font: FontFace) => void }).add(loaded);
        }),
      ),
    )
      .then(() => continueRender(handle))
      .catch((error) => cancelRender(error));
  }, [handle]);
}

function Lyric({ cues }: { cues: CaptionCue[] }) {
  const frame = useCurrentFrame();
  const cue = cues.find((item) => frame >= item.startFrame && frame < item.endFrame);
  if (!cue) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 64,
        right: 64,
        bottom: 28,
        minHeight: 108,
        background: "#1c1915",
        color: "#fffaf3",
        borderRadius: 18,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "12px 28px",
        fontFamily: "Fredoka, sans-serif",
        fontSize: cue.text.length > 96 ? 32 : 38,
        lineHeight: 1.15,
      }}
    >
      {cue.text}
    </div>
  );
}

function SegmentView({ segment }: { segment: TimelineSegment }) {
  const frame = useCurrentFrame();
  const shot = segment.shots.find((item) => frame >= item.startFrame && frame < item.startFrame + item.durationFrames) ?? segment.shots[0];
  return (
    <AbsoluteFill>
      <SceneFrame scene={shot.scene} frame={frame - shot.startFrame} duration={shot.durationFrames} source={segment.sourceLabel} />
      <Lyric cues={segment.captions} />
    </AbsoluteFill>
  );
}

export const Documentary: FC<{ timeline: Timeline }> = ({ timeline }) => {
  useStudioFonts();
  return (
    <AbsoluteFill style={{ background: "#f3ecdf" }}>
      {timeline.segments.map((segment) => (
        <Sequence key={segment.id} from={segment.startFrame} durationInFrames={segment.durationFrames}>
          <SegmentView segment={segment} />
          <Audio src={staticFile(segment.audioFile)} />
        </Sequence>
      ))}
      <Audio src={staticFile(timeline.musicFile)} volume={0.055} loop />
    </AbsoluteFill>
  );
};
