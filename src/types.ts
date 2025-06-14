/**
 * Core musical types and interfaces for the Chordentia application
 */

// ============================================================================
// Basic Musical Types
// ============================================================================

/**
 * All supported musical notes including sharps, flats, and enharmonic equivalents
 */
export type Note =
  | 'C'
  | 'C#'
  | 'C##'
  | 'Db'
  | 'Dbb'
  | 'D'
  | 'D#'
  | 'D##'
  | 'Eb'
  | 'Ebb'
  | 'E'
  | 'E##'
  | 'Fb'
  | 'Fbb'
  | 'F'
  | 'F#'
  | 'F##'
  | 'Gb'
  | 'Gbb'
  | 'G'
  | 'G#'
  | 'G##'
  | 'Ab'
  | 'Abb'
  | 'A'
  | 'A#'
  | 'A##'
  | 'Bb'
  | 'Bbb'
  | 'B'
  | 'B##'
  | 'Cb'
  | 'Cbb';

/**
 * Available audio waveform types for synthesis
 */
export type WaveType = 'square' | 'sawtooth' | 'triangle' | 'organ';

/**
 * All supported chord qualities and variations
 */
export type ChordQuality =
  // Basic triads
  | '' // Major (default)
  | 'maj' // Major (explicit)
  | 'm' // Minor
  | 'min' // Minor (alternate)
  | 'dim' // Diminished
  | 'aug' // Augmented
  
  // Suspended chords
  | 'sus2' // Suspended 2nd
  | 'sus4' // Suspended 4th
  | 'sus' // Suspended (defaults to sus4)
  
  // Seventh chords
  | '7' // Dominant 7th
  | 'maj7' // Major 7th
  | 'm7' // Minor 7th
  | 'min7' // Minor 7th (alternate)
  | 'dim7' // Diminished 7th
  | 'm7b5' // Half-diminished 7th
  | 'mM7' // Minor-major 7th
  
  // Sixth chords
  | '6' // Major 6th
  | 'm6' // Minor 6th
  | '6/9' // 6th with 9th
  | 'maj6/9' // Major 6th with 9th
  
  // Extended chords (9th, 11th, 13th)
  | '9' // Dominant 9th
  | 'maj9' // Major 9th
  | 'm9' // Minor 9th
  | 'mM9' // Minor-major 9th
  | 'm11' // Minor 11th
  | 'mM11' // Minor-major 11th
  | '13' // Dominant 13th
  | 'm13' // Minor 13th
  | 'mM13' // Minor-major 13th
  
  // Add chords
  | 'add9' // Add 9th
  | 'add11' // Add 11th
  | 'add#11' // Add sharp 11th
  | 'add13' // Add 13th
  | 'add#13' // Add sharp 13th
  | 'add2' // Add 2nd
  | 'add4' // Add 4th
  | 'add6' // Add 6th
  
  // Augmented variations
  | '+5' // Augmented (alternate notation)
  | 'maj7+5' // Major 7th sharp 5
  | '7+5' // 7th sharp 5
  
  // Omit chords
  | 'omit5' // Omit 5th (major)
  | 'm(omit5)' // Omit 5th (minor)
  | '7omit5' // 7th omit 5th
  | 'maj7omit5' // Major 7th omit 5th
  | 'm7omit5' // Minor 7th omit 5th
  | 'omit3' // Omit 3rd (power chord)
  | '5' // Power chord
  | 'maj7(omit3)' // Major 7th omit 3rd
  | '7omit3' // 7th omit 3rd
  | 'sus2omit5' // Sus2 omit 5th
  | 'sus4omit5' // Sus4 omit 5th
  | '7sus4omit5' // 7th sus4 omit 5th
  | '9omit5' // 9th omit 5th
  | 'm9omit5' // Minor 9th omit 5th
  
  // Altered dominant chords
  | '7b9' // 7th flat 9
  | '7#9' // 7th sharp 9
  | '7b5' // 7th flat 5
  | '7alt' // Altered dominant
  | '9b5' // 9th flat 5
  
  // Suspended variations
  | '7sus4' // 7th suspended 4th
  | '9sus4' // 9th suspended 4th
  
  // Complex tensions
  | '7(9)' // 7th with 9th
  | '7(13)' // 7th with 13th
  | '7(9,13)' // 7th with 9th and 13th
  | '7(b9,b13)' // 7th with flat 9 and flat 13
  | '7(b5,#9)' // 7th flat 5 sharp 9
  | '7(#5,b9)' // 7th sharp 5 flat 9
  | '7(#9,#11)' // 7th sharp 9 sharp 11
  | '7(b9,#11)' // 7th flat 9 sharp 11
  | '7(9,#11,13)' // 7th with 9, #11, 13
  
  // Extended chord variations
  | 'm7(9)' // Minor 7th with 9th
  | 'm7(11)' // Minor 7th with 11th
  | 'm7(9,11)' // Minor 7th with 9th and 11th
  | 'm7b5(11)' // Half-diminished with 11th
  | 'maj7(9)' // Major 7th with 9th
  | 'maj7(13)' // Major 7th with 13th
  | 'maj7(9,13)' // Major 7th with 9th and 13th
  
  // Augmented extensions
  | 'aug7(b9)' // Augmented 7th flat 9
  | 'aug9(#11)' // Augmented 9th sharp 11
  | 'aug7#9' // Augmented 7th sharp 9
  
  // Tension-only notations
  | '(9)' // Tension 9th only
  | '(11)' // Tension 11th only
  | '(13)'; // Tension 13th only

// ============================================================================
// Core Interfaces
// ============================================================================

/**
 * Represents a complete chord with all its properties
 */
export interface Chord {
  /** Root note of the chord */
  root: Note;
  /** Quality/type of the chord */
  quality: ChordQuality;
  /** Array of notes that make up the chord */
  notes: Note[];
  /** Interval pattern in semitones from the root */
  intervals: number[];
  /** Optional bass note for slash chords */
  bassNote?: Note;
}

/**
 * Result of parsing a chord string input
 */
export interface ParsedChord {
  /** Root note extracted from input */
  root: Note;
  /** Chord quality extracted from input */
  quality: ChordQuality;
  /** Bass note if slash notation was used */
  bassNote?: Note;
}

/**
 * A chord suggestion with scoring information
 */
export interface ChordSuggestion {
  /** Display name of the chord */
  name: string;
  /** Root note of the chord */
  root: Note;
  /** Quality/type of the chord */
  quality: ChordQuality;
  /** Array of notes in the chord */
  notes: Note[];
  /** Bass note for slash chords */
  bassNote?: Note;
  /** How well the chord matches selected notes (0-1) */
  matchScore: number;
  /** Whether all chord notes match exactly */
  exactMatch: boolean;
  /** Simplicity score for prioritizing basic chords */
  simplicityScore: number;
}

/**
 * Result containing exact and partial chord matches
 */
export interface ChordSuggestionResult {
  /** Chords that match exactly with selected notes */
  exact: ChordSuggestion[];
  /** Chords that partially match selected notes */
  partial: ChordSuggestion[];
}

// ============================================================================
// Service Interfaces
// ============================================================================

/**
 * Interface for audio playback functionality
 */
export interface AudioPlayerInterface {
  /** Initialize the audio context */
  init(): AudioContext;
  
  /** Play a single note at given frequency */
  playNote(frequency: number, duration?: number, startTime?: number): OscillatorNode;
  
  /** Play multiple notes as a chord */
  playChord(notes: Note[], octave?: number, duration?: number, bassNote?: Note): OscillatorNode[];
  
  /** Play notes in sequence (arpeggio) */
  playArpeggio(notes: Note[], octave?: number, noteLength?: number, gap?: number): OscillatorNode[];
  
  /** Set master volume (0-1) */
  setVolume(value: number): void;
  
  /** Suspend audio context */
  suspend(): void;
  
  /** Resume audio context */
  resume(): void;
  
  /** Set the waveform type for synthesis */
  setTimbre(timbre: WaveType): void;
  
  /** Get current waveform type */
  getTimbre(): WaveType;
}

/**
 * Interface for music theory operations
 */
export interface MusicTheoryInterface {
  /** Array of sharp notes */
  readonly notes: readonly Note[];
  
  /** Array of flat notes */
  readonly flatNotes: readonly Note[];
  
  /** Parse chord string into components */
  parseChord(chordString: string): ParsedChord;
  
  /** Get complete chord object from string */
  getChordFromString(chordString: string): Chord;
  
  /** Find possible chords from selected notes */
  findPossibleChords(selectedNotes: Note[], bassNote?: Note): ChordSuggestionResult;
  
  /** Convert note to MIDI number */
  getMidiNote(note: Note, octave?: number): number | null;
  
  /** Convert MIDI number to frequency */
  getFrequency(midiNote: number): number;
  
  /** Convert notes to specified notation system */
  convertToNotation(notesArray: Note[], useFlats?: boolean): Note[];
  
  /** Normalize note to sharp notation */
  normalizeNote(note: Note): Note;
  
  /** Enharmonic equivalent mappings */
  readonly enharmonicEquivalents: Record<string, string>;
  
  /** Reverse enharmonic mappings */
  readonly reverseEnharmonic: Record<string, string>;
}

// ============================================================================
// Application State Types
// ============================================================================

/**
 * Application configuration options
 */
export interface AppConfig {
  /** Default octave for playback */
  defaultOctave: number;
  
  /** Default note duration */
  defaultDuration: number;
  
  /** Default audio waveform */
  defaultTimbre: WaveType;
  
  /** Default master volume */
  defaultVolume: number;
  
  /** Whether to use flat notation by default */
  useFlatsDefault: boolean;
}

/**
 * UI element references for type safety
 */
export interface UIElements {
  chordInput: HTMLInputElement;
  playChordBtn: HTMLButtonElement;
  chordResult: HTMLDivElement;
  noteButtons: NodeListOf<HTMLButtonElement>;
  clearNotesBtn: HTMLButtonElement;
  playNotesBtn: HTMLButtonElement;
  chordSuggestion: HTMLDivElement;
  bassNoteSelect: HTMLSelectElement;
  notationRadios: NodeListOf<HTMLInputElement>;
  timbreSelect: HTMLSelectElement;
}

/**
 * Application state for managing user interactions
 */
export interface AppState {
  /** Currently selected notes on the virtual keyboard */
  selectedNotes: Note[];
  
  /** Current chord being analyzed/displayed */
  currentChord: Chord | null;
  
  /** Notes of the current chord for playback */
  currentChordNotes: Note[];
  
  /** Whether to display flat notation */
  useFlats: boolean;
}