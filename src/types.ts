// 基本的な音楽理論の型定義
export type Note =
  | 'C'
  | 'C#'
  | 'Db'
  | 'D'
  | 'D#'
  | 'Eb'
  | 'Ebb'
  | 'E'
  | 'Fb'
  | 'F'
  | 'F#'
  | 'Gb'
  | 'G'
  | 'G#'
  | 'Ab'
  | 'Abb'
  | 'A'
  | 'A#'
  | 'Bb'
  | 'Bbb'
  | 'B'
  | 'Cb';

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
  | 'm9omit5'
  | '7b9'
  | 'm7(11)'
  | 'mM7'
  | '9sus4'
  | '7sus4'
  | '7(13)'
  | '7#9'
  | 'm7(9)'
  | 'maj7(9)'
  | '9b5'
  | 'maj7(9,13)'
  | '7(9,13)'
  | 'maj7(13)'
  | '7b5'
  | '7(9)'
  | '7(b9,b13)'
  | 'aug7(b9)'
  | 'aug9(#11)'
  | 'm7b5(11)'
  | 'm7(9,11)'
  | 'aug7#9'
  | '(9)'
  | '(11)'
  | '(13)'
  | 'omit3'
  | 'omit5'
  | 'maj7(omit3)'
  | 'add2'
  | 'add4'
  | 'add6'
  | '7alt'
  | '7(b5,#9)'
  | '7(#5,b9)'
  | '7(#9,#11)'
  | '7(b9,#11)'
  | '6/9'
  | 'maj6/9'
  | 'sus';

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
