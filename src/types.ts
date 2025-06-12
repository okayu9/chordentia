// 基本的な音楽理論の型定義
export type Note =
  | 'C'
  | 'C#'
  | 'Db'
  | 'D'
  | 'D#'
  | 'Eb'
  | 'E'
  | 'F'
  | 'F#'
  | 'Gb'
  | 'G'
  | 'G#'
  | 'Ab'
  | 'A'
  | 'A#'
  | 'Bb'
  | 'B';

export type ChordQuality =
  | ''
  | 'maj'
  | 'm'
  | 'min'
  | '7'
  | 'maj7'
  | 'm7'
  | 'min7'
  | 'dim'
  | 'dim7'
  | 'm7b5'
  | 'aug'
  | 'sus2'
  | 'sus4'
  | '6'
  | 'm6'
  | '9'
  | 'maj9'
  | 'm9'
  | 'add9'
  | 'add11'
  | 'add#11'
  | 'add13'
  | 'add#13'
  | '+5'
  | 'maj7+5'
  | '7+5'
  | 'm11'
  | '13'
  | 'm13'
  | 'omit5'
  | 'm(omit5)'
  | '7omit5'
  | 'maj7omit5'
  | 'm7omit5'
  | 'omit3'
  | '5'
  | '7omit3'
  | 'sus2omit5'
  | 'sus4omit5'
  | '7sus4omit5'
  | '9omit5'
  | 'm9omit5';

export type WaveType = 'sine' | 'square' | 'sawtooth' | 'triangle';

export interface Chord {
  root: Note;
  quality: ChordQuality;
  notes: Note[];
  intervals: number[];
  bassNote?: Note;
}

export interface ParsedChord {
  root: Note;
  quality: ChordQuality;
  bassNote?: Note;
}

export interface ChordSuggestion {
  name: string;
  root: Note;
  quality: ChordQuality;
  notes: Note[];
  bassNote?: Note;
  matchScore: number;
  exactMatch: boolean;
  simplicityScore: number;
}

export interface ChordSuggestionResult {
  exact: ChordSuggestion[];
  partial: ChordSuggestion[];
}

export interface AudioPlayerInterface {
  init(): AudioContext;
  playNote(frequency: number, duration?: number, startTime?: number): OscillatorNode;
  playChord(notes: Note[], octave?: number, duration?: number, bassNote?: Note): OscillatorNode[];
  playArpeggio(notes: Note[], octave?: number, noteLength?: number, gap?: number): OscillatorNode[];
  setVolume(value: number): void;
  suspend(): void;
  resume(): void;
  setTimbre(timbre: WaveType): void;
  getTimbre(): WaveType;
}

export interface MusicTheoryInterface {
  notes: readonly Note[];
  flatNotes: readonly Note[];
  parseChord(chordString: string): ParsedChord;
  getChordFromString(chordString: string): Chord;
  findPossibleChords(selectedNotes: Note[], bassNote?: Note): ChordSuggestionResult;
  getMidiNote(note: Note, octave?: number): number | null;
  getFrequency(midiNote: number): number;
  convertToNotation(notesArray: Note[], useFlats?: boolean): Note[];
  normalizeNote(note: Note): Note;
  enharmonicEquivalents: Record<string, string>;
  reverseEnharmonic: Record<string, string>;
}
