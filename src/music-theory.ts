/**
 * Music Theory v2 - Using the new chord registry system
 * This is a refactored version that uses the unified chord registry
 */

import type {
  Note,
  ChordQuality,
  Chord,
  ParsedChord,
  ChordSuggestion,
  ChordSuggestionResult,
  MusicTheoryInterface,
} from './types.js';

import {
  SHARP_NOTES,
  FLAT_NOTES,
  ENHARMONIC_EQUIVALENTS,
  REVERSE_ENHARMONIC,
  NOTE_TO_MIDI,
  SKIP_CHORD_QUALITIES,
  DEFAULT_CHORD_QUALITY,
  EMPTY_CHORD_QUALITY,
  SEMITONES_IN_OCTAVE,
  A4_FREQUENCY,
  A4_MIDI_NOTE,
  DEFAULT_SIMPLICITY_PENALTY,
  EXACT_MATCH_BOOST,
} from './constants/music-constants.js';

import { 
  CHORD_REGISTRY, 
  buildNormalizationMap, 
  getChordDefinition,
  isValidChordQuality,
  type ChordRegistryKey 
} from './chord-registry-complete.js';

// Build normalization map once
const NORMALIZATION_MAP = buildNormalizationMap();

// Helper functions
function isValidNote(note: string): note is Note {
  return note in NOTE_TO_MIDI;
}

function normalizeChordQuality(quality: string): ChordQuality {
  return (NORMALIZATION_MAP[quality] || quality) as ChordQuality;
}

function extractRootNote(chordString: string): { root: string; remaining: string } {
  // Handle double sharps first (C##, D##, etc.)
  if (chordString.length >= 3 && chordString.substring(1, 3) === '##') {
    return {
      root: chordString.substring(0, 3),
      remaining: chordString.substring(3),
    };
  }
  
  // Handle double flats (Cbb, Dbb, etc.)
  if (chordString.length >= 3 && chordString.substring(1, 3) === 'bb') {
    return {
      root: chordString.substring(0, 3),
      remaining: chordString.substring(3),
    };
  }
  
  // Handle single sharps and flats
  if (chordString.length >= 2 && (chordString[1] === '#' || chordString[1] === 'b')) {
    return {
      root: chordString.substring(0, 2),
      remaining: chordString.substring(2),
    };
  }
  
  // Handle natural notes
  return {
    root: chordString[0] || '',
    remaining: chordString.substring(1),
  };
}

function parseSlashChord(chordString: string): { chord: string; bassNote?: string } {
  // Special case for 6/9 chords (not slash chords)
  if (chordString.includes('6/9') || chordString.includes('maj6/9')) {
    return { chord: chordString };
  }
  
  const slashIndex = chordString.indexOf('/');
  if (slashIndex === -1) {
    return { chord: chordString };
  }
  
  return {
    chord: chordString.substring(0, slashIndex),
    bassNote: chordString.substring(slashIndex + 1),
  };
}

function normalizeNote(note: Note): Note {
  return (REVERSE_ENHARMONIC[note] || note) as Note;
}

function getIntervalFromRoot(root: Note, target: Note): number {
  const rootMidi = NOTE_TO_MIDI[root];
  const targetMidi = NOTE_TO_MIDI[target];
  
  if (rootMidi === undefined || targetMidi === undefined) {
    throw new Error(`Invalid note: ${root} or ${target}`);
  }
  
  // Use pitch class (MIDI % 12) for interval calculation
  const rootPitchClass = rootMidi % SEMITONES_IN_OCTAVE;
  const targetPitchClass = targetMidi % SEMITONES_IN_OCTAVE;
  
  let interval = targetPitchClass - rootPitchClass;
  
  // Normalize to 0-11 range
  while (interval < 0) interval += SEMITONES_IN_OCTAVE;
  while (interval >= SEMITONES_IN_OCTAVE) interval -= SEMITONES_IN_OCTAVE;
  
  return interval;
}

function getNoteFromInterval(root: Note, interval: number): Note {
  const rootMidi = NOTE_TO_MIDI[root];
  if (rootMidi === undefined) {
    throw new Error(`Invalid root note: ${root}`);
  }
  
  const targetMidi = rootMidi + interval;
  const normalizedMidi = ((targetMidi % SEMITONES_IN_OCTAVE) + SEMITONES_IN_OCTAVE) % SEMITONES_IN_OCTAVE;
  
  // Find the note with this pitch class (MIDI % 12), preferring sharps
  // First try sharp notes
  for (const note of SHARP_NOTES) {
    const noteMidi = NOTE_TO_MIDI[note];
    if (noteMidi !== undefined && (noteMidi % SEMITONES_IN_OCTAVE) === normalizedMidi) {
      return note;
    }
  }
  
  // If not found in sharp notes, try all notes
  for (const [note, midi] of Object.entries(NOTE_TO_MIDI)) {
    if ((midi % SEMITONES_IN_OCTAVE) === normalizedMidi) {
      return note as Note;
    }
  }
  
  throw new Error(`Could not find note for MIDI value: ${normalizedMidi}`);
}

function areSameNotes(notes1: Note[], notes2: Note[]): boolean {
  if (notes1.length !== notes2.length) return false;
  
  const normalized1 = notes1.map(normalizeNote).sort();
  const normalized2 = notes2.map(normalizeNote).sort();
  
  return normalized1.every((note, index) => note === normalized2[index]);
}

function getSimplicityScore(quality: ChordQuality): number {
  // Define simplicity scores (lower is simpler)
  const simplicityMap: Partial<Record<ChordQuality, number>> = {
    '': 0,      // Major
    'maj': 0,   // Major
    'm': 1,     // Minor
    '7': 2,     // Dominant 7th
    'maj7': 3,  // Major 7th
    'm7': 3,    // Minor 7th
    'sus4': 4,  // Suspended 4th
    'sus2': 4,  // Suspended 2nd
    'dim': 5,   // Diminished
    'aug': 5,   // Augmented
    '6': 5,     // 6th
    'm6': 6,    // Minor 6th
    '9': 7,     // 9th
    'add9': 7,  // Add 9th
    'm9': 8,    // Minor 9th
    'maj9': 8,  // Major 9th
  };
  
  return simplicityMap[quality] ?? DEFAULT_SIMPLICITY_PENALTY;
}

// Unified internal functions
function parseChordInternal(chordString: string): ParsedChord {
  // Handle empty or invalid input
  if (!chordString || typeof chordString !== 'string') {
    throw new Error('Chord string is required');
  }
  
  // Convert to uppercase for consistency
  chordString = chordString.trim();
  
  // Make the first letter uppercase (root note)
  if (chordString.length > 0) {
    chordString = chordString.charAt(0).toUpperCase() + chordString.slice(1);
  }
  
  // Parse slash chord
  const { chord, bassNote } = parseSlashChord(chordString);
  
  // Extract root note
  const { root, remaining } = extractRootNote(chord);
  
  // Validate root note
  if (!isValidNote(root)) {
    throw new Error(`Invalid root note: ${root}`);
  }
  
  // Normalize and validate chord quality
  const quality = remaining || DEFAULT_CHORD_QUALITY;
  const normalizedQuality = normalizeChordQuality(quality);
  
  // Validate bass note if present
  if (bassNote && !isValidNote(bassNote)) {
    throw new Error(`Invalid bass note: ${bassNote}`);
  }
  
  const result: ParsedChord = {
    root: root as Note,
    quality: normalizedQuality,
  };
  
  if (bassNote) {
    result.bassNote = bassNote as Note;
  }
  
  return result;
}

function getChordFromParsedInternal(parsed: ParsedChord): Chord {
  const { root, quality, bassNote } = parsed;
  
  // Get chord definition using new registry
  const definition = getChordDefinition(quality);
  if (!definition) {
    throw new Error(`Invalid chord quality: ${quality}`);
  }
  
  const intervals = definition.intervals;
  
  // Generate notes from intervals
  const notes = intervals.map(interval => getNoteFromInterval(root, interval));
  
  // Handle bass note for slash chords
  let finalNotes = [...notes];
  if (bassNote && !notes.some(note => normalizeNote(note) === normalizeNote(bassNote))) {
    // Add bass note at the beginning if it's not already in the chord
    finalNotes = [bassNote, ...notes];
  } else if (bassNote) {
    // Rearrange to put bass note first
    finalNotes = [bassNote, ...notes.filter(note => normalizeNote(note) !== normalizeNote(bassNote))];
  }
  
  const result: Chord = {
    root,
    quality,
    notes: finalNotes,
    intervals: [...intervals],
  };
  
  if (bassNote) {
    result.bassNote = bassNote;
  }
  
  return result;
}

// Public API implementation
export const MusicTheory = {
  parseChord(chordString: string): ParsedChord {
    return parseChordInternal(chordString);
  },
  
  getChordFromString(chordString: string): Chord {
    const parsed = parseChordInternal(chordString);
    return getChordFromParsedInternal(parsed);
  },
  
  findPossibleChords(selectedNotes: Note[], bassNote?: Note): ChordSuggestionResult {
    if (selectedNotes.length === 0) {
      return { exact: [], partial: [] };
    }
    
    const exact: ChordSuggestion[] = [];
    const partial: ChordSuggestion[] = [];
    
    // Deduplicate and normalize selected notes
    const uniqueSelectedNotes = Array.from(new Set(selectedNotes));
    const normalizedSelected = uniqueSelectedNotes.map(normalizeNote);
    const normalizedBass = bassNote ? normalizeNote(bassNote) : null;
    
    // If bass note is specified, we need to consider slash chords
    // This means looking for chords that might not include the bass note in their base intervals
    const notesToAnalyze = bassNote ? 
      uniqueSelectedNotes.filter(note => normalizeNote(note) !== normalizedBass) : 
      uniqueSelectedNotes;
    
    // Try each note as a potential root
    const rootCandidates = bassNote ? 
      // When bass is specified, try both the bass note and other selected notes as roots
      [bassNote, ...notesToAnalyze] :
      uniqueSelectedNotes;
    
    for (const potentialRoot of rootCandidates) {
      // Try each chord quality from the registry
      for (const [quality, definition] of Object.entries(CHORD_REGISTRY)) {
        if (SKIP_CHORD_QUALITIES.includes(quality as ChordQuality)) {
          continue;
        }
        
        // Generate chord notes
        const chordNotes = definition.intervals.map(interval => 
          getNoteFromInterval(potentialRoot, interval)
        );
        const normalizedChordNotes = chordNotes.map(normalizeNote);
        
        // For slash chords, we need to consider two cases:
        // 1. Bass note is part of the chord (inversion) - should show as regular chord AND slash chord
        // 2. Bass note is not part of the chord (true slash chord) - analyze remaining notes
        if (bassNote) {
          const bassIsInChord = normalizedBass !== null && normalizedChordNotes.includes(normalizedBass);
          
          if (bassIsInChord) {
            // Case 1: Bass note is part of the chord (inversion)
            // Check if all selected notes match the chord exactly
            const isExactMatch = areSameNotes(uniqueSelectedNotes, chordNotes);
            const isPartialMatch = normalizedSelected.every(note => 
              normalizedChordNotes.includes(normalizeNote(note as Note))
            );
            
            if (isExactMatch || isPartialMatch) {
              // Add regular chord name if bass note is the root
              if (normalizedBass !== null && normalizeNote(potentialRoot) === normalizedBass) {
                const regularName = quality === EMPTY_CHORD_QUALITY ? potentialRoot : `${potentialRoot}${quality}`;
                const matchingCount = uniqueSelectedNotes.filter(note => 
                  normalizedChordNotes.includes(normalizeNote(note))
                ).length;
                
                const regularSuggestion: ChordSuggestion = {
                  name: regularName,
                  root: potentialRoot,
                  quality: quality as ChordQuality,
                  notes: chordNotes,
                  matchScore: matchingCount / chordNotes.length,
                  exactMatch: isExactMatch,
                  simplicityScore: getSimplicityScore(quality as ChordQuality),
                };
                
                if (isExactMatch) {
                  exact.push(regularSuggestion);
                } else if (isPartialMatch) {
                  partial.push(regularSuggestion);
                }
              }
              
              // Also add slash chord version if bass is different from root
              if (normalizedBass !== null && normalizeNote(potentialRoot) !== normalizedBass) {
                const slashName = quality === EMPTY_CHORD_QUALITY ? 
                  `${potentialRoot}/${bassNote}` : 
                  `${potentialRoot}${quality}/${bassNote}`;
                
                const matchingCount = uniqueSelectedNotes.filter(note => 
                  normalizedChordNotes.includes(normalizeNote(note))
                ).length;
                
                const slashSuggestion: ChordSuggestion = {
                  name: slashName,
                  root: potentialRoot,
                  quality: quality as ChordQuality,
                  notes: [bassNote, ...chordNotes.filter(note => normalizeNote(note) !== normalizedBass)],
                  matchScore: matchingCount / chordNotes.length,
                  exactMatch: isExactMatch,
                  simplicityScore: getSimplicityScore(quality as ChordQuality) + 1, // Slightly less simple than regular chord
                };
                
                if (isExactMatch) {
                  exact.push(slashSuggestion);
                } else if (isPartialMatch) {
                  partial.push(slashSuggestion);
                }
              }
            }
          } else {
            // Case 2: Bass note is not part of the chord (true slash chord)
            const selectedNotesWithoutBass = uniqueSelectedNotes.filter(note => 
              normalizedBass === null || normalizeNote(note) !== normalizedBass
            );
            
            const chordContainsSelectedNotes = selectedNotesWithoutBass.every(note =>
              normalizedChordNotes.includes(normalizeNote(note))
            );
            
            if (chordContainsSelectedNotes && selectedNotesWithoutBass.length > 0) {
              const isExactMatch = areSameNotes(selectedNotesWithoutBass, chordNotes);
              const name = quality === EMPTY_CHORD_QUALITY ? 
                `${potentialRoot}/${bassNote}` : 
                `${potentialRoot}${quality}/${bassNote}`;
              
              const matchingCount = selectedNotesWithoutBass.filter(note => 
                normalizedChordNotes.includes(normalizeNote(note))
              ).length;
              
              const suggestion: ChordSuggestion = {
                name,
                root: potentialRoot,
                quality: quality as ChordQuality,
                notes: [bassNote, ...chordNotes],
                matchScore: matchingCount / chordNotes.length,
                exactMatch: isExactMatch,
                simplicityScore: getSimplicityScore(quality as ChordQuality) + 2, // Less simple than inversions
              };
              
              if (isExactMatch) {
                exact.push(suggestion);
              } else {
                partial.push(suggestion);
              }
            }
          }
        } else {
          // Original logic for when no bass note is specified
          const isExactMatch = areSameNotes(uniqueSelectedNotes, chordNotes);
          const isPartialMatch = normalizedSelected.every(note => 
            normalizedChordNotes.includes(normalizeNote(note as Note))
          );
          
          if (isExactMatch || isPartialMatch) {
            const name = quality === EMPTY_CHORD_QUALITY ? potentialRoot : `${potentialRoot}${quality}`;
            
            const matchingCount = uniqueSelectedNotes.filter(note => 
              normalizedChordNotes.includes(normalizeNote(note))
            ).length;
            
            const suggestion: ChordSuggestion = {
              name,
              root: potentialRoot,
              quality: quality as ChordQuality,
              notes: chordNotes,
              matchScore: matchingCount / chordNotes.length,
              exactMatch: isExactMatch,
              simplicityScore: getSimplicityScore(quality as ChordQuality),
            };
            
            if (isExactMatch) {
              exact.push(suggestion);
            } else if (isPartialMatch) {
              partial.push(suggestion);
            }
          }
        }
      }
    }
    
    // Sort suggestions
    const sortSuggestions = (a: ChordSuggestion, b: ChordSuggestion) => {
      // First by exact match
      if (a.exactMatch !== b.exactMatch) {
        return a.exactMatch ? -1 : 1;
      }
      // Then by match score
      if (a.matchScore !== b.matchScore) {
        return b.matchScore - a.matchScore;
      }
      // Then by simplicity
      return a.simplicityScore - b.simplicityScore;
    };
    
    exact.sort(sortSuggestions);
    partial.sort(sortSuggestions);
    
    return { exact, partial };
  },
  
  getMidiNote(note: Note, octave: number = 4): number | null {
    const midiValue = NOTE_TO_MIDI[note];
    if (midiValue === undefined) return null;
    
    // C4 = 60, so adjust based on octave
    return midiValue + (octave - 4) * SEMITONES_IN_OCTAVE;
  },
  
  getFrequency(midiNote: number): number {
    // A4 = 440Hz, MIDI note 69
    // Each semitone up multiplies frequency by 2^(1/12)
    return A4_FREQUENCY * Math.pow(2, (midiNote - A4_MIDI_NOTE) / SEMITONES_IN_OCTAVE);
  },
  
  convertToNotation(notes: Note[], useFlats: boolean): Note[] {
    if (!useFlats) return notes;
    
    return notes.map(note => {
      // Convert sharps to flats using ENHARMONIC_EQUIVALENTS
      const flatEquivalent = ENHARMONIC_EQUIVALENTS[note];
      return flatEquivalent ? (flatEquivalent as Note) : note;
    });
  },
  
  normalizeNote,
  
  // Additional properties from MusicTheoryInterface
  notes: SHARP_NOTES,
  flatNotes: FLAT_NOTES,
  enharmonicEquivalents: ENHARMONIC_EQUIVALENTS,
  reverseEnharmonic: REVERSE_ENHARMONIC,
};