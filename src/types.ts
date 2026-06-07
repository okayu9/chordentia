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

import type { ChordAlias, ChordRegistryKey } from './chord-registry-complete.js';

/**
 * All supported chord qualities and aliases, derived from the chord registry.
 */
export type ChordQuality = ChordRegistryKey | ChordAlias;

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
