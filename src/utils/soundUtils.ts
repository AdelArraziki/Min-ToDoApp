/**
 * Web Audio API chime sound generator for alarms.
 * Self-contained without external audio files.
 */
export function playAlarmChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // Dual-tone gentle bell sequence
    const notes = [
      { freq: 587.33, start: 0, duration: 0.25 },     // D5
      { freq: 880.00, start: 0.15, duration: 0.35 },    // A5
      { freq: 1174.66, start: 0.35, duration: 0.5 },   // D6
    ];

    notes.forEach((note) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.start);

      // Attack and gentle exponential decay
      gain.gain.setValueAtTime(0.001, ctx.currentTime + note.start);
      gain.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + note.start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + note.start + note.duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + note.start);
      osc.stop(ctx.currentTime + note.start + note.duration);
    });
  } catch (err) {
    console.warn('Could not play alarm chime audio', err);
  }
}

/**
 * Request notification permissions from user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  try {
    if (Notification.permission === 'granted') {
      return true;
    }
    const result = await Notification.requestPermission();
    return result === 'granted';
  } catch {
    return false;
  }
}

/**
 * Send browser notification if supported and granted
 */
export function sendBrowserNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
      });
    } catch {
      // Fallback silently if blocked by environment
    }
  }
}
