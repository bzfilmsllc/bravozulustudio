import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// EMERGENCY POPUP KILLER - VERIFICATION DISABLED PERMANENTLY
console.log("🚀 BRAVO ZULU FILMS v4 - VERIFICATION EMERGENCY FIX ACTIVE! Build:", new Date().toISOString());
console.log("🚫 POPUP KILLER ACTIVATED!");

// Nuclear approach to remove verification popups
if (typeof window !== 'undefined') {
  window.localStorage.clear();
  window.sessionStorage.clear();
  
  // Override any modal/dialog creation
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName: string) {
    const element = originalCreateElement.call(this, tagName);
    
    // Prevent verification modals from appearing
    if (element.tagName === 'DIV' || element.tagName === 'DIALOG') {
      const observer = new MutationObserver(() => {
        if (element.textContent?.includes('Verification Required') || 
            element.textContent?.includes('verified military veteran status')) {
          console.log("🚫 BLOCKED VERIFICATION POPUP!");
          element.style.display = 'none !important';
          element.remove();
        }
      });
      observer.observe(element, { childList: true, subtree: true });
    }
    
    return element;
  };
}

createRoot(document.getElementById("root")!).render(<App />);
