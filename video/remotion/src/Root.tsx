import { Composition } from "remotion";
import { PaqochaLinkedIn } from "./PaqochaLinkedIn";
import { PaqochaLinkedIn16x9 } from "./PaqochaLinkedIn16x9";
import { TOTAL_FRAMES } from "./timeline";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PaqochaLinkedIn"
        component={PaqochaLinkedIn}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1080}
        height={1350}
      />
      <Composition
        id="PaqochaLinkedIn16x9"
        component={PaqochaLinkedIn16x9}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
