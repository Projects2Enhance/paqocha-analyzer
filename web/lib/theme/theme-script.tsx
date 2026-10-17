const THEME_INIT_SCRIPT = `(function () {
  try {
    var stored = localStorage.getItem("paqocha-theme");
    var theme = stored === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();`;

/** Sets data-theme before first paint to avoid a flash of the wrong theme. */
export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />;
}
