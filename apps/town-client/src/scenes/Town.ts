import { Scene, type Types } from 'phaser';
import { EventBus } from '../game/EventBus.ts';

interface ZoneObject {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  unlock: string;
}

/** The Year 1 map (PROMPT.md §7.5) in placeholder tiles; no sprites until Phase 1. */
export class Town extends Scene {
  private cursors?: Types.Input.Keyboard.CursorKeys;

  constructor() {
    super('Town');
  }

  create() {
    const map = this.make.tilemap({ key: 'town' });
    const tiles = map.addTilesetImage('placeholder', 'placeholder-tiles');
    if (!tiles) throw new Error('placeholder tileset missing: run pnpm placeholders');
    map.createLayer('ground', tiles, 0, 0);
    map.createLayer('buildings', tiles, 0, 0);

    for (const z of this.zones(map)) {
      this.add
        .text(z.x + 2, z.y + 2, z.unlock === 'Start' ? z.name : `${z.name} (${z.unlock})`, {
          fontFamily: 'monospace',
          fontSize: '8px',
          color: '#f1e9d8',
          backgroundColor: '#1b1b2acc',
          padding: { x: 2, y: 1 },
          resolution: 1,
        })
        .setDepth(10);
    }

    const cam = this.cameras.main;
    cam.setRoundPixels(true);
    cam.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    const square = this.zones(map).find((z) => z.name === 'Town Square');
    cam.centerOn(
      square ? square.x + square.width / 2 : map.widthInPixels / 2,
      square ? square.y + square.height / 2 : map.heightInPixels / 2,
    );
    this.cursors = this.input.keyboard?.createCursorKeys();

    EventBus.emit('town-ready', this);
  }

  override update(_time: number, delta: number) {
    if (!this.cursors) return;
    const step = Math.round((delta / 1000) * 160);
    const cam = this.cameras.main;
    if (this.cursors.left.isDown) cam.scrollX -= step;
    if (this.cursors.right.isDown) cam.scrollX += step;
    if (this.cursors.up.isDown) cam.scrollY -= step;
    if (this.cursors.down.isDown) cam.scrollY += step;
  }

  private zones(map: Phaser.Tilemaps.Tilemap): ZoneObject[] {
    const layer = map.getObjectLayer('zones');
    return (layer?.objects ?? []).map((o) => {
      const props = (o.properties ?? []) as { name: string; value: unknown }[];
      const unlock = props.find((p) => p.name === 'unlock')?.value;
      return {
        name: o.name ?? '',
        x: o.x ?? 0,
        y: o.y ?? 0,
        width: o.width ?? 0,
        height: o.height ?? 0,
        unlock: typeof unlock === 'string' ? unlock : 'Start',
      };
    });
  }
}
