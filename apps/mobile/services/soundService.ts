import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';
import { useSettingsStore } from '../stores/settingsStore';

// Static requires so Metro bundles every sound asset
const SOURCES = {
  draw: require('../assets/sounds/draw.wav'),
  play: require('../assets/sounds/play.wav'),
  uno: require('../assets/sounds/uno.wav'),
  win: require('../assets/sounds/win.wav'),
  error: require('../assets/sounds/error.wav'),
  pick: require('../assets/sounds/pick.wav'),
  turn: require('../assets/sounds/turn.wav'),
  caught: require('../assets/sounds/caught.wav'),
  click: require('../assets/sounds/click.wav'),
  pop: require('../assets/sounds/pop.wav'),
  reverse: require('../assets/sounds/reverse.wav'),
} as const;

export type SoundName = keyof typeof SOURCES;

/**
 * Cooldown (ms) per sound — prevents rapid-fire bot turns from
 * stacking into an indistinguishable mush. A single player instance
 * per type + a short quiet window per type keeps it tactile.
 */
const COOLDOWN_MS: Partial<Record<SoundName, number>> = {
  draw: 90,
  play: 90,
  turn: 350,   // fires on every turn — must never overlap into noise
  click: 60,
  pop: 120,
  uno: 250,
  caught: 250,
  reverse: 250,
  win: 500,
};

class SoundService {
  private players: Partial<Record<SoundName, AudioPlayer>> = {};
  private lastPlayed: Partial<Record<SoundName, number>> = {};
  private ready = false;

  async init() {
    try {
      await setAudioModeAsync({ playsInSilentMode: true });
      (Object.keys(SOURCES) as SoundName[]).forEach((name) => {
        this.players[name] = createAudioPlayer(SOURCES[name]);
      });
      this.ready = true;
    } catch (e) {
      console.warn('[sound] unavailable', e);
    }
  }

  play(name: SoundName) {
    if (!this.ready) return;
    if (!useSettingsStore.getState().soundEnabled) return;

    // Cooldown gate
    const now = Date.now();
    const cooldown = COOLDOWN_MS[name] ?? 0;
    const last = this.lastPlayed[name] ?? 0;
    if (now - last < cooldown) return;
    this.lastPlayed[name] = now;

    try {
      const p = this.players[name];
      if (!p) return;
      try { p.seekTo(0); } catch { /* not seekable */ }
      p.play();
    } catch (e) {
      // Never let audio break gameplay
    }
  }
}

export const soundService = new SoundService();
