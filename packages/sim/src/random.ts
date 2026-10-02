/** mulberry32: a small seeded PRNG so every sim run with the same seed emits the same events. */
export class Rng {
  private state: number;
  constructor(seed: number) {
    this.state = seed >>> 0;
  }
  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  int(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min + 1));
  }
  pick<T>(items: readonly T[]): T {
    return items[Math.floor(this.next() * items.length)] as T;
  }
  hex(bytes: number): string {
    let s = '';
    for (let i = 0; i < bytes; i++) s += this.int(0, 255).toString(16).padStart(2, '0');
    return s;
  }
  /** RFC 4122 version-4 layout from seeded bytes. */
  uuid(): string {
    const h = this.hex(16).split('');
    h[12] = '4';
    h[16] = ['8', '9', 'a', 'b'][this.int(0, 3)] as string;
    const s = h.join('');
    return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20, 32)}`;
  }
}
