import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Apply theme synchronously before paint to avoid flash
(() => {
  try {
    const stored = localStorage.getItem("qc-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const theme = stored === "light" || stored === "dark" ? stored : prefersDark ? "dark" : "light";
    document.documentElement.classList.toggle("dark", theme === "dark");
  } catch {
    document.documentElement.classList.add("dark");
  }
})();

// Apply Arabic font-size preference synchronously
(() => {
  try {
    const stored = localStorage.getItem("qc-arabic-size");
    const n = stored ? parseFloat(stored) : NaN;
    if (Number.isFinite(n) && n >= 1.25 && n <= 2.75) {
      document.documentElement.style.setProperty("--arabic-size", `${n}rem`);
    }
  } catch {}
})();

createRoot(document.getElementById("root")!).render(<App />);
