/**
 * Complete unified chord definition system
 * Centralizes all chord-related data and logic
 */

import type { ChordQuality } from './types.js';

export type ChordCategory = 'basic' | 'seventh' | 'extended' | 'altered' | 'suspended' | 'augmented' | 'diminished' | 'add' | 'omit' | 'tension';

export interface ChordDefinition {
  /** Interval pattern in semitones from root */
  intervals: readonly number[];
  /** Alternative names that should be normalized to this chord */
  aliases: readonly string[];
  /** Display name for the chord */
  displayName: string;
  /** Category for grouping and organization */
  category: ChordCategory;
  /** Optional description for documentation */
  description?: string;
}

// Type-safe chord registry with ALL chord definitions
export const CHORD_REGISTRY = {
  // Basic triads
  '': {
    intervals: [0, 4, 7],
    aliases: [],
    displayName: 'Major',
    category: 'basic',
    description: 'Major triad (default)'
  },
  'maj': {
    intervals: [0, 4, 7],
    aliases: [],
    displayName: 'Major',
    category: 'basic',
    description: 'Major triad (explicit)'
  },
  'm': {
    intervals: [0, 3, 7],
    aliases: ['min', 'minor', 'mi', '-'],
    displayName: 'Minor',
    category: 'basic',
    description: 'Minor triad'
  },
  'dim': {
    intervals: [0, 3, 6],
    aliases: ['diminished', 'o', '°'],
    displayName: 'Diminished',
    category: 'diminished',
    description: 'Diminished triad'
  },
  'aug': {
    intervals: [0, 4, 8],
    aliases: ['+5', 'augmented', '+', '#5'],
    displayName: 'Augmented',
    category: 'augmented',
    description: 'Augmented triad'
  },

  // Suspended chords
  'sus2': {
    intervals: [0, 2, 7],
    aliases: ['suspended2'],
    displayName: 'Suspended 2nd',
    category: 'suspended'
  },
  'sus4': {
    intervals: [0, 5, 7],
    aliases: ['sus', 'suspended4', 'suspended'],
    displayName: 'Suspended 4th',
    category: 'suspended'
  },
  '7sus4': {
    intervals: [0, 5, 7, 10],
    aliases: [],
    displayName: '7th suspended 4th',
    category: 'suspended'
  },
  '9sus4': {
    intervals: [0, 5, 7, 10, 14],
    aliases: ['C9sus4'],
    displayName: '9th suspended 4th',
    category: 'suspended'
  },

  // Seventh chords
  '7': {
    intervals: [0, 4, 7, 10],
    aliases: ['dom7', 'dominant7'],
    displayName: 'Dominant 7th',
    category: 'seventh'
  },
  'maj7': {
    intervals: [0, 4, 7, 11],
    aliases: ['M7', 'major7', 'Maj7', 'MA7', 'Ma7', '△7', 'j7', '△'],
    displayName: 'Major 7th',
    category: 'seventh'
  },
  'm7': {
    intervals: [0, 3, 7, 10],
    aliases: ['min7', 'minor7', 'mi7', '-7'],
    displayName: 'Minor 7th',
    category: 'seventh'
  },
  'dim7': {
    intervals: [0, 3, 6, 9],
    aliases: ['diminished7', 'o7', '°7'],
    displayName: 'Diminished 7th',
    category: 'diminished'
  },
  'm7b5': {
    intervals: [0, 3, 6, 10],
    aliases: ['half-dim', 'ø', 'm7♭5', 'm7-5', 'ø7'],
    displayName: 'Half-diminished 7th',
    category: 'diminished'
  },
  'mM7': {
    intervals: [0, 3, 7, 11],
    aliases: ['mMaj7', 'mMA7', 'minmaj7', 'mmaj7'],
    displayName: 'Minor-major 7th',
    category: 'seventh'
  },
  'aug7': {
    intervals: [0, 4, 8, 10],
    aliases: ['7+5', '7#5'],
    displayName: 'Augmented 7th',
    category: 'augmented',
    description: 'Dominant 7th with sharp 5'
  },
  'maj7+5': {
    intervals: [0, 4, 8, 11],
    aliases: ['augM7', 'augMaj7'],
    displayName: 'Major 7th sharp 5',
    category: 'augmented'
  },
  '7+5': {
    intervals: [0, 4, 8, 10],
    aliases: [],
    displayName: '7th sharp 5',
    category: 'augmented',
    description: 'Same as aug7 but kept for legacy'
  },

  // Sixth chords
  '6': {
    intervals: [0, 4, 7, 9],
    aliases: ['sixth'],
    displayName: 'Major 6th',
    category: 'add'
  },
  'm6': {
    intervals: [0, 3, 7, 9],
    aliases: [],
    displayName: 'Minor 6th',
    category: 'add'
  },
  '6/9': {
    intervals: [0, 4, 7, 9, 14],
    aliases: ['6add9', '69'],
    displayName: '6th with 9th',
    category: 'extended'
  },
  'maj6/9': {
    intervals: [0, 4, 7, 9, 14],
    aliases: ['maj69', 'M69'],
    displayName: 'Major 6th with 9th',
    category: 'extended'
  },

  // Extended chords (9th, 11th, 13th)
  '9': {
    intervals: [0, 4, 7, 10, 14],
    aliases: ['ninth'],
    displayName: 'Dominant 9th',
    category: 'extended'
  },
  'maj9': {
    intervals: [0, 4, 7, 11, 14],
    aliases: ['M9'],
    displayName: 'Major 9th',
    category: 'extended'
  },
  'm9': {
    intervals: [0, 3, 7, 10, 14],
    aliases: [],
    displayName: 'Minor 9th',
    category: 'extended'
  },
  'mM9': {
    intervals: [0, 3, 7, 11, 14],
    aliases: ['minmaj9', 'mmaj9', 'mMA9'],
    displayName: 'Minor-major 9th',
    category: 'extended'
  },
  'm11': {
    intervals: [0, 3, 7, 10, 14, 17],
    aliases: [],
    displayName: 'Minor 11th',
    category: 'extended'
  },
  'mM11': {
    intervals: [0, 3, 7, 11, 14, 17],
    aliases: ['minmaj11', 'mmaj11', 'mMA11'],
    displayName: 'Minor-major 11th',
    category: 'extended'
  },
  '13': {
    intervals: [0, 4, 7, 10, 14, 21],
    aliases: [],
    displayName: 'Dominant 13th',
    category: 'extended'
  },
  'm13': {
    intervals: [0, 3, 7, 10, 14, 21],
    aliases: [],
    displayName: 'Minor 13th',
    category: 'extended'
  },
  'mM13': {
    intervals: [0, 3, 7, 11, 14, 17, 21],
    aliases: ['minmaj13', 'mmaj13', 'mMA13'],
    displayName: 'Minor-major 13th',
    category: 'extended'
  },

  // Add chords
  'add9': {
    intervals: [0, 4, 7, 14],
    aliases: [],
    displayName: 'Add 9th',
    category: 'add'
  },
  'add2': {
    intervals: [0, 2, 4, 7],
    aliases: [],
    displayName: 'Add 2nd',
    category: 'add'
  },
  'add4': {
    intervals: [0, 4, 5, 7],
    aliases: [],
    displayName: 'Add 4th',
    category: 'add'
  },
  'add6': {
    intervals: [0, 4, 7, 9],
    aliases: [],
    displayName: 'Add 6th',
    category: 'add'
  },
  'add11': {
    intervals: [0, 4, 7, 17],
    aliases: [],
    displayName: 'Add 11th',
    category: 'add'
  },
  'add#11': {
    intervals: [0, 4, 7, 18],
    aliases: [],
    displayName: 'Add sharp 11th',
    category: 'add'
  },
  'add13': {
    intervals: [0, 4, 7, 21],
    aliases: [],
    displayName: 'Add 13th',
    category: 'add'
  },
  'add#13': {
    intervals: [0, 4, 7, 22],
    aliases: [],
    displayName: 'Add sharp 13th',
    category: 'add'
  },

  // Omit chords
  'omit3': {
    intervals: [0, 7],
    aliases: ['no3'],
    displayName: 'Omit 3rd',
    category: 'omit',
    description: 'Power chord'
  },
  '5': {
    intervals: [0, 7],
    aliases: [],
    displayName: 'Power chord',
    category: 'omit'
  },
  'omit5': {
    intervals: [0, 4],
    aliases: ['no5'],
    displayName: 'Omit 5th',
    category: 'omit'
  },
  'm(omit5)': {
    intervals: [0, 3],
    aliases: [],
    displayName: 'Minor omit 5th',
    category: 'omit'
  },
  '7omit5': {
    intervals: [0, 4, 10],
    aliases: [],
    displayName: '7th omit 5th',
    category: 'omit'
  },
  'maj7omit5': {
    intervals: [0, 4, 11],
    aliases: [],
    displayName: 'Major 7th omit 5th',
    category: 'omit'
  },
  'm7omit5': {
    intervals: [0, 3, 10],
    aliases: [],
    displayName: 'Minor 7th omit 5th',
    category: 'omit'
  },
  'maj7(omit3)': {
    intervals: [0, 7, 11],
    aliases: [],
    displayName: 'Major 7th omit 3rd',
    category: 'omit'
  },
  '7omit3': {
    intervals: [0, 7, 10],
    aliases: [],
    displayName: '7th omit 3rd',
    category: 'omit'
  },
  'sus2omit5': {
    intervals: [0, 2],
    aliases: [],
    displayName: 'Sus2 omit 5th',
    category: 'omit'
  },
  'sus4omit5': {
    intervals: [0, 5],
    aliases: [],
    displayName: 'Sus4 omit 5th',
    category: 'omit'
  },
  '7sus4omit5': {
    intervals: [0, 5, 10],
    aliases: [],
    displayName: '7th sus4 omit 5th',
    category: 'omit'
  },
  '9omit5': {
    intervals: [0, 4, 10, 14],
    aliases: [],
    displayName: '9th omit 5th',
    category: 'omit'
  },
  'm9omit5': {
    intervals: [0, 3, 10, 14],
    aliases: [],
    displayName: 'Minor 9th omit 5th',
    category: 'omit'
  },

  // Altered dominant chords
  '7b9': {
    intervals: [0, 4, 7, 10, 13],
    aliases: [],
    displayName: '7th flat 9',
    category: 'altered'
  },
  '7#9': {
    intervals: [0, 4, 7, 10, 15],
    aliases: [],
    displayName: '7th sharp 9',
    category: 'altered'
  },
  '7b5': {
    intervals: [0, 4, 6, 10],
    aliases: ['-5', '7-5'],
    displayName: '7th flat 5',
    category: 'altered'
  },
  '7alt': {
    intervals: [0, 4, 6, 10, 13, 15],
    aliases: ['alt', '7altered', 'altered'],
    displayName: 'Altered dominant',
    category: 'altered'
  },
  '9b5': {
    intervals: [0, 4, 6, 10, 14],
    aliases: ['b5', '(b5)', '9(b5)'],
    displayName: '9th flat 5',
    category: 'altered'
  },

  // Complex tensions
  '7(9)': {
    intervals: [0, 4, 7, 10, 14],
    aliases: [],
    displayName: '7th with 9th',
    category: 'tension'
  },
  '7(13)': {
    intervals: [0, 4, 7, 10, 21],
    aliases: ['(13)'],
    displayName: '7th with 13th',
    category: 'tension'
  },
  '7(9,13)': {
    intervals: [0, 4, 7, 10, 14, 21],
    aliases: [],
    displayName: '7th with 9th and 13th',
    category: 'tension'
  },
  '7(b9,b13)': {
    intervals: [0, 4, 7, 10, 13, 20],
    aliases: [],
    displayName: '7th with flat 9 and flat 13',
    category: 'tension'
  },
  '7(b5,#9)': {
    intervals: [0, 4, 6, 10, 15],
    aliases: ['(b5,#9)'],
    displayName: '7th flat 5 sharp 9',
    category: 'altered'
  },
  '7(#5,b9)': {
    intervals: [0, 4, 8, 10, 13],
    aliases: ['(#5,b9)'],
    displayName: '7th sharp 5 flat 9',
    category: 'altered'
  },
  '7(#9,#11)': {
    intervals: [0, 4, 7, 10, 15, 18],
    aliases: ['(#9,#11)'],
    displayName: '7th sharp 9 sharp 11',
    category: 'tension'
  },
  '7(b9,#11)': {
    intervals: [0, 4, 7, 10, 13, 18],
    aliases: ['(b9,#11)'],
    displayName: '7th flat 9 sharp 11',
    category: 'tension'
  },
  '7(9,#11,13)': {
    intervals: [0, 4, 7, 10, 14, 18, 21],
    aliases: [],
    displayName: '7th with 9, #11, 13',
    category: 'tension'
  },

  // Extended chord variations
  'm7(9)': {
    intervals: [0, 3, 7, 10, 14],
    aliases: [],
    displayName: 'Minor 7th with 9th',
    category: 'tension'
  },
  'm7(11)': {
    intervals: [0, 3, 7, 10, 17],
    aliases: [],
    displayName: 'Minor 7th with 11th',
    category: 'tension'
  },
  'm7(9,11)': {
    intervals: [0, 3, 7, 10, 14, 17],
    aliases: ['(9,11)'],
    displayName: 'Minor 7th with 9th and 11th',
    category: 'tension'
  },
  'm7b5(11)': {
    intervals: [0, 3, 6, 10, 17],
    aliases: ['-5(11)', 'm7-5(11)'],
    displayName: 'Half-diminished with 11th',
    category: 'diminished'
  },
  'maj7(9)': {
    intervals: [0, 4, 7, 11, 14],
    aliases: ['M7(9)'],
    displayName: 'Major 7th with 9th',
    category: 'tension'
  },
  'maj7(13)': {
    intervals: [0, 4, 7, 11, 21],
    aliases: [],
    displayName: 'Major 7th with 13th',
    category: 'tension'
  },
  'maj7(9,13)': {
    intervals: [0, 4, 7, 11, 14, 21],
    aliases: [],
    displayName: 'Major 7th with 9th and 13th',
    category: 'tension'
  },

  // Augmented extensions
  'aug7(b9)': {
    intervals: [0, 4, 8, 10, 13],
    aliases: [],
    displayName: 'Augmented 7th flat 9',
    category: 'augmented'
  },
  'aug9(#11)': {
    intervals: [0, 4, 8, 10, 14, 18],
    aliases: [],
    displayName: 'Augmented 9th sharp 11',
    category: 'augmented'
  },
  'aug7#9': {
    intervals: [0, 4, 8, 10, 15],
    aliases: ['aug7(#9)'],
    displayName: 'Augmented 7th sharp 9',
    category: 'augmented'
  },

  // Tension-only notations
  '(9)': {
    intervals: [0, 4, 7, 10, 14],
    aliases: [],
    displayName: 'Tension 9th only',
    category: 'tension',
    description: 'Same as 7(9)'
  },
  '(11)': {
    intervals: [0, 4, 7, 10, 17],
    aliases: [],
    displayName: 'Tension 11th only',
    category: 'tension'
  }
} as const satisfies Record<string, ChordDefinition>;

// Additional complex normalization rules that don't fit the simple alias pattern
export const COMPLEX_NORMALIZATION_RULES: Record<string, ChordQuality> = {
  // Parentheses variations
  '(b9)': '7b9',
  '7(b9)': '7b9',
  '(#9)': '7#9',
  '7(#9)': '7#9',
  '(13)': '7(13)',
  '7(13)': '7(13)',
  
  // Special aug normalizations for backwards compatibility
  'bbaug': 'aug',
  'bbaugM7': 'maj7+5',
  'baug': 'aug',
  'baugM7': 'maj7+5',
  
  // Legacy chord mappings to modern equivalents
  '7+5': 'aug7',
  '7#5': 'aug7',
  
  // Minor variations
  'min': 'm'
} as const;

// Derive types from the registry
export type ChordRegistryKey = keyof typeof CHORD_REGISTRY;
export type ChordAlias = typeof CHORD_REGISTRY[ChordRegistryKey]['aliases'][number];

// Build complete normalization map from registry + complex rules
export function buildNormalizationMap(): Record<string, ChordRegistryKey> {
  const map: Record<string, ChordRegistryKey> = {};
  
  // First, add registry-based normalizations
  for (const [key, definition] of Object.entries(CHORD_REGISTRY)) {
    // Each chord quality maps to itself
    map[key] = key as ChordRegistryKey;
    
    // Each alias maps to the chord quality
    for (const alias of definition.aliases) {
      map[alias] = key as ChordRegistryKey;
    }
  }
  
  // Then, add complex normalization rules
  for (const [from, to] of Object.entries(COMPLEX_NORMALIZATION_RULES)) {
    map[from] = to as ChordRegistryKey;
  }
  
  return map;
}

// Get chord definition by quality (including aliases)
export function getChordDefinition(quality: string): ChordDefinition | null {
  // Check normalization first
  const normalizationMap = buildNormalizationMap();
  const normalizedQuality = normalizationMap[quality] || quality;
  
  // Then lookup in registry
  if (normalizedQuality in CHORD_REGISTRY) {
    return CHORD_REGISTRY[normalizedQuality as ChordRegistryKey];
  }
  
  return null;
}

// Validate if a string is a valid chord quality
export function isValidChordQuality(quality: string): quality is ChordRegistryKey {
  const definition = getChordDefinition(quality);
  return definition !== null;
}

// Get all chord qualities by category
export function getChordsByCategory(category: ChordCategory): ChordRegistryKey[] {
  return Object.entries(CHORD_REGISTRY)
    .filter(([_, def]) => def.category === category)
    .map(([key]) => key as ChordRegistryKey);
}