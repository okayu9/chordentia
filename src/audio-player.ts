import type { Note, WaveType, AudioPlayerInterface } from './types.js';
import { MusicTheory } from './music-theory.js';
import {
  AUDIO_DEFAULTS,
  ARPEGGIO_DEFAULTS,
  ENVELOPE_SETTINGS,
  SUPPORTED_WAVE_TYPES,
  DEFAULT_TIMBRE,
} from './constants/audio-constants.js';

class AudioEngine {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentTimbre: WaveType = DEFAULT_TIMBRE;
  private activeOscillators: Set<OscillatorNode> = new Set();

  init(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = AUDIO_DEFAULTS.MASTER_VOLUME;
    }
    return this.audioContext;
  }

  playNote(frequency: number, duration = AUDIO_DEFAULTS.DEFAULT_DURATION, startTime = 0): OscillatorNode {
    const ctx = this.init();
    
    const oscillator = this.createOscillator(ctx, frequency);
    const envelope = this.createEnvelope(ctx, duration, startTime);
    
    this.connectNodes(oscillator, envelope);
    this.scheduleNote(oscillator, envelope, ctx.currentTime + startTime, duration);
    
    this.trackOscillator(oscillator, ctx.currentTime + startTime + duration);
    
    return oscillator;
  }

  playChord(
    notes: Note[],
    octave = AUDIO_DEFAULTS.DEFAULT_OCTAVE,
    duration = AUDIO_DEFAULTS.DEFAULT_DURATION,
    bassNote?: Note
  ): OscillatorNode[] {
    const oscillators: OscillatorNode[] = [];

    for (let i = 0; i < notes.length; i++) {
      const note = notes[i]!;
      const noteOctave = this.calculateNoteOctave(note, bassNote, i, octave);
      const frequency = this.getFrequencyForNote(note, noteOctave);
      
      if (frequency !== null) {
        const oscillator = this.playNote(frequency, duration, 0);
        oscillators.push(oscillator);
      }
    }

    return oscillators;
  }

  playArpeggio(
    notes: Note[],
    octave = AUDIO_DEFAULTS.DEFAULT_OCTAVE,
    noteLength = ARPEGGIO_DEFAULTS.NOTE_LENGTH,
    gap = ARPEGGIO_DEFAULTS.GAP
  ): OscillatorNode[] {
    const oscillators: OscillatorNode[] = [];

    for (let i = 0; i < notes.length; i++) {
      const note = notes[i]!;
      const frequency = this.getFrequencyForNote(note, octave);
      
      if (frequency !== null) {
        const startTime = i * (noteLength + gap);
        const oscillator = this.playNote(frequency, noteLength, startTime);
        oscillators.push(oscillator);
      }
    }

    return oscillators;
  }

  setVolume(value: number): void {
    if (this.masterGain) {
      const clampedValue = Math.max(
        AUDIO_DEFAULTS.MIN_CHORD_VOLUME,
        Math.min(AUDIO_DEFAULTS.MAX_CHORD_VOLUME, value)
      );
      this.masterGain.gain.value = clampedValue;
    }
  }

  suspend(): void {
    if (this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend();
    }
  }

  resume(): void {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  setTimbre(timbre: WaveType): void {
    if (this.isValidWaveType(timbre)) {
      this.currentTimbre = timbre;
    }
  }

  getTimbre(): WaveType {
    return this.currentTimbre;
  }

  stopAllNotes(): void {
    this.activeOscillators.forEach((oscillator) => {
      try {
        oscillator.stop();
      } catch (error) {
        // Oscillator may already be stopped
      }
    });
    this.activeOscillators.clear();
  }

  private createOscillator(ctx: AudioContext, frequency: number): OscillatorNode {
    const oscillator = ctx.createOscillator();
    oscillator.type = this.currentTimbre;
    oscillator.frequency.value = frequency;
    return oscillator;
  }

  private createEnvelope(ctx: AudioContext, duration: number, startTime: number): GainNode {
    const envelope = ctx.createGain();
    return envelope;
  }

  private connectNodes(oscillator: OscillatorNode, envelope: GainNode): void {
    oscillator.connect(envelope);
    envelope.connect(this.masterGain!);
  }

  private scheduleNote(
    oscillator: OscillatorNode,
    envelope: GainNode,
    startTime: number,
    duration: number
  ): void {
    // Configure envelope
    envelope.gain.value = 0;
    envelope.gain.linearRampToValueAtTime(
      AUDIO_DEFAULTS.NOTE_VOLUME,
      startTime + ENVELOPE_SETTINGS.ATTACK_TIME
    );
    envelope.gain.exponentialRampToValueAtTime(
      AUDIO_DEFAULTS.MIN_VOLUME,
      startTime + duration
    );

    // Schedule oscillator
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  private trackOscillator(oscillator: OscillatorNode, stopTime: number): void {
    this.activeOscillators.add(oscillator);
    
    // Remove from tracking when finished
    oscillator.addEventListener('ended', () => {
      this.activeOscillators.delete(oscillator);
    });
    
    // Fallback cleanup
    setTimeout(() => {
      this.activeOscillators.delete(oscillator);
    }, (stopTime - this.audioContext!.currentTime + 0.1) * 1000);
  }

  private calculateNoteOctave(note: Note, bassNote: Note | undefined, index: number, octave: number): number {
    // Bass note (first note) is played one octave lower
    const isBassNote = bassNote && index === 0 && note === bassNote;
    return isBassNote ? octave + AUDIO_DEFAULTS.BASS_OCTAVE_OFFSET : octave;
  }

  private getFrequencyForNote(note: Note, octave: number): number | null {
    const midiNote = MusicTheory.getMidiNote(note, octave);
    return midiNote !== null ? MusicTheory.getFrequency(midiNote) : null;
  }

  private isValidWaveType(timbre: string): timbre is WaveType {
    return SUPPORTED_WAVE_TYPES.includes(timbre as WaveType);
  }
}

// Create singleton instance
const audioEngine = new AudioEngine();

// Export the interface
export const AudioPlayer: AudioPlayerInterface = {
  init: () => audioEngine.init(),
  playNote: (frequency, duration, startTime) => audioEngine.playNote(frequency, duration, startTime),
  playChord: (notes, octave, duration, bassNote) => audioEngine.playChord(notes, octave, duration, bassNote),
  playArpeggio: (notes, octave, noteLength, gap) => audioEngine.playArpeggio(notes, octave, noteLength, gap),
  setVolume: (value) => audioEngine.setVolume(value),
  suspend: () => audioEngine.suspend(),
  resume: () => audioEngine.resume(),
  setTimbre: (timbre) => audioEngine.setTimbre(timbre),
  getTimbre: () => audioEngine.getTimbre(),
};