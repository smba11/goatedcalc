export function createSoundController() {
  let enabled = false;
  let audioContext = null;

  function playTone(frequency, duration, type = 'sine') {
    if (!enabled) {
      return;
    }

    audioContext ??= new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.035, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  }

  return {
    get enabled() {
      return enabled;
    },
    setEnabled(nextEnabled) {
      enabled = nextEnabled;
    },
    buttonPress() {
      playTone(420, 0.08, 'triangle');
    },
    footstep() {
      playTone(220, 0.05, 'sine');
    },
  };
}
