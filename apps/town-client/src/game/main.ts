import Phaser from 'phaser';
import { Boot } from '../scenes/Boot.ts';
import { Preloader } from '../scenes/Preloader.ts';
import { Town } from '../scenes/Town.ts';
import { BASE_HEIGHT, BASE_WIDTH, integerZoom } from './zoom.ts';

function viewportZoom(parent: HTMLElement | null): number {
  const w = parent?.clientWidth || window.innerWidth;
  const h = parent?.clientHeight || window.innerHeight;
  return integerZoom(w, h);
}

/**
 * PROMPT.md §4.2: pixelArt (no antialias, roundPixels), 480×270, integer zoom only. Scale.NONE with
 * an explicit integer zoom is the "Scale.FIT with integer override": FIT would pick a fractional
 * factor, so the manager is told the integer directly and re-told on resize (DECISIONS.md).
 */
export function startGame(parentId: string): Phaser.Game {
  const parent = document.getElementById(parentId);
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: parentId,
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
    backgroundColor: '#0d0d14',
    pixelArt: true,
    roundPixels: true,
    antialias: false,
    scale: { mode: Phaser.Scale.NONE, zoom: viewportZoom(parent) },
    scene: [Boot, Preloader, Town],
  };
  const game = new Phaser.Game(config);
  const onResize = () => game.scale.setZoom(viewportZoom(parent));
  window.addEventListener('resize', onResize);
  game.events.once(Phaser.Core.Events.DESTROY, () =>
    window.removeEventListener('resize', onResize),
  );
  return game;
}
