import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { client } from "./client/client.gen";

// Dynamically set API base URL based on the current hostname
client.setConfig({
  baseUrl: `http://${window.location.hostname}:8000`,
});

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");
console.log("Main.tsx: Root element found, starting render...");

createRoot(rootElement).render(<App />);
