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

// Organ-specific settings
export const ORGAN_SETTINGS = {
  ATTACK_TIME: 0.02, // Quick but not instant
  DECAY_TIME: 0.0, // No decay
  SUSTAIN_LEVEL: 1.0, // Full sustain like real organ
  RELEASE_TIME: 0.1, // Quick release
  // Drawbar-inspired harmonics (Hammond organ style)
  HARMONICS: [
    1.0,    // 16' - Sub-fundamental
    0.8,    // 8' - Fundamental
    0.7,    // 5⅓' - Third harmonic
    0.5,    // 4' - Octave
    0.4,    // 2⅔' - Fifth
    0.3,    // 2' - Super octave
    0.2,    // 1⅗' - Major third
    0.15,   // 1⅓' - Fifth
    0.1,    // 1' - Triple octave
  ],
  // Leslie speaker simulation
  VIBRATO_RATE: 6, // Hz
  VIBRATO_DEPTH: 3, // Cents
  // Filter settings for organ tone
  FILTER_FREQUENCY: 4000, // Bright tone
  FILTER_Q: 0.3, // Low Q for smooth response
  // Volume settings
  BASE_VOLUME: 0.3, // Lower volume for balance
  DETUNE_CENTS: 0.5, // Slight detuning for thickness
};

export const SUPPORTED_WAVE_TYPES: readonly WaveType[] = [
  'square',
  'sawtooth',
  'triangle',
  'organ',
] as const;

export const DEFAULT_TIMBRE: WaveType = 'triangle';
