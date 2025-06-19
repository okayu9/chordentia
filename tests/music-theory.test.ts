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

    it('should parse complex chord with multiple extensions D7(9,#11,13)', () => {
      const result = MusicTheory.parseChord('D7(9,#11,13)');
      expect(result.root).toBe('D');
      expect(result.quality).toBe('7(9,#11,13)');
    });

    it('should parse minor-major 13th chord AmM13', () => {
      const result = MusicTheory.parseChord('AmM13');
      expect(result.root).toBe('A');
      expect(result.quality).toBe('mM13');
    });

    it('should parse minor-major chord with slash AmM13/D', () => {
      const result = MusicTheory.parseChord('AmM13/D');
      expect(result.root).toBe('A');
      expect(result.quality).toBe('mM13');
      expect(result.bassNote).toBe('D');
    });

    it('should parse augmented 7th chord as aug7', () => {
      const result = MusicTheory.parseChord('Caug7');
      expect(result.root).toBe('C');
      expect(result.quality).toBe('aug7');
    });

    it('should normalize 7+5 and 7#5 to aug7', () => {
      const result1 = MusicTheory.parseChord('C7+5');
      expect(result1.root).toBe('C');
      expect(result1.quality).toBe('aug7');

      const result2 = MusicTheory.parseChord('C7#5');
      expect(result2.root).toBe('C');
      expect(result2.quality).toBe('aug7');
    });

    it('should parse augmented 7th with slash chord', () => {
      const result = MusicTheory.parseChord('Faug7/B');
      expect(result.root).toBe('F');
      expect(result.quality).toBe('aug7');
      expect(result.bassNote).toBe('B');
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

    it('should generate chord notes for D7(9,#11,13)', () => {
      const chord = MusicTheory.getChordFromString('D7(9,#11,13)');
      expect(chord.root).toBe('D');
      expect(chord.notes).toEqual(['D', 'F#', 'A', 'C', 'E', 'G#', 'B']);
      expect(chord.quality).toBe('7(9,#11,13)');
    });

    it('should generate chord notes for AmM13', () => {
      const chord = MusicTheory.getChordFromString('AmM13');
      expect(chord.root).toBe('A');
      expect(chord.notes).toEqual(['A', 'C', 'E', 'G#', 'B', 'D', 'F#']);
      expect(chord.quality).toBe('mM13');
    });

    it('should handle AmM13/D with bass note', () => {
      const chord = MusicTheory.getChordFromString('AmM13/D');
      expect(chord.root).toBe('A');
      expect(chord.notes).toEqual(['D', 'A', 'C', 'E', 'G#', 'B', 'F#']);
      expect(chord.bassNote).toBe('D');
      expect(chord.quality).toBe('mM13');
    });

    it('should generate chord notes for augmented 7th chord', () => {
      const chord = MusicTheory.getChordFromString('Caug7');
      expect(chord.root).toBe('C');
      expect(chord.notes).toEqual(['C', 'E', 'G#', 'A#']);
      expect(chord.quality).toBe('aug7');
    });

    it('should handle augmented 7th slash chord Faug7/B', () => {
      const chord = MusicTheory.getChordFromString('Faug7/B');
      expect(chord.root).toBe('F');
      expect(chord.notes).toEqual(['B', 'F', 'A', 'C#', 'D#']);
      expect(chord.bassNote).toBe('B');
      expect(chord.quality).toBe('aug7');
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

  describe('Chord Voicing for Root Note Bass', () => {
    it('should return different chord structures for enharmonic equivalent chords', () => {
      // Test augmented chords that have the same notes but different roots
      const caug = MusicTheory.getChordFromString('Caug');
      const eaug = MusicTheory.getChordFromString('Eaug');
      const gshaug = MusicTheory.getChordFromString('G#aug');

      // All should have the same notes but different roots
      expect(caug.notes.sort()).toEqual(['C', 'E', 'G#']);
      expect(eaug.notes.sort()).toEqual(['C', 'E', 'G#']);
      expect(gshaug.notes.sort()).toEqual(['C', 'E', 'G#']);

      // But they should have different root notes
      expect(caug.root).toBe('C');
      expect(eaug.root).toBe('E');
      expect(gshaug.root).toBe('G#');

      // Bass notes should be undefined for these non-slash chords
      expect(caug.bassNote).toBeUndefined();
      expect(eaug.bassNote).toBeUndefined();
      expect(gshaug.bassNote).toBeUndefined();
    });

    it('should handle diminished chords with different roots correctly', () => {
      const cdim = MusicTheory.getChordFromString('Cdim');
      const ebdim = MusicTheory.getChordFromString('Ebdim');
      const fsharpdim = MusicTheory.getChordFromString('F#dim');

      // They should have different root notes - this is the key test
      expect(cdim.root).toBe('C');
      expect(ebdim.root).toBe('Eb'); // Eb is not normalized in root
      expect(fsharpdim.root).toBe('F#');

      // Each should have 3 notes (triad)
      expect(cdim.notes).toHaveLength(3);
      expect(ebdim.notes).toHaveLength(3);
      expect(fsharpdim.notes).toHaveLength(3);

      // Root note should be included in the notes (in normalized form)
      expect(cdim.notes).toContain('C');
      expect(ebdim.notes).toContain('D#'); // Eb becomes D# in notes
      expect(fsharpdim.notes).toContain('F#');
    });

    it('should correctly identify root notes for chord progression analysis', () => {
      // Test common chord progression chords
      const chords = ['Cmaj7', 'Am7', 'Dm7', 'G7'].map(name => 
        MusicTheory.getChordFromString(name)
      );

      expect(chords[0]!.root).toBe('C');
      expect(chords[1]!.root).toBe('A');
      expect(chords[2]!.root).toBe('D');
      expect(chords[3]!.root).toBe('G');

      // Verify they have expected chord qualities
      expect(chords[0]!.quality).toBe('maj7');
      expect(chords[1]!.quality).toBe('m7');
      expect(chords[2]!.quality).toBe('m7');
      expect(chords[3]!.quality).toBe('7');
    });

    it('should distinguish between chord with same notes but different bass notes', () => {
      // C major triad vs C/E (first inversion) vs C/G (second inversion)
      const cmaj = MusicTheory.getChordFromString('C');
      const cOverE = MusicTheory.getChordFromString('C/E');
      const cOverG = MusicTheory.getChordFromString('C/G');

      // All should have same basic notes
      expect(cmaj.notes.sort()).toEqual(['C', 'E', 'G']);
      expect(cOverE.notes.sort()).toEqual(['C', 'E', 'G']);
      expect(cOverG.notes.sort()).toEqual(['C', 'E', 'G']);

      // All should have same root
      expect(cmaj.root).toBe('C');
      expect(cOverE.root).toBe('C');
      expect(cOverG.root).toBe('C');

      // But different bass notes
      expect(cmaj.bassNote).toBeUndefined();
      expect(cOverE.bassNote).toBe('E');
      expect(cOverG.bassNote).toBe('G');
    });

    it('should handle complex jazz chords with proper root identification', () => {
      const complexChords = [
        'Cmaj7',
        'Am11',
        'D7alt',
        'G13'
      ].map(name => MusicTheory.getChordFromString(name));

      expect(complexChords[0]!.root).toBe('C');
      expect(complexChords[1]!.root).toBe('A');
      expect(complexChords[2]!.root).toBe('D');
      expect(complexChords[3]!.root).toBe('G');

      // Verify complex qualities are preserved
      expect(complexChords[0]!.quality).toBe('maj7');
      expect(complexChords[1]!.quality).toBe('m11');
      expect(complexChords[2]!.quality).toBe('7alt');
      expect(complexChords[3]!.quality).toBe('13');
    });
  });

  describe('Enharmonic Note Handling Fixes', () => {
    it('should handle problematic enharmonic notes correctly', () => {
      // Test previously problematic notes
      const problemNotes = ['Fb', 'Dbb', 'Cb'] as Note[];
      
      for (const note of problemNotes) {
        // Should have valid MIDI mapping
        expect(MusicTheory.getMidiNote(note, 4)).not.toBeNull();
        
        // Should normalize correctly
        const normalized = MusicTheory.normalizeNote(note);
        expect(normalized).toBeTruthy();
        expect(normalized).not.toBe(note); // Should normalize to something else
      }
    });

    it('should generate chord notes for Fb, Cb, and Dbb chords', () => {
      // Test chord generation for previously failing notes
      expect(() => MusicTheory.getChordFromString('Fb')).not.toThrow();
      expect(() => MusicTheory.getChordFromString('Cb')).not.toThrow();
      expect(() => MusicTheory.getChordFromString('Dbb')).not.toThrow();
      
      const fbChord = MusicTheory.getChordFromString('Fb');
      const cbChord = MusicTheory.getChordFromString('Cb');
      const dbbChord = MusicTheory.getChordFromString('Dbb');
      
      // Should have notes
      expect(fbChord.notes.length).toBeGreaterThan(0);
      expect(cbChord.notes.length).toBeGreaterThan(0);
      expect(dbbChord.notes.length).toBeGreaterThan(0);
      
      // Should have correct root notes
      expect(fbChord.root).toBe('Fb');
      expect(cbChord.root).toBe('Cb');
      expect(dbbChord.root).toBe('Dbb');
    });

    it('should handle Abb, Bbb, Ebb consistently', () => {
      // These partially worked before, should work completely now
      const workingNotes = ['Abb', 'Bbb', 'Ebb'] as Note[];
      
      for (const note of workingNotes) {
        // Should generate chords without error
        expect(() => MusicTheory.getChordFromString(note)).not.toThrow();
        
        const chord = MusicTheory.getChordFromString(note);
        expect(chord.notes.length).toBeGreaterThan(0);
        expect(chord.root).toBe(note);
      }
    });

    it('should find chords from selected notes including enharmonic equivalents', () => {
      // Test that chord finding works with enharmonic notes
      const fbMajorNotes = MusicTheory.getChordFromString('Fb').notes;
      const foundChords = MusicTheory.findPossibleChords(fbMajorNotes);
      
      // Should find some chords
      expect(foundChords.exact.length + foundChords.partial.length).toBeGreaterThan(0);
    });

    it('should correctly normalize all enharmonic equivalents', () => {
      const enharmonicTests = [
        { input: 'Fb', expected: 'E' },
        { input: 'Cb', expected: 'B' },
        { input: 'Dbb', expected: 'C' },
        { input: 'Ebb', expected: 'D' },
        { input: 'Abb', expected: 'G' },
        { input: 'Bbb', expected: 'A' },
      ];

      for (const test of enharmonicTests) {
        expect(MusicTheory.normalizeNote(test.input as Note)).toBe(test.expected);
      }
    });

    it('should handle enharmonic notes in MIDI conversion', () => {
      // Test MIDI note conversion for enharmonic equivalents
      expect(MusicTheory.getMidiNote('Fb', 4)).toBe(64); // Same as E4
      expect(MusicTheory.getMidiNote('Cb', 4)).toBe(71); // Same as B4
      expect(MusicTheory.getMidiNote('Dbb', 4)).toBe(60); // Same as C4
      expect(MusicTheory.getMidiNote('E', 4)).toBe(64);
      expect(MusicTheory.getMidiNote('B', 4)).toBe(71);
      expect(MusicTheory.getMidiNote('C', 4)).toBe(60);
    });
  });

  describe('Double Accidentals Support', () => {
    it('should handle all double-flat notes correctly', () => {
      const doubleFlatTests = [
        { input: 'Cbb', midiExpected: 70, normalizedExpected: 'A#' }, // C double-flat = Bb
        { input: 'Dbb', midiExpected: 60, normalizedExpected: 'C' },  // D double-flat = C
        { input: 'Ebb', midiExpected: 62, normalizedExpected: 'D' },  // E double-flat = D
        { input: 'Fbb', midiExpected: 63, normalizedExpected: 'D#' }, // F double-flat = Eb
        { input: 'Gbb', midiExpected: 65, normalizedExpected: 'F' },  // G double-flat = F
        { input: 'Abb', midiExpected: 67, normalizedExpected: 'G' },  // A double-flat = G
        { input: 'Bbb', midiExpected: 69, normalizedExpected: 'A' },  // B double-flat = A
      ];

      for (const test of doubleFlatTests) {
        // Test MIDI conversion
        expect(MusicTheory.getMidiNote(test.input as Note, 4)).toBe(test.midiExpected);
        
        // Test normalization
        expect(MusicTheory.normalizeNote(test.input as Note)).toBe(test.normalizedExpected);
        
        // Test chord generation
        expect(() => MusicTheory.getChordFromString(test.input)).not.toThrow();
        const chord = MusicTheory.getChordFromString(test.input);
        expect(chord.notes.length).toBeGreaterThan(0);
        expect(chord.root).toBe(test.input);
      }
    });

    it('should handle all double-sharp notes correctly', () => {
      const doubleSharpTests = [
        { input: 'C##', midiExpected: 62, normalizedExpected: 'D' },  // C double-sharp = D
        { input: 'D##', midiExpected: 64, normalizedExpected: 'E' },  // D double-sharp = E
        { input: 'E##', midiExpected: 66, normalizedExpected: 'F#' }, // E double-sharp = F#
        { input: 'F##', midiExpected: 67, normalizedExpected: 'G' },  // F double-sharp = G
        { input: 'G##', midiExpected: 69, normalizedExpected: 'A' },  // G double-sharp = A
        { input: 'A##', midiExpected: 71, normalizedExpected: 'B' },  // A double-sharp = B
        { input: 'B##', midiExpected: 61, normalizedExpected: 'C#' }, // B double-sharp = C#
      ];

      for (const test of doubleSharpTests) {
        // Test MIDI conversion
        expect(MusicTheory.getMidiNote(test.input as Note, 4)).toBe(test.midiExpected);
        
        // Test normalization
        expect(MusicTheory.normalizeNote(test.input as Note)).toBe(test.normalizedExpected);
        
        // Test chord generation
        expect(() => MusicTheory.getChordFromString(test.input)).not.toThrow();
        const chord = MusicTheory.getChordFromString(test.input);
        expect(chord.notes.length).toBeGreaterThan(0);
        expect(chord.root).toBe(test.input);
      }
    });

    it('should generate correct chord notes for double accidentals', () => {
      // Test some specific double accidental chords
      const fbbMajor = MusicTheory.getChordFromString('Fbb'); // F double-flat major
      const csharpsharpMajor = MusicTheory.getChordFromString('C##'); // C double-sharp major
      
      // Fbb major should have notes equivalent to Eb major
      expect(fbbMajor.notes).toEqual(['D#', 'G', 'A#']); // Eb-G-Bb normalized
      
      // C## major should have notes equivalent to D major
      expect(csharpsharpMajor.notes).toEqual(['D', 'F#', 'A']); // D-F#-A
    });

    it('should handle complex chords with double accidentals', () => {
      // Test some complex chord combinations
      const complexChords = [
        'C##m7',   // C double-sharp minor 7
        'Fbb7',    // F double-flat 7
        'G##dim',  // G double-sharp diminished
        'Abbmaj7', // A double-flat major 7
      ];

      for (const chordName of complexChords) {
        expect(() => MusicTheory.getChordFromString(chordName)).not.toThrow();
        const chord = MusicTheory.getChordFromString(chordName);
        expect(chord.notes.length).toBeGreaterThan(2); // Should have at least 3 notes
      }
    });

    it('should find chords using double accidental notes', () => {
      // Test chord finding with double accidentals
      const fbbMajorNotes = MusicTheory.getChordFromString('Fbb').notes;
      const foundChords = MusicTheory.findPossibleChords(fbbMajorNotes);
      
      // Should find some chords (at least the equivalent Eb major variations)
      expect(foundChords.exact.length + foundChords.partial.length).toBeGreaterThan(0);
    });

    it('should handle enharmonic equivalence between double accidentals and regular notes', () => {
      // Test that double accidentals resolve to the same MIDI notes as their equivalents
      expect(MusicTheory.getMidiNote('C##', 4)).toBe(MusicTheory.getMidiNote('D', 4));
      expect(MusicTheory.getMidiNote('Fbb', 4)).toBe(MusicTheory.getMidiNote('Eb', 4));
      expect(MusicTheory.getMidiNote('G##', 4)).toBe(MusicTheory.getMidiNote('A', 4));
      expect(MusicTheory.getMidiNote('Cbb', 4)).toBe(MusicTheory.getMidiNote('Bb', 4));
    });
  });
});