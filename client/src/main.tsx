import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { isNativeApp } from "./lib/nativeApp";

if (isNativeApp()) {
  document.documentElement.dataset.nativeApp = "true";
}

createRoot(document.getElementById("root")!).render(<App />);
