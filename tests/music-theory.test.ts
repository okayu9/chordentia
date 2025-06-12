import { MusicTheory } from '../src/music-theory.js';
import type { Note, ChordQuality } from '../src/types.js';

describe('MusicTheory', () => {
  describe('parseChord', () => {
    it('should parse basic major chord', () => {
      const result = MusicTheory.parseChord('C');
      expect(result.root).toBe('C');
      expect(result.quality).toBe('maj');
      expect(result.bassNote).toBeUndefined();
    });

    it('should parse minor chord', () => {
      const result = MusicTheory.parseChord('Am');
      expect(result.root).toBe('A');
      expect(result.quality).toBe('m');
    });

    it('should parse seventh chord', () => {
      const result = MusicTheory.parseChord('C7');
      expect(result.root).toBe('C');
      expect(result.quality).toBe('7');
    });

    it('should parse slash chord', () => {
      const result = MusicTheory.parseChord('C/G');
      expect(result.root).toBe('C');
      expect(result.quality).toBe('maj');
      expect(result.bassNote).toBe('G');
    });

    it('should parse sharp notes', () => {
      const result = MusicTheory.parseChord('F#m');
      expect(result.root).toBe('F#');
      expect(result.quality).toBe('m');
    });

    it('should handle case insensitive input', () => {
      const result = MusicTheory.parseChord('am7');
      expect(result.root).toBe('A');
      expect(result.quality).toBe('m7');
    });
  });

  describe('getChordFromString', () => {
    it('should generate chord notes for C major', () => {
      const chord = MusicTheory.getChordFromString('C');
      expect(chord.root).toBe('C');
      expect(chord.notes).toEqual(['C', 'E', 'G']);
      expect(chord.quality).toBe('maj');
    });

    it('should generate chord notes for A minor', () => {
      const chord = MusicTheory.getChordFromString('Am');
      expect(chord.root).toBe('A');
      expect(chord.notes).toEqual(['A', 'C', 'E']);
      expect(chord.quality).toBe('m');
    });

    it('should handle slash chords correctly', () => {
      const chord = MusicTheory.getChordFromString('C/G');
      expect(chord.root).toBe('C');
      expect(chord.notes).toEqual(['G', 'C', 'E']);
      expect(chord.bassNote).toBe('G');
    });

    it('should throw error for invalid root note', () => {
      expect(() => MusicTheory.getChordFromString('X')).toThrow('Invalid root note');
    });

    it('should throw error for invalid chord quality', () => {
      expect(() => MusicTheory.getChordFromString('Cxyz')).toThrow('Invalid chord quality');
    });
  });

  describe('findPossibleChords', () => {
    it('should find C major from C-E-G', () => {
      const result = MusicTheory.findPossibleChords(['C', 'E', 'G'] as Note[]);
      expect(result.exact.length).toBeGreaterThan(0);
      const cMajor = result.exact.find(chord => chord.name === 'C');
      expect(cMajor).toBeDefined();
      expect(cMajor?.exactMatch).toBe(true);
    });

    it('should find A minor from A-C-E', () => {
      const result = MusicTheory.findPossibleChords(['A', 'C', 'E'] as Note[]);
      expect(result.exact.length).toBeGreaterThan(0);
      const aMinor = result.exact.find(chord => chord.name === 'Am');
      expect(aMinor).toBeDefined();
    });

    it('should handle empty input', () => {
      const result = MusicTheory.findPossibleChords([]);
      expect(result.exact).toEqual([]);
      expect(result.partial).toEqual([]);
    });

    it('should prioritize simpler chords', () => {
      const result = MusicTheory.findPossibleChords(['C', 'E', 'G'] as Note[]);
      const firstExact = result.exact[0];
      expect(firstExact?.name).toBe('C'); // Should be C major, not C6 or other complex chords
    });
  });

  describe('getMidiNote', () => {
    it('should return correct MIDI note for C4', () => {
      const midi = MusicTheory.getMidiNote('C' as Note, 4);
      expect(midi).toBe(60);
    });

    it('should return correct MIDI note for A4', () => {
      const midi = MusicTheory.getMidiNote('A' as Note, 4);
      expect(midi).toBe(69);
    });

    it('should handle different octaves', () => {
      const c3 = MusicTheory.getMidiNote('C' as Note, 3);
      const c5 = MusicTheory.getMidiNote('C' as Note, 5);
      expect(c5! - c3!).toBe(24); // 2 octaves = 24 semitones
    });

    it('should return null for invalid note', () => {
      const result = MusicTheory.getMidiNote('X' as Note);
      expect(result).toBeNull();
    });
  });

  describe('getFrequency', () => {
    it('should return 440Hz for A4 (MIDI 69)', () => {
      const freq = MusicTheory.getFrequency(69);
      expect(freq).toBeCloseTo(440, 1);
    });

    it('should return correct frequency for C4 (MIDI 60)', () => {
      const freq = MusicTheory.getFrequency(60);
      expect(freq).toBeCloseTo(261.63, 1);
    });
  });

  describe('convertToNotation', () => {
    it('should convert sharps to flats when useFlats is true', () => {
      const result = MusicTheory.convertToNotation(['C#', 'D#'] as Note[], true);
      expect(result).toEqual(['Db', 'Eb']);
    });

    it('should keep sharps when useFlats is false', () => {
      const result = MusicTheory.convertToNotation(['C#', 'D#'] as Note[], false);
      expect(result).toEqual(['C#', 'D#']);
    });

    it('should not affect natural notes', () => {
      const result = MusicTheory.convertToNotation(['C', 'D', 'E'] as Note[], true);
      expect(result).toEqual(['C', 'D', 'E']);
    });
  });

  describe('normalizeNote', () => {
    it('should convert flats to sharps', () => {
      expect(MusicTheory.normalizeNote('Db' as Note)).toBe('C#');
      expect(MusicTheory.normalizeNote('Eb' as Note)).toBe('D#');
    });

    it('should keep natural notes unchanged', () => {
      expect(MusicTheory.normalizeNote('C' as Note)).toBe('C');
      expect(MusicTheory.normalizeNote('D' as Note)).toBe('D');
    });

    it('should keep sharps unchanged', () => {
      expect(MusicTheory.normalizeNote('C#' as Note)).toBe('C#');
      expect(MusicTheory.normalizeNote('F#' as Note)).toBe('F#');
    });
  });
});