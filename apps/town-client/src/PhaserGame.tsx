import { useEffect, useLayoutEffect, useRef } from 'react';
import { EventBus } from './game/EventBus.ts';
import { startGame } from './game/main.ts';

/** Mounts the Phaser game once (template pattern) and flags readiness for tests. */
export function PhaserGame() {
  const game = useRef<Phaser.Game | null>(null);

  useLayoutEffect(() => {
    if (game.current === null) game.current = startGame('game-container');
    return () => {
      game.current?.destroy(true);
      game.current = null;
    };
  }, []);

  useEffect(() => {
    const onReady = () => {
      window.__townReady = true;
    };
    EventBus.on('town-ready', onReady);
    return () => {
      EventBus.off('town-ready', onReady);
    };
  }, []);

  return <div id="game-container" />;
}
