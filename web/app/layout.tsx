import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme/theme-provider";
import { ThemeScript } from "@/lib/theme/theme-script";

// Rounded terminals read as warmer/friendlier than a neutral grotesque —
// fits an approachable learning tool better than Geist's default, more
// "SaaS-neutral" look. See web/DESIGN.md -> Typography for the full writeup.
const nunito = Nunito({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Paqocha Analyzer",
  description:
    "Escucha, descompón y entiende el quechua hablado de Puno (quechua Collao).",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${nunito.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
