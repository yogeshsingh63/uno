// ============================================================
// SoundService — Lightweight sound manager (muted for high performance)
// ============================================================
export type SoundName =
  | 'draw' | 'play' | 'uno' | 'win' | 'error' | 'pick'
  | 'turn' | 'caught' | 'click' | 'pop' | 'reverse';

class SoundService {
  async init() {
    // Audio initialization disabled for maximum performance & zero latency
  }

  play(_name: SoundName) {
    // Sound disabled per user request for performance
  }
}

export const soundService = new SoundService();
