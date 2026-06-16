import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// When a lazy chunk fails to load (stale SW cache / deploy mismatch),
// force a hard reload so the browser fetches fresh chunks from the CDN.
window.addEventListener("vite:preloadError", () => {
  window.location.reload();
});

createRoot(document.getElementById("root")!).render(<App />);
