import { loadFont } from "@remotion/google-fonts/Nunito";

// Same tokens as web/styles/tokens.css — never #000/#fff.
export const C = {
  bg: "#FEFAEA",
  cream: "#FBF3D2",
  ink: "#1F2150",
  periwinkle: "#5F62A4",
  periwinkleLight: "#9EA1E0",
  lime: "#CFD224",
} as const;

export const { fontFamily } = loadFont("normal", {
  weights: ["600", "700", "800"],
  subsets: ["latin", "latin-ext"],
});

export const FRAME = { width: 1080, height: 1350 } as const;

// App card under the text band (scenes recorded at the 800x778 CARD viewport).
export const CARD = { left: 56, top: 352, width: 968, height: 941 } as const;

// Hero-signature entrance (web/components/hero), sped up for video.
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;
