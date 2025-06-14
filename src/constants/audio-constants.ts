import type { WaveType } from '../types.js';

// Audio constants
export const AUDIO_DEFAULTS = {
  MASTER_VOLUME: 0.3,
  NOTE_VOLUME: 0.3,
  DEFAULT_DURATION: 1, // seconds
  DEFAULT_OCTAVE: 4,
  BASS_OCTAVE_OFFSET: -1,
  ATTACK_TIME: 0.05, // seconds
  MIN_VOLUME: 0.01,
  MIN_CHORD_VOLUME: 0,
  MAX_CHORD_VOLUME: 1,
};

export const ARPEGGIO_DEFAULTS = {
  NOTE_LENGTH: 0.3, // seconds
  GAP: 0.1, // seconds between notes
};

export const ENVELOPE_SETTINGS = {
  ATTACK_TIME: 0.05,
  RELEASE_TIME: 0.01,
};

export const SUPPORTED_WAVE_TYPES: readonly WaveType[] = [
  'sine',
  'square',
  'sawtooth',
  'triangle',
] as const;

export const DEFAULT_TIMBRE: WaveType = 'sine';
