import { Scene } from 'phaser';
import { ASSETS, SEASONS } from '../game/config.ts';

/** Loads everything `pnpm art:build` compiled under assets/tallyford. */
export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  preload() {
    const bar = this.add.rectangle(240, 135, 4, 6, 0xc9a66b);
    this.load.on('progress', (p: number) => {
      bar.width = 4 + 200 * p;
    });
    this.load.setPath(ASSETS);
    for (const s of SEASONS) this.load.image(`tiles-${s}`, `tiles-${s}.png`);
    this.load.tilemapTiledJSON('town', 'town.json');
    this.load.atlas('characters', 'characters.png', 'characters.json');
    this.load.atlas('ui', 'ui.png', 'ui.json');
    this.load.bitmapFont('tally', 'font/tally.png', 'font/tally.xml');
    this.load.bitmapFont('tally-ink', 'font/tally-ink.png', 'font/tally-ink.xml');
  }

  create() {
    this.scene.start('Town');
  }
}
