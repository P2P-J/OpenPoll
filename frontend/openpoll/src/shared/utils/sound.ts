/**
 * Sound effect utility for playing audio feedback
 *
 * This uses the Web Audio API to generate simple sound effects.
 * For production, you might want to use actual audio files.
 */

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Initialize AudioContext on first user interaction
    if (typeof window !== 'undefined') {
      document.addEventListener('click', () => this.initAudioContext(), { once: true });
    }
  }

  private initAudioContext() {
    if (!this.audioContext && typeof window !== 'undefined') {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('Web Audio API not supported:', error);
      }
    }
  }

  /**
   * Play a simple beep sound effect
   */
  private playBeep(frequency: number = 800, duration: number = 100, volume: number = 0.1) {
    if (!this.enabled || !this.audioContext) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + duration / 1000
      );

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }

  /**
   * Play vote click sound - a pleasant "ding" sound
   */
  playVoteSound() {
    this.initAudioContext();
    // Play two quick tones for a pleasant "ding" effect
    this.playBeep(800, 50, 0.08);
    setTimeout(() => this.playBeep(1000, 50, 0.06), 50);
  }

  /**
   * Play error sound - lower tone
   */
  playErrorSound() {
    this.initAudioContext();
    this.playBeep(300, 200, 0.1);
  }

  /**
   * Play success sound - ascending tones
   */
  playSuccessSound() {
    this.initAudioContext();
    this.playBeep(600, 80, 0.08);
    setTimeout(() => this.playBeep(800, 80, 0.08), 80);
    setTimeout(() => this.playBeep(1000, 120, 0.06), 160);
  }

  /**
   * Enable or disable sound effects
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  /**
   * Check if sound is enabled
   */
  isEnabled() {
    return this.enabled;
  }
}

// Singleton instance
const soundManager = new SoundManager();

/**
 * Play a sound effect
 * @param effect - Type of sound effect to play
 */
export function playSoundEffect(effect: 'vote' | 'error' | 'success') {
  switch (effect) {
    case 'vote':
      soundManager.playVoteSound();
      break;
    case 'error':
      soundManager.playErrorSound();
      break;
    case 'success':
      soundManager.playSuccessSound();
      break;
  }
}

/**
 * Enable or disable sound effects globally
 */
export function setSoundEnabled(enabled: boolean) {
  soundManager.setEnabled(enabled);
}

/**
 * Check if sound is enabled
 */
export function isSoundEnabled() {
  return soundManager.isEnabled();
}
