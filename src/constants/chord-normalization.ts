import type { ChordQuality } from '../types.js';

// Chord quality normalization mapping
export const CHORD_QUALITY_NORMALIZATION: Readonly<Record<string, ChordQuality>> = {
  // Augmented variations
  '+5': 'aug',
  augmented: 'aug',
  '+': 'aug',
  '#5': 'aug',

  // Minor variations
  min: 'm',
  minor: 'm',
  mi: 'm',
  '-': 'm',

  // Minor seventh variations
  min7: 'm7',
  minor7: 'm7',
  mi7: 'm7',
  '-7': 'm7',

  // Major seventh variations
  M7: 'maj7',
  major7: 'maj7',
  Maj7: 'maj7',
  MA7: 'maj7',
  Ma7: 'maj7',
  '△7': 'maj7',
  j7: 'maj7',
  M9: 'maj9',
  'M7(9)': 'maj7(9)',
  '△': 'maj7',

  // Minor-major seventh variations
  mM7: 'mM7',
  minmaj7: 'mM7',
  mmaj7: 'mM7',
  mMA7: 'mM7',

  // Minor-major extended variations
  mM13: 'mM13',
  minmaj13: 'mM13',
  mmaj13: 'mM13',
  mMA13: 'mM13',
  mM9: 'mM9',
  minmaj9: 'mM9',
  mmaj9: 'mM9',
  mMA9: 'mM9',
  mM11: 'mM11',
  minmaj11: 'mM11',
  mmaj11: 'mM11',
  mMA11: 'mM11',

  // Diminished variations
  diminished: 'dim',
  o: 'dim',
  '°': 'dim',
  dim7: 'dim7',
  diminished7: 'dim7',
  o7: 'dim7',
  '°7': 'dim7',

  // Half-diminished variations
  'half-dim': 'm7b5',
  ø: 'm7b5',
  'm7♭5': 'm7b5',
  'm7-5': 'm7b5',
  ø7: 'm7b5',

  // Suspended variations
  sus: 'sus4',
  suspended4: 'sus4',
  suspended2: 'sus2',
  suspended: 'sus4',

  // Dominant variations
  dom7: '7',
  dominant7: '7',

  // Tension notations
  '(b9)': '7b9',
  '7(b9)': '7b9',
  '(13)': '7(13)',
  '7(13)': '7(13)',
  '(#9)': '7#9',
  '7(#9)': '7#9',
  '(9)': '(9)',
  '7(9)': '7(9)',
  '(b9,b13)': '7(b9,b13)',
  '7(b9,b13)': '7(b9,b13)',
  '(9,13)': '7(9,13)',
  '7(9,13)': '7(9,13)',
  '(11)': '(11)',
  '(b5,#9)': '7(b5,#9)',
  '7(b5,#9)': '7(b5,#9)',
  '(#5,b9)': '7(#5,b9)',
  '7(#5,b9)': '7(#5,b9)',
  '(#9,#11)': '7(#9,#11)',
  '7(#9,#11)': '7(#9,#11)',
  '(b9,#11)': '7(b9,#11)',
  '7(b9,#11)': '7(b9,#11)',
  '(9,#11,13)': '7(9,#11,13)',
  '7(9,#11,13)': '7(9,#11,13)',

  // Flat/sharp 5th variations
  '-5': '7b5',
  '7-5': '7b5',
  b5: '7b5',
  '7b5': '7b5',
  '(b5)': '9b5',
  '9(b5)': '9b5',

  // 11th variations
  '-5(11)': 'm7b5(11)',
  'm7-5(11)': 'm7b5(11)',
  '(9,11)': 'm7(9,11)',
  'm7(9,11)': 'm7(9,11)',

  // Augmented extensions
  'aug7(b9)': 'aug7(b9)',
  'aug9(#11)': 'aug9(#11)',
  'aug7(#9)': 'aug7#9',
  'aug7#9': 'aug7#9',
  augM7: 'maj7+5',
  bbaug: 'aug',
  bbaugM7: 'maj7+5',
  baug: 'aug',
  baugM7: 'maj7+5',

  // 6th variations
  sixth: '6',

  // 9th variations
  ninth: '9',
  '9sus4': '9sus4',
  C9sus4: '9sus4',

  // Sus4 variations
  '7sus4': '7sus4',

  // Omit variations
  no3: 'omit3',
  no5: 'omit5',
  omit3: 'omit3',
  omit5: 'omit5',

  // Add variations
  add2: 'add2',
  add4: 'add4',
  add6: 'add6',

  // 6/9 variations
  '6add9': '6/9',
  '69': '6/9',
  maj69: 'maj6/9',
  M69: 'maj6/9',

  // Altered variations
  alt: '7alt',
  '7altered': '7alt',
  altered: '7alt',
} as const;
