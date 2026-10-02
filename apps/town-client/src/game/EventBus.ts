import { Events } from 'phaser';

/** React ↔ Phaser bridge (PROMPT.md §3.1: the template's EventBus). */
export const EventBus = new Events.EventEmitter();
