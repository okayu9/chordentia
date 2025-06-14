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

import { CHORD_FORMULAS } from './constants/chord-formulas.js';
import { CHORD_QUALITY_NORMALIZATION } from './constants/chord-normalization.js';

// Helper functions
function isValidNote(note: string): note is Note {
  return note in NOTE_TO_MIDI;
}

function normalizeChordQuality(quality: string): ChordQuality {
  return CHORD_QUALITY_NORMALIZATION[quality] || (quality as ChordQuality);
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
    chord: chordString.substring(0, slashIndex).trim(),
    bassNote: chordString.substring(slashIndex + 1).trim(),
  };
}

function formatNote(note: string): Note {
  return (note.charAt(0).toUpperCase() + note.slice(1).toLowerCase()) as Note;
}

// Core functions
function parseChord(chordString: string): ParsedChord {
  chordString = chordString.trim();
  
  const { chord, bassNote: bassNoteString } = parseSlashChord(chordString);
  const { root: rootString, remaining: qualityString } = extractRootNote(chord);
  
  const root = formatNote(rootString);
  const quality = qualityString === '' ? DEFAULT_CHORD_QUALITY : normalizeChordQuality(qualityString);
  const bassNote = bassNoteString ? formatNote(bassNoteString) : undefined;
  
  const result: ParsedChord = { root, quality };
  if (bassNote) {
    result.bassNote = bassNote;
  }
  return result;
}

function getNoteIndex(note: string): number {
  // First check if it's already in the sharp notes array
  const index = SHARP_NOTES.indexOf(note as Note);
  if (index !== -1) return index;
  
  // Check forward enharmonic equivalents (sharp -> flat)
  for (const [sharp, flat] of Object.entries(ENHARMONIC_EQUIVALENTS)) {
    if (flat === note) return SHARP_NOTES.indexOf(sharp as Note);
  }
  
  // Check reverse enharmonic equivalents (flat -> sharp)
  for (const [flat, sharp] of Object.entries(REVERSE_ENHARMONIC)) {
    if (flat === note) return SHARP_NOTES.indexOf(sharp as Note);
  }
  
  return -1;
}

function getChordNotes(root: Note, intervals: readonly number[]): Note[] {
  const rootIndex = getNoteIndex(root);
  if (rootIndex === -1) return [];
  
  return intervals.map(interval => {
    const noteIndex = (rootIndex + interval) % SEMITONES_IN_OCTAVE;
    return SHARP_NOTES[noteIndex]!;
  });
}

function getChordFromString(chordString: string): Chord {
  const { root, quality, bassNote } = parseChord(chordString);
  
  if (!isValidNote(root)) {
    throw new Error('Invalid root note');
  }
  
  if (!CHORD_FORMULAS[quality]) {
    throw new Error('Invalid chord quality: ' + quality);
  }
  
  const intervals = CHORD_FORMULAS[quality];
  const notes = getChordNotes(root, intervals);
  
  // Handle bass note
  if (bassNote) {
    if (!isValidNote(bassNote)) {
      throw new Error('Invalid bass note');
    }
    
    // Move bass note to the beginning
    const bassIndex = notes.indexOf(bassNote);
    if (bassIndex > -1) {
      notes.splice(bassIndex, 1);
    }
    notes.unshift(bassNote);
  }
  
  return {
    root,
    quality: quality || DEFAULT_CHORD_QUALITY,
    notes,
    intervals: [...intervals],
    ...(bassNote && { bassNote }),
  };
}

function calculateChordScore(
  chordNotes: Note[],
  selectedNotes: Note[],
  quality: ChordQuality
): { matchScore: number; exactMatch: boolean; simplicityScore: number } {
  const selectedSet = new Set(selectedNotes);
  const chordSet = new Set(chordNotes);
  
  // Check if all chord notes are in selected notes
  const matchingNotes = chordNotes.filter(note => selectedSet.has(note)).length;
  // Exact match: all chord notes must be in selected notes, with limited extra notes allowed
  const extraNotes = selectedNotes.length - chordNotes.length;
  const exactMatch = matchingNotes === chordNotes.length && extraNotes <= 1;
  
  // Calculate coverage score (how much of the chord is covered)
  const coverageScore = matchingNotes / chordNotes.length;
  
  // Calculate precision score (how much of selected notes are used)
  const usedSelectedNotes = selectedNotes.filter(note => chordSet.has(note)).length;
  const precisionScore = selectedNotes.length > 0 ? usedSelectedNotes / selectedNotes.length : 0;
  
  // Penalize chords that have many extra notes not in selection
  const unusedChordNotes = chordNotes.length - matchingNotes;
  const unusedPenalty = unusedChordNotes * 0.2;
  
  // Penalize chords when many selected notes are unused
  const unusedSelectedNotes = selectedNotes.length - usedSelectedNotes;
  const wasteScore = unusedSelectedNotes * 0.15;
  
  // Combined match score: prioritize coverage, then precision, then penalize waste
  const matchScore = coverageScore * 0.7 + precisionScore * 0.3 - unusedPenalty - wasteScore;
  
  // Simplicity score: prefer simpler chords, but also consider how well they fit
  const baseSimplicityScore = chordNotes.length === 3 ? 1 : 1 - (chordNotes.length - 3) * DEFAULT_SIMPLICITY_PENALTY;
  const simplicityScore = baseSimplicityScore * (1 + coverageScore * 0.3);
  
  return { 
    matchScore: Math.max(0, matchScore), // Ensure non-negative
    exactMatch, 
    simplicityScore: Math.max(0, simplicityScore) 
  };
}

function createChordSuggestion(
  root: Note,
  quality: ChordQuality,
  chordNotes: Note[],
  scores: { matchScore: number; exactMatch: boolean; simplicityScore: number },
  bassNote?: Note
): ChordSuggestion {
  const displayQuality = quality === EMPTY_CHORD_QUALITY ? '' : quality;
  const name = root + displayQuality + (bassNote && bassNote !== root ? '/' + bassNote : '');
  
  return {
    name,
    root,
    quality,
    notes: [...chordNotes],
    ...(bassNote && { bassNote }),
    ...scores,
  };
}

function findPossibleChords(selectedNotes: Note[], bassNote?: Note): ChordSuggestionResult {
  if (selectedNotes.length === 0) {
    return { exact: [], partial: [] };
  }
  
  const suggestions: ChordSuggestion[] = [];
  const noteSet = new Set(selectedNotes.map(n => n.toUpperCase()));
  
  // Try each selected note as a potential root
  for (const rootNote of selectedNotes) {
    // Try each chord quality
    for (const [quality, intervals] of Object.entries(CHORD_FORMULAS)) {
      // Skip duplicate chord notations
      if (SKIP_CHORD_QUALITIES.includes(quality as ChordQuality)) {
        continue;
      }
      
      const chordNotes = getChordNotes(rootNote, intervals);
      const chordNoteSet = new Set(chordNotes);
      
      // Check for any overlap between chord notes and selected notes
      const matchingNotesCount = chordNotes.filter(note => noteSet.has(note)).length;
      const minMatchThreshold = Math.max(2, Math.ceil(chordNotes.length * 0.5)); // At least 50% or 2 notes
      
      if (matchingNotesCount >= minMatchThreshold) {
        const scores = calculateChordScore(chordNotes, selectedNotes, quality as ChordQuality);
        
        // Handle bass note requirements and auto-detect slash chords
        let finalNotes = [...chordNotes];
        let isExactMatch = scores.exactMatch;
        let finalBassNote: Note | undefined = bassNote;
        
        if (bassNote) {
          // Explicit bass note specified
          if (bassNote !== rootNote) {
            // For slash chords, special exact match logic
            if (selectedNotes.includes(bassNote)) {
              // Check if selected notes = chord notes + bass note
              const chordNotesSet = new Set(chordNotes);
              const selectedNotesSet = new Set(selectedNotes);
              const bassIsExtra = !chordNotesSet.has(bassNote);
              
              if (bassIsExtra) {
                // Bass note is extra, check if other notes match exactly
                const nonBassSelected = selectedNotes.filter(note => note !== bassNote);
                const nonBassExactMatch = nonBassSelected.length === chordNotes.length && 
                  chordNotes.every(note => selectedNotesSet.has(note));
                isExactMatch = nonBassExactMatch;
              } else {
                // Bass note is part of chord, but still check for extra notes
                const usedNotes = new Set([...chordNotes, bassNote]);
                const extraNotes = selectedNotes.filter(note => !usedNotes.has(note));
                isExactMatch = extraNotes.length === 0 && selectedNotes.length === chordNotes.length;
              }
              
              if (isExactMatch) {
                const bassIndex = finalNotes.indexOf(bassNote);
                if (bassIndex > -1) {
                  finalNotes.splice(bassIndex, 1);
                }
                finalNotes.unshift(bassNote);
              }
            } else {
              // Mark as not exact match if bass note requirements not met
              isExactMatch = false;
            }
          } else {
            // Root position chord - still need to check for extra notes
            const extraNotes = selectedNotes.filter(note => !new Set(chordNotes).has(note));
            if (extraNotes.length > 0) {
              // Even for root position, don't show basic chords when extra notes exist
              isExactMatch = false;
            }
            // Otherwise keep original exact match status
          }
        } else {
          // No explicit bass note specified - check for auto-detect slash chords
          const chordNotesSet = new Set(chordNotes);
          const extraNotes = selectedNotes.filter(note => !chordNotesSet.has(note));
          
          if (extraNotes.length === 1 && matchingNotesCount === chordNotes.length) {
            // Exactly one extra note and all chord notes match - potential slash chord
            const potentialBass = extraNotes[0]!; // Safe assertion since length === 1
            finalBassNote = potentialBass;
            isExactMatch = true;
            finalNotes = [potentialBass, ...chordNotes];
          } else {
            // Not a clean slash chord - use original exact match logic
            // But don't allow basic triads when there are extra notes
            if (extraNotes.length > 0 && matchingNotesCount === chordNotes.length) {
              isExactMatch = false; // Don't show basic triads when extra notes exist
            }
          }
        }
        
        // Update the scores with the corrected exact match status
        const finalScores = { ...scores, exactMatch: isExactMatch };
        
        const suggestion = createChordSuggestion(
          rootNote,
          quality as ChordQuality,
          finalNotes,
          finalScores,
          finalBassNote
        );
        suggestions.push(suggestion);
      }
    }
  }
  
  // Sort suggestions
  suggestions.sort((a, b) => {
    // Exact matches first
    if (a.exactMatch !== b.exactMatch) return b.exactMatch ? 1 : -1;
    
    // Then by match score
    if (Math.abs(a.matchScore - b.matchScore) > 0.01) {
      return b.matchScore - a.matchScore;
    }
    
    // Then by simplicity
    if (Math.abs(a.simplicityScore - b.simplicityScore) > 0.01) {
      return b.simplicityScore - a.simplicityScore;
    }
    
    // Finally by name length
    return a.name.length - b.name.length;
  });
  
  // Apply exact match boost to scores
  const boostedSuggestions = suggestions.map(s => ({
    ...s,
    matchScore: s.exactMatch ? s.matchScore + EXACT_MATCH_BOOST : s.matchScore,
  }));
  
  // Separate exact and partial matches
  const exact = boostedSuggestions.filter(s => s.exactMatch);
  let partial = boostedSuggestions.filter(s => !s.exactMatch);
  
  // Filter partial matches to only show high-quality results
  if (partial.length > 0) {
    // Only show partial matches with match score above threshold
    const minPartialScore = 0.4; // Minimum 40% match quality
    partial = partial.filter(s => s.matchScore >= minPartialScore);
    
    // Limit partial matches to best results
    const maxPartialResults = 8;
    partial = partial.slice(0, maxPartialResults);
  }
  
  return { exact, partial };
}

function getMidiNote(note: Note, octave = 4): number | null {
  const midiValue = NOTE_TO_MIDI[note];
  if (midiValue === undefined) return null;
  
  // C4 = 60, so adjust based on octave
  return midiValue + (octave - 4) * SEMITONES_IN_OCTAVE;
}

function getFrequency(midiNote: number): number {
  return A4_FREQUENCY * Math.pow(2, (midiNote - A4_MIDI_NOTE) / SEMITONES_IN_OCTAVE);
}

function convertToNotation(notesArray: Note[], useFlats = false): Note[] {
  if (!useFlats) return notesArray;
  
  return notesArray.map(note => {
    const flat = ENHARMONIC_EQUIVALENTS[note];
    return flat ? (flat as Note) : note;
  });
}

function normalizeNote(note: Note): Note {
  const sharp = REVERSE_ENHARMONIC[note];
  return sharp ? (sharp as Note) : note;
}

// Export the MusicTheory object
export const MusicTheory: MusicTheoryInterface = {
  notes: SHARP_NOTES,
  flatNotes: FLAT_NOTES,
  enharmonicEquivalents: ENHARMONIC_EQUIVALENTS,
  reverseEnharmonic: REVERSE_ENHARMONIC,
  parseChord,
  getChordFromString,
  findPossibleChords,
  getMidiNote,
  getFrequency,
  convertToNotation,
  normalizeNote,
};