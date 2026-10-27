import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const TOUR_SEEN_KEY = "paqocha-search-tour-seen";
// The pill widens over 420ms when it opens (see SearchBar), so the second
// step has to wait for it to settle before driver.js measures the target.
const PILL_OPEN_SETTLE_MS = 480;

export function hasSeenSearchTour(): boolean {
  try {
    return window.localStorage.getItem(TOUR_SEEN_KEY) === "1";
  } catch {
    // Storage blocked (private mode, etc.): treat as seen, so the tour never
    // re-appears on every single visit with no way to dismiss it for good.
    return true;
  }
}

function markSearchTourSeen() {
  try {
    window.localStorage.setItem(TOUR_SEEN_KEY, "1");
  } catch {
    // Nothing to do — see hasSeenSearchTour.
  }
}

interface SearchTourHandlers {
  openSearch: () => void;
  closeSearch: () => void;
}

// First-visit walkthrough of the search pill. Styling lives in SearchBar's
// scoped <style> tag (.paqocha-tour-popover) so it reuses the brand tokens.
export function startSearchTour({ openSearch, closeSearch }: SearchTourHandlers) {
  const tour = driver({
    popoverClass: "paqocha-tour-popover",
    // No dimmed backdrop — just the step popovers themselves, so they don't
    // compete visually with a cutout/highlight around the target.
    overlayOpacity: 0,
    showProgress: true,
    progressText: "{{current}} de {{total}}",
    nextBtnText: "Siguiente",
    prevBtnText: "Atrás",
    doneBtnText: "Entendido",
    allowClose: true,
    onDestroyed: () => {
      markSearchTourSeen();
      closeSearch();
    },
    steps: [
      {
        element: ".paqocha-search-pill",
        popover: {
          title: "Aquí empieza todo",
          description:
            "Escribe una palabra en quechua, <strong>escúchala</strong> en un contexto real y descubre cómo se desglosan sus sufijos.",
          side: "bottom",
          align: "center",
          showButtons: ["next"],
          onNextClick: () => {
            openSearch();
            window.setTimeout(() => tour.moveNext(), PILL_OPEN_SETTLE_MS);
          },
        },
      },
      {
        element: ".paqocha-search-suggestions",
        popover: {
          title: "¿Sin palabras en mente?",
          description:
            "Te mostramos opciones al azar. Toca cualquiera para buscarla al instante.",
          side: "bottom",
          align: "center",
          showButtons: ["previous", "next"],
          onPrevClick: () => {
            closeSearch();
            window.setTimeout(() => tour.movePrevious(), PILL_OPEN_SETTLE_MS);
          },
        },
      },
    ],
  });

  tour.drive();
}
