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

    it('should handle triple flats', () => {
      expect(MusicTheory.normalizeNote('Ebb' as Note)).toBe('D');
      expect(MusicTheory.normalizeNote('Abb' as Note)).toBe('G');
      expect(MusicTheory.normalizeNote('Bbb' as Note)).toBe('A');
    });
  });

  describe('New Chord Types - Additional Common Notations', () => {
    describe('Tension chords', () => {
      it('should parse C(9) as 7th with 9th', () => {
        const result = MusicTheory.parseChord('C(9)');
        expect(result.root).toBe('C');
        expect(result.quality).toBe('(9)');
      });

      it('should generate correct notes for C(9)', () => {
        const chord = MusicTheory.getChordFromString('C(9)');
        expect(chord.notes).toEqual(['C', 'E', 'G', 'A#', 'D']);
      });

      it('should parse C(11) as 7th with 11th', () => {
        const chord = MusicTheory.getChordFromString('C(11)');
        expect(chord.notes).toEqual(['C', 'E', 'G', 'A#', 'F']);
      });

      it('should parse C(13) as 7th with 13th', () => {
        const chord = MusicTheory.getChordFromString('C(13)');
        expect(chord.notes).toEqual(['C', 'E', 'G', 'A#', 'A']);
      });
    });

    describe('Omission chords (omit3, omit5)', () => {
      it('should parse Comit3 as chord without 3rd', () => {
        const chord = MusicTheory.getChordFromString('Comit3');
        expect(chord.notes).toEqual(['C', 'G']);
      });

      it('should parse Comit5 as chord without 5th', () => {
        const chord = MusicTheory.getChordFromString('Comit5');
        expect(chord.notes).toEqual(['C', 'E']);
      });

      it('should parse Cmaj7(omit3) as maj7 without 3rd', () => {
        const chord = MusicTheory.getChordFromString('Cmaj7(omit3)');
        expect(chord.notes).toEqual(['C', 'G', 'B']);
      });
    });

    describe('Add chords (add2, add4, add6)', () => {
      it('should parse Cadd2 with added 2nd', () => {
        const chord = MusicTheory.getChordFromString('Cadd2');
        expect(chord.notes).toEqual(['C', 'D', 'E', 'G']);
      });

      it('should parse Cadd4 with added 4th', () => {
        const chord = MusicTheory.getChordFromString('Cadd4');
        expect(chord.notes).toEqual(['C', 'E', 'F', 'G']);
      });

      it('should parse Cadd6 with added 6th', () => {
        const chord = MusicTheory.getChordFromString('Cadd6');
        expect(chord.notes).toEqual(['C', 'E', 'G', 'A']);
      });
    });

    describe('Altered dominant chords', () => {
      it('should parse C7alt as altered dominant', () => {
        const chord = MusicTheory.getChordFromString('C7alt');
        expect(chord.notes).toEqual(['C', 'E', 'F#', 'A#', 'C#', 'D#']);
      });

      it('should parse C7(b5,#9) as dominant with b5 and #9', () => {
        const chord = MusicTheory.getChordFromString('C7(b5,#9)');
        expect(chord.notes).toEqual(['C', 'E', 'F#', 'A#', 'D#']);
      });

      it('should parse C7(#5,b9) as dominant with #5 and b9', () => {
        const chord = MusicTheory.getChordFromString('C7(#5,b9)');
        expect(chord.notes).toEqual(['C', 'E', 'G#', 'A#', 'C#']);
      });

      it('should parse C7(#9,#11) as dominant with #9 and #11', () => {
        const chord = MusicTheory.getChordFromString('C7(#9,#11)');
        expect(chord.notes).toEqual(['C', 'E', 'G', 'A#', 'D#', 'F#']);
      });

      it('should parse C7(b9,#11) as dominant with b9 and #11', () => {
        const chord = MusicTheory.getChordFromString('C7(b9,#11)');
        expect(chord.notes).toEqual(['C', 'E', 'G', 'A#', 'C#', 'F#']);
      });
    });

    describe('6/9 chords', () => {
      it('should parse C6/9 chord', () => {
        const chord = MusicTheory.getChordFromString('C6/9');
        expect(chord.notes).toEqual(['C', 'E', 'G', 'A', 'D']);
      });

      it('should parse Cmaj6/9 chord', () => {
        const chord = MusicTheory.getChordFromString('Cmaj6/9');
        expect(chord.notes).toEqual(['C', 'E', 'G', 'A', 'D']);
      });
    });

    describe('Sus chords', () => {
      it('should parse Csus as sus4', () => {
        const chord = MusicTheory.getChordFromString('Csus');
        expect(chord.notes).toEqual(['C', 'F', 'G']);
      });
    });
  });

  describe('Chord Parsing Normalization', () => {
    describe('Alternative notations', () => {
      it('should normalize △ to maj7', () => {
        const result = MusicTheory.parseChord('C△');
        expect(result.quality).toBe('maj7');
      });

      it('should keep omit3 as omit3', () => {
        const result = MusicTheory.parseChord('Comit3');
        expect(result.quality).toBe('omit3');
      });

      it('should keep omit5 as omit5', () => {
        const result = MusicTheory.parseChord('Comit5');
        expect(result.quality).toBe('omit5');
      });

      it('should normalize no3 to omit3', () => {
        const result = MusicTheory.parseChord('Cno3');
        expect(result.quality).toBe('omit3');
      });

      it('should normalize no5 to omit5', () => {
        const result = MusicTheory.parseChord('Cno5');
        expect(result.quality).toBe('omit5');
      });

      it('should normalize 6add9 to 6/9', () => {
        const result = MusicTheory.parseChord('C6add9');
        expect(result.quality).toBe('6/9');
      });

      it('should normalize 69 to 6/9', () => {
        const result = MusicTheory.parseChord('C69');
        expect(result.quality).toBe('6/9');
      });

      it('should normalize maj69 to maj6/9', () => {
        const result = MusicTheory.parseChord('Cmaj69');
        expect(result.quality).toBe('maj6/9');
      });

      it('should normalize M69 to maj6/9', () => {
        const result = MusicTheory.parseChord('CM69');
        expect(result.quality).toBe('maj6/9');
      });

      it('should normalize alt to 7alt', () => {
        const result = MusicTheory.parseChord('Calt');
        expect(result.quality).toBe('7alt');
      });

      it('should normalize 7altered to 7alt', () => {
        const result = MusicTheory.parseChord('C7altered');
        expect(result.quality).toBe('7alt');
      });

      it('should normalize altered to 7alt', () => {
        const result = MusicTheory.parseChord('Caltered');
        expect(result.quality).toBe('7alt');
      });

      it('should normalize suspended to sus4', () => {
        const result = MusicTheory.parseChord('Csuspended');
        expect(result.quality).toBe('sus4');
      });
    });

    describe('Parentheses notation', () => {
      it('should normalize (b5,#9) to 7(b5,#9)', () => {
        const result = MusicTheory.parseChord('C(b5,#9)');
        expect(result.quality).toBe('7(b5,#9)');
      });

      it('should normalize (#5,b9) to 7(#5,b9)', () => {
        const result = MusicTheory.parseChord('C(#5,b9)');
        expect(result.quality).toBe('7(#5,b9)');
      });

      it('should normalize (#9,#11) to 7(#9,#11)', () => {
        const result = MusicTheory.parseChord('C(#9,#11)');
        expect(result.quality).toBe('7(#9,#11)');
      });

      it('should normalize (b9,#11) to 7(b9,#11)', () => {
        const result = MusicTheory.parseChord('C(b9,#11)');
        expect(result.quality).toBe('7(b9,#11)');
      });
    });
  });

  describe('Complex sheet music chords from provided examples', () => {
    describe('First sheet music chords', () => {
      it('should parse Em7-5', () => {
        const chord = MusicTheory.getChordFromString('Em7-5');
        expect(chord.notes).toEqual(['E', 'G', 'A#', 'D']);
      });

      it('should parse C7(b9)', () => {
        const chord = MusicTheory.getChordFromString('C7(b9)');
        expect(chord.notes).toEqual(['C', 'E', 'G', 'A#', 'C#']);
      });

      it('should parse Bbm7(11)', () => {
        const chord = MusicTheory.getChordFromString('Bbm7(11)');
        expect(chord.notes).toEqual(['A#', 'C#', 'F', 'G#', 'D#']);
      });

      it('should parse BbmM7', () => {
        const chord = MusicTheory.getChordFromString('BbmM7');
        expect(chord.notes).toEqual(['A#', 'C#', 'F', 'A']);
      });

      it('should parse C9sus4', () => {
        const chord = MusicTheory.getChordFromString('C9sus4');
        expect(chord.notes).toEqual(['C', 'F', 'G', 'A#', 'D']);
      });
    });

    describe('Second sheet music chords', () => {
      it('should parse D7(13)', () => {
        const chord = MusicTheory.getChordFromString('D7(13)');
        expect(chord.notes).toEqual(['D', 'F#', 'A', 'C', 'B']);
      });

      it('should parse C7(#9)', () => {
        const chord = MusicTheory.getChordFromString('C7(#9)');
        expect(chord.notes).toEqual(['C', 'E', 'G', 'A#', 'D#']);
      });

      it('should parse Fm7(9)', () => {
        const chord = MusicTheory.getChordFromString('Fm7(9)');
        expect(chord.notes).toEqual(['F', 'G#', 'C', 'D#', 'G']);
      });

      it('should parse EbM7(9)', () => {
        const chord = MusicTheory.getChordFromString('EbM7(9)');
        expect(chord.notes).toEqual(['D#', 'G', 'A#', 'D', 'F']);
      });

      it('should parse Eb9(b5)', () => {
        const chord = MusicTheory.getChordFromString('Eb9(b5)');
        expect(chord.notes).toEqual(['D#', 'G', 'A', 'C#', 'F']);
      });
    });

    describe('Third sheet music chords with triple flats', () => {
      it('should parse Bbbaug/Cb chord', () => {
        const chord = MusicTheory.getChordFromString('Bbbaug/Cb');
        expect(chord.root).toBe('Bbb');
        expect(chord.quality).toBe('aug');
        expect(chord.bassNote).toBe('Cb');
      });

      it('should parse BbbaugM7/Cb chord', () => {
        const chord = MusicTheory.getChordFromString('BbbaugM7/Cb');
        expect(chord.root).toBe('Bbb');
        expect(chord.quality).toBe('maj7+5');
        expect(chord.bassNote).toBe('Cb');
      });

      it('should parse Faug7(#9)', () => {
        const chord = MusicTheory.getChordFromString('Faug7(#9)');
        expect(chord.notes).toEqual(['F', 'A', 'C#', 'D#', 'G#']);
      });
    });
  });

  describe('Bass note priority and exact match logic', () => {
    it('should only show exact matches that include the specified bass note', () => {
      // C, E, G with bass note C should only show exact matches that contain C
      const result = MusicTheory.findPossibleChords(['C', 'E', 'G'] as Note[], 'C' as Note);
      
      // All exact matches should contain the bass note C
      result.exact.forEach(chord => {
        expect(chord.notes).toContain('C');
      });
      
      // The first suggestion should be C major (since C is both root and bass)
      expect(result.exact.length).toBeGreaterThan(0);
      expect(result.exact[0]?.name).toBe('C');
    });

    it('should not show exact matches without specified bass note', () => {
      // C, E, G with bass note F - no exact matches should appear since F is not in the selected notes
      const result = MusicTheory.findPossibleChords(['C', 'E', 'G'] as Note[], 'F' as Note);
      
      // Should have no exact matches since F is not in the selected notes
      expect(result.exact.length).toBe(0);
      
      // But should have partial matches
      expect(result.partial.length).toBeGreaterThan(0);
    });

    it('should show exact matches for slash chords when bass note is included', () => {
      // C, E, G, A with bass note A should show exact matches like C6/A
      const result = MusicTheory.findPossibleChords(['C', 'E', 'G', 'A'] as Note[], 'A' as Note);
      
      // All exact matches should contain the bass note A
      result.exact.forEach(chord => {
        expect(chord.notes).toContain('A');
      });
    });
  });
});