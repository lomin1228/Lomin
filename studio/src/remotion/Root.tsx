import type { FC } from "react";
import { Composition } from "remotion";
import type { Timeline } from "../domain/types";
import timelineJson from "./timeline.json";
import { Documentary } from "./Documentary";

const timeline = timelineJson as Timeline;

export const RemotionRoot: FC = () => {
  return (
    <Composition
      id="Documentary"
      component={Documentary}
      durationInFrames={timeline.durationInFrames}
      fps={timeline.fps}
      width={timeline.width}
      height={timeline.height}
      defaultProps={{ timeline }}
    />
  );
};
