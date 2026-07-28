// Silent Web Audio API Synthesizer (Sound FX disabled per user configuration)
class AudioEffects {
  constructor() {
    this.ctx = null;
    this.enabled = false; // Sound completely disabled
  }

  initContext() {}

  playTradeSuccess() {
    // Silent — trade sounds removed
    return;
  }

  playAlertChime() {
    // Silent — alert chimes removed
    return;
  }

  playPriceTick() {
    // Silent — tick sounds removed
    return;
  }
}

export const audioFx = new AudioEffects();
