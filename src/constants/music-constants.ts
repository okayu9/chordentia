import type { Note, ChordQuality } from '../types.js';

// Musical constants
export const SEMITONES_IN_OCTAVE = 12;
export const DEFAULT_OCTAVE = 4;
export const DEFAULT_DURATION = 2; // seconds
export const A4_FREQUENCY = 440; // Hz
export const A4_MIDI_NOTE = 69;

// Note arrays
export const SHARP_NOTES: readonly Note[] = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const;

export const FLAT_NOTES: readonly Note[] = [
  'C',
  'Db',
  'D',
  'Eb',
  'Ebb',
  'E',
  'F',
  'Gb',
  'G',
  'Ab',
  'Abb',
  'A',
  'Bb',
  'Bbb',
  'B',
] as const;

// Enharmonic mappings
export const ENHARMONIC_EQUIVALENTS: Readonly<Record<string, string>> = {
  'C#': 'Db',
  'D#': 'Eb',
  'F#': 'Gb',
  'G#': 'Ab',
  'A#': 'Bb',
  Cb: 'B',
  Fb: 'E',
  Ebb: 'D',
  Abb: 'G',
  Bbb: 'A',
} as const;

export const REVERSE_ENHARMONIC: Readonly<Record<string, string>> = {
  Db: 'C#',
  Eb: 'D#',
  Gb: 'F#',
  Ab: 'G#',
  Bb: 'A#',
  Ebb: 'D',
  Abb: 'G',
  Bbb: 'A',
} as const;

// MIDI note mappings
export const NOTE_TO_MIDI: Readonly<Record<string, number>> = {
  C: 60,
  'C#': 61,
  Db: 61,
  D: 62,
  'D#': 63,
  Eb: 63,
  Ebb: 62,
  E: 64,
  Fb: 64,
  F: 65,
  'F#': 66,
  Gb: 66,
  G: 67,
  'G#': 68,
  Ab: 68,
  Abb: 67,
  A: 69,
  'A#': 70,
  Bb: 70,
  Bbb: 69,
  B: 71,
  Cb: 71,
} as const;

// Chord qualities to skip in find possible chords
export const SKIP_CHORD_QUALITIES: readonly ChordQuality[] = [
  'maj',
  '+5',
  '7+5',
  'maj7+5',
  'min',
  'min7',
  'omit3',
  'omit5',
  'maj7(omit3)',
  'sus',
  '5',
] as const;

// Default values
export const DEFAULT_CHORD_QUALITY: ChordQuality = 'maj';
export const EMPTY_CHORD_QUALITY: ChordQuality = '';

// UI Constants
export const MIN_NOTES_FOR_CHORD_SUGGESTION = 2;
export const DEFAULT_SIMPLICITY_PENALTY = 0.01;
export const EXACT_MATCH_BOOST = 1000;
