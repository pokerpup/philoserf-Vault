/// <reference types="vite/client" />

interface Window {
  /** Set once the Town scene has rendered the map; Playwright waits on it. */
  __townReady?: boolean;
  /** How many agent sprites stand on Firm Hill. */
  __townAgents?: number;
}
