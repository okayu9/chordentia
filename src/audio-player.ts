import type { Note, WaveType, AudioPlayerInterface } from './types.js';
import { MusicTheory } from './music-theory.js';
import {
  AUDIO_DEFAULTS,
  ARPEGGIO_DEFAULTS,
  ENVELOPE_SETTINGS,
  ORGAN_SETTINGS,
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
    
    if (this.currentTimbre === 'organ') {
      return this.playOrganNote(ctx, frequency, duration, startTime);
    }
    
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
    oscillator.type = this.currentTimbre as OscillatorType;
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

  private playOrganNote(ctx: AudioContext, frequency: number, duration: number, startTime: number): OscillatorNode {
    const now = ctx.currentTime + startTime;
    
    // Create multiple oscillators for drawbar harmonics
    const oscillators: OscillatorNode[] = [];
    
    // Create main connection point
    const organGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    // Configure filter for organ tone
    filter.type = 'lowpass';
    filter.frequency.value = ORGAN_SETTINGS.FILTER_FREQUENCY;
    filter.Q.value = ORGAN_SETTINGS.FILTER_Q;
    
    // Create harmonics using drawbar-inspired synthesis
    const drawbarRatios = [0.5, 1, 1.5, 2, 3, 4, 5, 6, 8]; // Hammond organ harmonic ratios
    
    for (let i = 0; i < ORGAN_SETTINGS.HARMONICS.length && i < drawbarRatios.length; i++) {
      const amplitude = ORGAN_SETTINGS.HARMONICS[i]!;
      
      if (amplitude > 0.05) {
        const osc = ctx.createOscillator();
        const env = ctx.createGain();
        const vibrato = ctx.createOscillator();
        const vibratoGain = ctx.createGain();
        
        // Main oscillator
        osc.type = 'sine';
        osc.frequency.value = frequency * drawbarRatios[i]!;
        
        // Add slight detuning for thickness
        osc.detune.value = (Math.random() - 0.5) * ORGAN_SETTINGS.DETUNE_CENTS * 2;
        
        // Vibrato LFO
        vibrato.type = 'sine';
        vibrato.frequency.value = ORGAN_SETTINGS.VIBRATO_RATE;
        vibratoGain.gain.value = ORGAN_SETTINGS.VIBRATO_DEPTH;
        
        // Connect vibrato to frequency modulation
        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);
        
        // Connect oscillator through envelope
        osc.connect(env);
        env.connect(organGain);
        
        // Organ envelope (fast attack, no decay, full sustain, quick release)
        env.gain.value = 0;
        env.gain.linearRampToValueAtTime(
          amplitude * ORGAN_SETTINGS.BASE_VOLUME,
          now + ORGAN_SETTINGS.ATTACK_TIME
        );
        
        // Hold at full volume
        env.gain.setValueAtTime(
          amplitude * ORGAN_SETTINGS.BASE_VOLUME,
          now + duration
        );
        
        // Quick release
        env.gain.exponentialRampToValueAtTime(
          0.001,
          now + duration + ORGAN_SETTINGS.RELEASE_TIME
        );
        
        // Start oscillators
        vibrato.start(now);
        osc.start(now);
        
        // Stop oscillators
        const stopTime = now + duration + ORGAN_SETTINGS.RELEASE_TIME;
        vibrato.stop(stopTime);
        osc.stop(stopTime);
        
        oscillators.push(osc);
        this.trackOscillator(osc, stopTime);
      }
    }
    
    // Add subtle key click noise
    const click = ctx.createBufferSource();
    const clickBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.002, ctx.sampleRate);
    const clickData = clickBuffer.getChannelData(0);
    for (let i = 0; i < clickData.length; i++) {
      clickData[i] = (Math.random() * 2 - 1) * 0.1;
    }
    click.buffer = clickBuffer;
    
    const clickEnv = ctx.createGain();
    click.connect(clickEnv);
    clickEnv.connect(organGain);
    
    clickEnv.gain.value = 0.05;
    click.start(now);
    
    // Connect through filter to master
    organGain.connect(filter);
    filter.connect(this.masterGain!);
    
    // Set overall organ volume
    organGain.gain.value = 0.7;
    
    // Return the fundamental oscillator for compatibility
    return oscillators[0] || ctx.createOscillator();
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