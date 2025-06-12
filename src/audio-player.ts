import type { Note, WaveType, AudioPlayerInterface } from './types.js';
import { MusicTheory } from './music-theory.js';

let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let currentTimbre: WaveType = 'sine';

function init(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);
    masterGain.gain.value = 0.3;
  }
  return audioContext;
}

function playNote(frequency: number, duration: number = 1, startTime: number = 0): OscillatorNode {
  const ctx = init();
  
  const oscillator = ctx.createOscillator();
  const envelope = ctx.createGain();
  
  oscillator.connect(envelope);
  envelope.connect(masterGain!);
  
  oscillator.type = currentTimbre;
  oscillator.frequency.value = frequency;
  
  const now = ctx.currentTime + startTime;
  envelope.gain.value = 0;
  envelope.gain.linearRampToValueAtTime(0.3, now + 0.05);
  envelope.gain.exponentialRampToValueAtTime(0.01, now + duration);
  
  oscillator.start(now);
  oscillator.stop(now + duration);
  
  return oscillator;
}

function playChord(notes: Note[], octave: number = 4, duration: number = 2, bassNote?: Note): OscillatorNode[] {
  const oscillators: OscillatorNode[] = [];
  
  notes.forEach((note, index) => {
    // ベース音（最初の音）は1オクターブ下げる
    const noteOctave = (bassNote && index === 0 && note === bassNote) ? octave - 1 : octave;
    const midiNote = MusicTheory.getMidiNote(note, noteOctave);
    if (midiNote !== null) {
      const frequency = MusicTheory.getFrequency(midiNote);
      // startDelayを0にして同時再生
      const osc = playNote(frequency, duration, 0);
      oscillators.push(osc);
    }
  });
  
  return oscillators;
}

function playArpeggio(notes: Note[], octave: number = 4, noteLength: number = 0.3, gap: number = 0.1): OscillatorNode[] {
  const oscillators: OscillatorNode[] = [];
  
  notes.forEach((note, index) => {
    const midiNote = MusicTheory.getMidiNote(note, octave);
    if (midiNote !== null) {
      const frequency = MusicTheory.getFrequency(midiNote);
      const startTime = index * (noteLength + gap);
      const osc = playNote(frequency, noteLength, startTime);
      oscillators.push(osc);
    }
  });
  
  return oscillators;
}

function setVolume(value: number): void {
  if (masterGain) {
    masterGain.gain.value = Math.max(0, Math.min(1, value));
  }
}

function suspend(): void {
  if (audioContext && audioContext.state === 'running') {
    audioContext.suspend();
  }
}

function resume(): void {
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

function setTimbre(timbre: WaveType): void {
  if (['sine', 'square', 'sawtooth', 'triangle'].includes(timbre)) {
    currentTimbre = timbre;
  }
}

function getTimbre(): WaveType {
  return currentTimbre;
}

export const AudioPlayer: AudioPlayerInterface = {
  init,
  playNote,
  playChord,
  playArpeggio,
  setVolume,
  suspend,
  resume,
  setTimbre,
  getTimbre
};