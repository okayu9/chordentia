import type { ChordQuality } from '../types.js';

// Chord interval formulas (in semitones from root)
export const CHORD_FORMULAS: Readonly<Record<ChordQuality, readonly number[]>> = {
  // Basic chords
  '': [0, 4, 7], // Major (default)
  maj: [0, 4, 7], // Major (explicit)
  m: [0, 3, 7], // Minor
  min: [0, 3, 7], // Minor (alternate)
  '7': [0, 4, 7, 10], // Dominant 7th
  maj7: [0, 4, 7, 11], // Major 7th
  m7: [0, 3, 7, 10], // Minor 7th
  min7: [0, 3, 7, 10], // Minor 7th (alternate)

  // Diminished and augmented
  dim: [0, 3, 6], // Diminished
  dim7: [0, 3, 6, 9], // Diminished 7th
  m7b5: [0, 3, 6, 10], // Half-diminished 7th
  aug: [0, 4, 8], // Augmented
  '+5': [0, 4, 8], // Augmented (alternate)

  // Suspended chords
  sus2: [0, 2, 7], // Suspended 2nd
  sus4: [0, 5, 7], // Suspended 4th
  sus: [0, 5, 7], // Suspended (defaults to sus4)
  '7sus4': [0, 5, 7, 10], // 7th suspended 4th
  '9sus4': [0, 5, 7, 10, 14], // 9th suspended 4th

  // 6th chords
  '6': [0, 4, 7, 9], // Major 6th
  m6: [0, 3, 7, 9], // Minor 6th
  '6/9': [0, 4, 7, 9, 14], // 6th with 9th
  'maj6/9': [0, 4, 7, 9, 14], // Major 6th with 9th

  // 9th chords
  '9': [0, 4, 7, 10, 14], // Dominant 9th
  maj9: [0, 4, 7, 11, 14], // Major 9th
  m9: [0, 3, 7, 10, 14], // Minor 9th
  add9: [0, 4, 7, 14], // Add 9th

  // 11th chords
  m11: [0, 3, 7, 10, 14, 17], // Minor 11th
  add11: [0, 4, 7, 17], // Add 11th
  'add#11': [0, 4, 7, 18], // Add sharp 11th

  // 13th chords
  '13': [0, 4, 7, 10, 14, 21], // Dominant 13th
  m13: [0, 3, 7, 10, 14, 21], // Minor 13th
  add13: [0, 4, 7, 21], // Add 13th
  'add#13': [0, 4, 7, 22], // Add sharp 13th

  // Augmented variations
  'maj7+5': [0, 4, 8, 11], // Major 7th sharp 5
  '7+5': [0, 4, 8, 10], // 7th sharp 5

  // Omit chords
  omit5: [0, 4], // Omit 5th (major)
  'm(omit5)': [0, 3], // Omit 5th (minor)
  '7omit5': [0, 4, 10], // 7th omit 5th
  maj7omit5: [0, 4, 11], // Major 7th omit 5th
  m7omit5: [0, 3, 10], // Minor 7th omit 5th
  omit3: [0, 7], // Omit 3rd (power chord)
  '5': [0, 7], // Power chord
  'maj7(omit3)': [0, 7, 11], // Major 7th omit 3rd
  '7omit3': [0, 7, 10], // 7th omit 3rd
  sus2omit5: [0, 2], // Sus2 omit 5th
  sus4omit5: [0, 5], // Sus4 omit 5th
  '7sus4omit5': [0, 5, 10], // 7th sus4 omit 5th
  '9omit5': [0, 4, 10, 14], // 9th omit 5th
  m9omit5: [0, 3, 10, 14], // Minor 9th omit 5th

  // Altered dominant chords
  '7b9': [0, 4, 7, 10, 13], // 7th flat 9
  '7#9': [0, 4, 7, 10, 15], // 7th sharp 9
  '7b5': [0, 4, 6, 10], // 7th flat 5
  '7alt': [0, 4, 6, 10, 13, 15], // Altered dominant

  // Complex tensions
  '7(9)': [0, 4, 7, 10, 14], // 7th with 9th
  '7(13)': [0, 4, 7, 10, 21], // 7th with 13th
  '7(9,13)': [0, 4, 7, 10, 14, 21], // 7th with 9th and 13th
  '7(b9,b13)': [0, 4, 7, 10, 13, 20], // 7th with flat 9 and flat 13
  '7(b5,#9)': [0, 4, 6, 10, 15], // 7th flat 5 sharp 9
  '7(#5,b9)': [0, 4, 8, 10, 13], // 7th sharp 5 flat 9
  '7(#9,#11)': [0, 4, 7, 10, 15, 18], // 7th sharp 9 sharp 11
  '7(b9,#11)': [0, 4, 7, 10, 13, 18], // 7th flat 9 sharp 11
  '7(9,#11,13)': [0, 4, 7, 10, 14, 18, 21], // 7th with 9, #11, 13

  // Minor-major chords
  mM7: [0, 3, 7, 11], // Minor-major 7th
  mM9: [0, 3, 7, 11, 14], // Minor-major 9th
  mM11: [0, 3, 7, 11, 14, 17], // Minor-major 11th
  mM13: [0, 3, 7, 11, 14, 17, 21], // Minor-major 13th

  // Extended chords
  'm7(9)': [0, 3, 7, 10, 14], // Minor 7th with 9th
  'm7(11)': [0, 3, 7, 10, 17], // Minor 7th with 11th
  'm7(9,11)': [0, 3, 7, 10, 14, 17], // Minor 7th with 9th and 11th
  'm7b5(11)': [0, 3, 6, 10, 17], // Half-diminished with 11th
  'maj7(9)': [0, 4, 7, 11, 14], // Major 7th with 9th
  'maj7(13)': [0, 4, 7, 11, 21], // Major 7th with 13th
  'maj7(9,13)': [0, 4, 7, 11, 14, 21], // Major 7th with 9th and 13th

  // Augmented extensions
  'aug7(b9)': [0, 4, 8, 10, 13], // Augmented 7th flat 9
  'aug9(#11)': [0, 4, 8, 10, 14, 18], // Augmented 9th sharp 11
  'aug7#9': [0, 4, 8, 10, 15], // Augmented 7th sharp 9

  // Other notations
  '9b5': [0, 4, 6, 10, 14], // 9th flat 5
  '(9)': [0, 4, 7, 10, 14], // Tension 9th only
  '(11)': [0, 4, 7, 10, 17], // Tension 11th only
  '(13)': [0, 4, 7, 10, 21], // Tension 13th only
  add2: [0, 2, 4, 7], // Add 2nd
  add4: [0, 4, 5, 7], // Add 4th
  add6: [0, 4, 7, 9], // Add 6th
} as const;
