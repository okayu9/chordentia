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
  // Single flats
  Db: 'C#',
  Eb: 'D#',
  Gb: 'F#',
  Ab: 'G#',
  Bb: 'A#',
  Cb: 'B',
  Fb: 'E',
  
  // Double flats
  Dbb: 'C',
  Ebb: 'D',
  Fbb: 'D#', // F double-flat = Eb = D#
  Gbb: 'F',
  Abb: 'G',
  Bbb: 'A',
  Cbb: 'A#', // C double-flat = Bb = A#
  
  // Double sharps
  'C##': 'D',
  'D##': 'E',
  'E##': 'F#',
  'F##': 'G',
  'G##': 'A',
  'A##': 'B',
  'B##': 'C#',
} as const;

// MIDI note mappings
export const NOTE_TO_MIDI: Readonly<Record<string, number>> = {
  C: 60,
  'C#': 61,
  'C##': 62, // C double-sharp = D
  Db: 61,
  Dbb: 60, // D double-flat = C
  D: 62,
  'D#': 63,
  'D##': 64, // D double-sharp = E
  Eb: 63,
  Ebb: 62, // E double-flat = D
  E: 64,
  'E##': 66, // E double-sharp = F#
  Fb: 64, // F-flat = E
  Fbb: 63, // F double-flat = Eb
  F: 65,
  'F#': 66,
  'F##': 67, // F double-sharp = G
  Gb: 66,
  Gbb: 65, // G double-flat = F
  G: 67,
  'G#': 68,
  'G##': 69, // G double-sharp = A
  Ab: 68,
  Abb: 67, // A double-flat = G
  A: 69,
  'A#': 70,
  'A##': 71, // A double-sharp = B
  Bb: 70,
  Bbb: 69, // B double-flat = A
  B: 71,
  'B##': 61, // B double-sharp = C# (next octave, but same pitch class)
  Cb: 71, // C-flat = B
  Cbb: 70, // C double-flat = Bb
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
