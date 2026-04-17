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

createRoot(document.getElementById("root")!).render(<App />);
