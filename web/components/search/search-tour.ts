import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const TOUR_SEEN_KEY = "paqocha-search-tour-seen";
// The pill widens over 420ms when it opens (see SearchBar), so the second
// step has to wait for it to settle before driver.js measures the target.
const PILL_OPEN_SETTLE_MS = 480;
// How long the popover itself takes to fade out/in around a step change —
// see TRANSITIONING_CLASS below for why this is sequenced rather than run
// alongside the pill's own open/close animation.
const POPOVER_FADE_MS = 200;
// Applied to <body> while a step change is in flight. Targets
// .driver-popover (whichever one currently exists — driver.js may reuse or
// replace that node on moveNext/movePrevious, so this can't be a ref held
// onto a specific element) rather than a class toggled on the popover
// itself, so it keeps working regardless of which node driver.js is
// currently rendering. See .paqocha-tour-popover's CSS in SearchBar.
const TRANSITIONING_CLASS = "paqocha-tour-transitioning";

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

function setPopoverHidden(hidden: boolean) {
  document.body.classList.toggle(TRANSITIONING_CLASS, hidden);
}

// Runs a step change as: fade the current popover out -> run the pill's
// open/close animation while nothing is visible -> advance driver.js's step
// (an instant, now-invisible content/position swap) -> fade the new popover
// in. Previously the popover swapped content immediately while the pill was
// still mid-animation, which read as the background changing before the
// step UI caught up.
function runStepTransition(backgroundChange: () => void, advanceStep: () => void) {
  setPopoverHidden(true);
  window.setTimeout(() => {
    backgroundChange();
    window.setTimeout(() => {
      advanceStep();
      requestAnimationFrame(() => setPopoverHidden(false));
    }, PILL_OPEN_SETTLE_MS);
  }, POPOVER_FADE_MS);
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
      // Safety net: an interrupted transition (e.g. Escape mid-fade) could
      // otherwise leave the next tour run's popover stuck hidden.
      setPopoverHidden(false);
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
            runStepTransition(openSearch, () => tour.moveNext());
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
            runStepTransition(closeSearch, () => tour.movePrevious());
          },
        },
      },
    ],
  });

  tour.drive();
}
