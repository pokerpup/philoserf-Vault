/// <reference types="vite/client" />

interface Window {
  /** Set once the Town scene has rendered the placeholder map; Playwright waits on it. */
  __townReady?: boolean;
}
