import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from "@remotion/transitions";
import type React from "react";
import { AbsoluteFill } from "remotion";

// Entering scene fades and resolves from a blur over the exiting one.
const BlurFadeComponent: React.FC<
  TransitionPresentationComponentProps<Record<string, never>>
> = ({ children, presentationDirection, presentationProgress }) => {
  if (presentationDirection === "exiting")
    return <AbsoluteFill>{children}</AbsoluteFill>;
  return (
    <AbsoluteFill
      style={{
        opacity: presentationProgress,
        filter: `blur(${(1 - presentationProgress) * 12}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const blurFade = (): TransitionPresentation<Record<string, never>> => ({
  component: BlurFadeComponent,
  props: {},
});
