import type { AgentState, AgentSummary } from '@agent-town/schema';
import Phaser from 'phaser';
import {
  BUBBLE_LINE_CHARS,
  BUBBLE_MAX_LINES,
  BUBBLE_MS,
  DEPTH,
  EMOTE_MS,
  WALK_FPS,
  WALK_SPEED,
  WANDER_PAUSE_MS,
} from '../config.ts';
import { wrapBubble } from '../state.ts';

type Dir = 'down' | 'up' | 'left' | 'right';

/** One agent on the map: a sprite that strolls its forecourt, a name tag, a bubble and an emote. */
export class Actor {
  readonly sprite: Phaser.GameObjects.Sprite;
  private readonly label: Phaser.GameObjects.BitmapText;
  private readonly labelBack: Phaser.GameObjects.Rectangle;
  private bubble?: Phaser.GameObjects.Container;
  private bubbleUntil = 0;
  private emote?: Phaser.GameObjects.Sprite;
  private emoteUntil = 0;
  private target: Phaser.Math.Vector2 | null = null;
  private pauseUntil = 0;
  private dir: Dir = 'down';
  private state: AgentState = 'offline';
  private online = true;
  private readonly rng: () => number;

  constructor(
    private readonly scene: Phaser.Scene,
    readonly id: string,
    summary: AgentSummary,
    readonly home: Phaser.Math.Vector2,
    private readonly wander: Phaser.Geom.Rectangle,
    seed: number,
  ) {
    let a = seed >>> 0;
    this.rng = () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    this.sprite = scene.add
      .sprite(home.x, home.y, 'characters', `${id}/down/0`)
      .setOrigin(0.5, 1)
      .setDepth(DEPTH.actors);
    for (const d of ['down', 'up', 'left', 'right'] as const) {
      const key = `${id}-walk-${d}`;
      if (!scene.anims.exists(key))
        scene.anims.create({
          key,
          frames: scene.anims.generateFrameNames('characters', {
            prefix: `${id}/${d}/`,
            start: 0,
            end: 3,
          }),
          frameRate: WALK_FPS,
          repeat: -1,
        });
    }
    // the callsign tag shows on hover, so a crowd on the forecourt stays readable
    this.label = scene.add
      .bitmapText(home.x, home.y - 34, 'tally', summary.callsign)
      .setOrigin(0.5, 1)
      .setDepth(DEPTH.labels)
      .setVisible(false);
    this.labelBack = scene.add
      .rectangle(home.x, home.y - 37, this.label.width + 4, 9, 0x15121c, 0.75)
      .setOrigin(0.5, 0.5)
      .setDepth(DEPTH.labels - 1)
      .setVisible(false);
    this.sprite.setInteractive({ useHandCursor: true });
    this.sprite.on('pointerover', () => this.setTag(true));
    this.sprite.on('pointerout', () => this.setTag(false));
    this.pauseUntil = scene.time.now + this.rng() * WANDER_PAUSE_MS[1];
    this.apply(summary);
  }

  setTag(on: boolean): void {
    this.label.setVisible(on);
    this.labelBack.setVisible(on);
  }

  apply(summary: AgentSummary): void {
    const was = this.state;
    this.state = summary.state;
    this.online = summary.online;
    this.sprite.setAlpha(summary.online ? 1 : 0.45);
    if (summary.state !== was) {
      if (summary.state === 'waiting') this.showEmote('question');
      else if (summary.state === 'error') this.showEmote('exclaim');
      else if (summary.state === 'idle') this.showEmote('zzz');
      else if (summary.state === 'blocked') this.showEmote('exclaim');
    }
  }

  say(text: string): void {
    this.bubble?.destroy();
    const lines = wrapBubble(text, BUBBLE_LINE_CHARS, BUBBLE_MAX_LINES);
    const body = this.scene.add.bitmapText(0, 0, 'tally-ink', lines.join('\n')).setOrigin(0, 0);
    const w = Math.max(24, Math.ceil(body.width) + 10);
    const h = Math.max(16, Math.ceil(body.height) + 8);
    const back = this.scene.add.nineslice(0, 0, 'ui', 'bubble', w, h, 8, 8, 8, 8).setOrigin(0, 0);
    const tail = this.scene.add.image(10, h - 1, 'ui', 'bubble-tail').setOrigin(0, 0);
    body.setPosition(5, 4);
    this.bubble = this.scene.add.container(0, 0, [back, tail, body]).setDepth(DEPTH.bubbles);
    this.bubbleUntil = this.scene.time.now + BUBBLE_MS;
    this.placeBubble();
  }

  showEmote(kind: 'heart' | 'exclaim' | 'question' | 'zzz' | 'gear' | 'letter'): void {
    this.emote?.destroy();
    this.emote = this.scene.add
      .sprite(this.sprite.x, this.sprite.y - 36, 'ui', `emote-${kind}`)
      .setOrigin(0.5, 1)
      .setDepth(DEPTH.bubbles);
    this.emote.setScale(0.5);
    this.scene.tweens.add({
      targets: this.emote,
      scaleX: 1,
      scaleY: 1,
      duration: 160,
      ease: 'Back.easeOut',
    });
    this.emoteUntil = this.scene.time.now + EMOTE_MS;
  }

  private placeBubble(): void {
    if (!this.bubble) return;
    const back = this.bubble.list[0] as Phaser.GameObjects.NineSlice;
    this.bubble.setPosition(
      Math.round(this.sprite.x - 12),
      Math.round(this.sprite.y - 38 - back.height),
    );
  }

  private pickTarget(): void {
    const r = this.wander;
    const spread = this.state === 'working' ? 0.35 : 1;
    const cx = this.home.x + (this.rng() - 0.5) * r.width * spread;
    const cy = this.home.y + (this.rng() - 0.5) * r.height * spread;
    this.target = new Phaser.Math.Vector2(
      Phaser.Math.Clamp(cx, r.left + 8, r.right - 8),
      Phaser.Math.Clamp(cy, r.top + 24, r.bottom - 2),
    );
  }

  update(now: number, delta: number): void {
    if (this.bubble && now > this.bubbleUntil) {
      this.bubble.destroy();
      this.bubble = undefined;
    }
    if (this.emote && now > this.emoteUntil) {
      this.emote.destroy();
      this.emote = undefined;
    }
    const canWalk = this.online && (this.state === 'working' || this.state === 'idle');
    if (!canWalk) {
      this.target = null;
      this.sprite.anims.stop();
      this.sprite.setFrame(`${this.id}/${this.dir}/0`);
    } else if (!this.target) {
      if (now > this.pauseUntil) this.pickTarget();
    } else {
      const dx = this.target.x - this.sprite.x;
      const dy = this.target.y - this.sprite.y;
      const dist = Math.hypot(dx, dy);
      const step = (WALK_SPEED * delta) / 1000;
      if (dist <= step) {
        this.sprite.setPosition(Math.round(this.target.x), Math.round(this.target.y));
        this.target = null;
        this.pauseUntil =
          now + WANDER_PAUSE_MS[0] + this.rng() * (WANDER_PAUSE_MS[1] - WANDER_PAUSE_MS[0]);
        this.sprite.anims.stop();
        this.sprite.setFrame(`${this.id}/${this.dir}/0`);
      } else {
        this.dir =
          Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
        this.sprite.setPosition(
          this.sprite.x + (dx / dist) * step,
          this.sprite.y + (dy / dist) * step,
        );
        const key = `${this.id}-walk-${this.dir}`;
        if (this.sprite.anims.currentAnim?.key !== key || !this.sprite.anims.isPlaying)
          this.sprite.play(key);
      }
    }
    const x = Math.round(this.sprite.x);
    const y = Math.round(this.sprite.y);
    this.sprite.setDepth(DEPTH.actors + y / 10_000);
    this.label.setPosition(x, y - 34);
    this.labelBack.setPosition(x, y - 37);
    this.emote?.setPosition(x, y - 36);
    this.placeBubble();
  }

  destroy(): void {
    this.sprite.destroy();
    this.label.destroy();
    this.labelBack.destroy();
    this.bubble?.destroy();
    this.emote?.destroy();
  }
}
