import type { AgentEvent, AgentSummary, ClockSummary } from '@agent-town/schema';
import Phaser, { Scene } from 'phaser';
import { Actor } from '../game/town/Actor.ts';
import {
  CAMERA_LERP,
  CAMERA_PAN_SPEED,
  DEPTH,
  FIRM_GLOW_ALPHA,
  NIGHT,
  SEASONS,
  SMOKE_ALPHA,
  SMOKE_FPS,
  SMOKE_RISE_MS,
  SMOKE_RISE_PX,
  TILESET_NAME,
  WATER_FRAME_MS,
} from '../game/config.ts';
import { EventBus } from '../game/EventBus.ts';
import { darknessAt, townState } from '../game/state.ts';

type Season = (typeof SEASONS)[number];

interface TiledObject {
  name?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  properties?: { name: string; value: unknown }[];
}

/** Tallyford (PROMPT.md §7.5): the map in the season the clock says, the firm's agents on Firm Hill. */
export class Town extends Scene {
  private season: Season = 'spring';
  private waterLayer?: Phaser.Tilemaps.TilemapLayer;
  private waterCycle = new Map<number, number>();
  private camTarget: { x: number; y: number } | null = null;
  private waterTimer = 0;
  private actors = new Map<string, Actor>();
  private spawns: Phaser.Math.Vector2[] = [];
  private wander = new Phaser.Geom.Rectangle(0, 0, 1, 1);
  private night?: Phaser.GameObjects.Rectangle;
  private glows: { sprite: Phaser.GameObjects.Image; kind: string }[] = [];
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private dragFrom: { x: number; y: number; sx: number; sy: number } | null = null;

  constructor() {
    super('Town');
  }

  init(data: { season?: Season }) {
    this.season = data.season ?? (townState.clock?.season as Season | undefined) ?? 'spring';
  }

  create() {
    const map = this.make.tilemap({ key: 'town' });
    const tiles = map.addTilesetImage(TILESET_NAME, `tiles-${this.season}`);
    if (!tiles) throw new Error('tileset missing: run pnpm art:build');
    const layer = (name: string, depth: number) => {
      const l = map.createLayer(name, tiles, 0, 0);
      if (!(l instanceof Phaser.Tilemaps.TilemapLayer))
        throw new Error(`layer ${name} missing in town.json`);
      return l.setDepth(depth);
    };
    layer('ground', DEPTH.ground);
    layer('edges', DEPTH.edges);
    this.waterLayer = layer('water', DEPTH.water);
    layer('objects', DEPTH.objects);
    layer('buildings', DEPTH.buildings);
    layer('above', DEPTH.above);
    const props = map.properties as { name: string; value: string }[] | undefined;
    const cycle = Array.isArray(props) ? props.find((p) => p.name === 'waterCycle') : undefined;
    if (cycle)
      for (const [a, b] of Object.entries(JSON.parse(cycle.value) as Record<string, number>))
        this.waterCycle.set(Number(a), b);

    // zones: a label in the pixel font on a dark plate
    for (const o of (map.getObjectLayer('zones')?.objects ?? []) as TiledObject[]) {
      const unlock = o.properties?.find((p) => p.name === 'unlock')?.value;
      const text = (
        unlock === 'Start' || typeof unlock !== 'string' ? (o.name ?? '') : `${o.name} (${unlock})`
      ).toUpperCase();
      const x = (o.x ?? 0) + 5;
      const y = (o.y ?? 0) + 4;
      const label = this.add.bitmapText(x, y, 'tally', text).setDepth(DEPTH.labels);
      this.add.bitmapText(x + 1, y + 1, 'tally-ink', text).setDepth(DEPTH.labels - 1);
      this.add
        .rectangle(x - 3, y - 3, label.width + 8, 13, 0x15121c, 0.55)
        .setOrigin(0, 0)
        .setDepth(DEPTH.labels - 2);
    }
    // spawns and the wander rectangle for the firm's agents
    for (const o of (map.getObjectLayer('spawns')?.objects ?? []) as TiledObject[]) {
      if (o.name === 'wander')
        this.wander = new Phaser.Geom.Rectangle(o.x ?? 0, o.y ?? 0, o.width ?? 1, o.height ?? 1);
      else this.spawns.push(new Phaser.Math.Vector2(o.x ?? 0, o.y ?? 0));
    }
    // lights: additive warm masks over windows, lamps and lanterns
    for (const o of (map.getObjectLayer('lights')?.objects ?? []) as TiledObject[]) {
      const kind = String(o.properties?.find((p) => p.name === 'kind')?.value ?? 'window');
      const sprite = this.add
        .image(o.x ?? 0, o.y ?? 0, 'ui', 'light')
        .setDepth(DEPTH.lights)
        .setBlendMode(Phaser.BlendModes.ADD)
        .setAlpha(0);
      if (kind === 'lamp' || kind === 'lantern') sprite.setScale(kind === 'lamp' ? 1 : 0.6);
      else sprite.setScale(0.7);
      this.glows.push({ sprite, kind });
    }
    // chimney smoke: three frames looping, drifting up and fading, then starting again
    if (!this.anims.exists('smoke'))
      this.anims.create({
        key: 'smoke',
        frames: [0, 1, 2].map((i) => ({ key: 'ui', frame: `smoke-${i}` })),
        frameRate: SMOKE_FPS,
        repeat: -1,
      });
    for (const o of (map.getObjectLayer('smoke')?.objects ?? []) as TiledObject[]) {
      const puff = this.add
        .sprite(o.x ?? 0, o.y ?? 0, 'ui', 'smoke-0')
        .setOrigin(0.5, 1)
        .setDepth(DEPTH.above + 1)
        .setAlpha(SMOKE_ALPHA[0]);
      puff.play('smoke');
      this.tweens.add({
        targets: puff,
        y: (o.y ?? 0) - SMOKE_RISE_PX,
        alpha: SMOKE_ALPHA[1],
        duration: SMOKE_RISE_MS,
        repeat: -1,
        yoyo: false,
        ease: 'Sine.easeOut',
      });
    }
    this.night = this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, NIGHT.color, 0)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(DEPTH.night);

    const cam = this.cameras.main;
    cam.setRoundPixels(true);
    cam.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    cam.centerOn(this.wander.centerX, this.wander.centerY - 4);
    this.cursors = this.input.keyboard?.createCursorKeys();
    this.wasd = this.input.keyboard?.addKeys('W,A,S,D') as typeof this.wasd;
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      this.dragFrom = { x: p.x, y: p.y, sx: cam.scrollX, sy: cam.scrollY };
    });
    this.input.on('pointerup', () => (this.dragFrom = null));
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (!this.dragFrom || !p.isDown) return;
      this.camTarget = {
        x: this.dragFrom.sx - (p.x - this.dragFrom.x) / cam.zoom,
        y: this.dragFrom.sy - (p.y - this.dragFrom.y) / cam.zoom,
      };
    });

    EventBus.on('agents', this.onAgents, this);
    EventBus.on('agent_event', this.onEvent, this);
    EventBus.on('clock', this.onClock, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      EventBus.off('agents', this.onAgents, this);
      EventBus.off('agent_event', this.onEvent, this);
      EventBus.off('clock', this.onClock, this);
      for (const a of this.actors.values()) a.destroy();
      this.actors.clear();
    });
    if (townState.agents.length) this.onAgents(townState.agents);
    if (townState.clock) this.onClock(townState.clock);
    EventBus.emit('town-ready', this);
  }

  private onAgents(agents: AgentSummary[]): void {
    agents.forEach((a, i) => {
      const actor = this.actors.get(a.id);
      if (actor) actor.apply(a);
      else if (this.textures.get('characters').has(`${a.id}/down/0`)) {
        const home =
          this.spawns[i % Math.max(1, this.spawns.length)] ??
          new Phaser.Math.Vector2(this.wander.centerX, this.wander.centerY);
        this.actors.set(a.id, new Actor(this, a.id, a, home.clone(), this.wander, i + 1));
      }
    });
    window.__townAgents = this.actors.size;
  }

  private onEvent(e: AgentEvent): void {
    const actor = this.actors.get(e.agent_id);
    if (!actor) return;
    if (e.type === 'thought_comment') actor.say(e.payload.text);
    else if (e.type === 'message') actor.showEmote('letter');
    else if (e.type === 'task_complete') actor.showEmote('heart');
    else if (e.type === 'report') actor.showEmote('gear');
  }

  private onClock(clock: ClockSummary): void {
    if (clock.season !== this.season && SEASONS.includes(clock.season)) {
      this.scene.restart({ season: clock.season });
      return;
    }
    const dark = darknessAt(clock.hhmm, NIGHT);
    this.night?.setAlpha(dark);
    for (const l of this.glows) {
      const night = dark / NIGHT.max;
      const firm = l.kind === 'firm' && clock.market_open ? FIRM_GLOW_ALPHA : 0;
      l.sprite.setAlpha(Math.max(night, firm));
    }
  }

  override update(time: number, delta: number) {
    this.waterTimer += delta;
    if (this.waterTimer >= WATER_FRAME_MS && this.waterLayer && this.waterCycle.size) {
      this.waterTimer = 0;
      const cycle = this.waterCycle;
      this.waterLayer.forEachTile((tile) => {
        const next = cycle.get(tile.index);
        if (next !== undefined) tile.index = next;
      });
    }
    for (const a of this.actors.values()) a.update(time, delta);
    for (const a of this.actors.values()) a.separate(this.actors.values());
    const cam = this.cameras.main;
    const step = (CAMERA_PAN_SPEED * delta) / 1000;
    const k = this.cursors;
    const w = this.wasd;
    const target = this.camTarget ?? { x: cam.scrollX, y: cam.scrollY };
    if (k?.left.isDown || w?.A.isDown) target.x -= step;
    if (k?.right.isDown || w?.D.isDown) target.x += step;
    if (k?.up.isDown || w?.W.isDown) target.y -= step;
    if (k?.down.isDown || w?.S.isDown) target.y += step;
    this.camTarget = target;
    cam.scrollX += (target.x - cam.scrollX) * CAMERA_LERP;
    cam.scrollY += (target.y - cam.scrollY) * CAMERA_LERP;
    if (Math.abs(target.x - cam.scrollX) < 0.3) cam.scrollX = target.x;
    if (Math.abs(target.y - cam.scrollY) < 0.3) cam.scrollY = target.y;
  }
}
