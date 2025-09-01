import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// AGGRESSIVE CACHE CLEAR - VERIFICATION POPUP PERMANENTLY DISABLED
console.log("🚀 BRAVO ZULU FILMS v3 - VERIFICATION BARRIERS COMPLETELY REMOVED! Build:", new Date().toISOString());
console.log("🚫 NO MORE VERIFICATION POPUP!");

// Force clear any cached verification components
if (typeof window !== 'undefined') {
  window.localStorage.clear();
  window.sessionStorage.clear();
}

createRoot(document.getElementById("root")!).render(<App />);
