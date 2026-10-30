import { createContext, useContext } from "react";
import takes4x5 from "./data/takes.json";
import { CARD } from "./theme";

export type TakeData = {
  viewport: { width: number; height: number };
  start: { x: number; y: number };
  clicks: number[];
  cursor: number[][];
};
export type Box = { left: number; top: number; width: number; height: number };

export type Format = {
  takes: Record<string, TakeData>;
  // Folder under public/ holding take-<id>.mp4 for this format.
  takesDir: string;
  frame: { width: number; height: number };
  card: Box;
};

export const FORMAT_4X5: Format = {
  takes: takes4x5,
  takesDir: "takes",
  frame: { width: 1080, height: 1350 },
  card: CARD,
};

const FormatContext = createContext<Format>(FORMAT_4X5);
export const FormatProvider = FormatContext.Provider;
export const useFormat = () => useContext(FormatContext);
