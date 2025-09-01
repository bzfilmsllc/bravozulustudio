import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Force cache clear for verification popup fix
console.log("🚀 BRAVO ZULU FILMS - No verification barriers! Build:", new Date().toISOString());

createRoot(document.getElementById("root")!).render(<App />);
