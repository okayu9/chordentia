import type { 
  Note, 
  ChordQuality, 
  Chord, 
  ParsedChord, 
  ChordSuggestion, 
  ChordSuggestionResult,
  MusicTheoryInterface 
} from './types.js';

const notes: readonly Note[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
const flatNotes: readonly Note[] = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'] as const;

const enharmonicEquivalents: Record<string, string> = {
  'C#': 'Db',
  'D#': 'Eb',
  'F#': 'Gb',
  'G#': 'Ab',
  'A#': 'Bb'
} as const;

const reverseEnharmonic: Record<string, string> = {
  'Db': 'C#',
  'Eb': 'D#',
  'Gb': 'F#',
  'Ab': 'G#',
  'Bb': 'A#'
} as const;

const noteToMidi: Record<string, number> = {
  'C': 60, 'C#': 61, 'Db': 61,
  'D': 62, 'D#': 63, 'Eb': 63,
  'E': 64,
  'F': 65, 'F#': 66, 'Gb': 66,
  'G': 67, 'G#': 68, 'Ab': 68,
  'A': 69, 'A#': 70, 'Bb': 70,
  'B': 71
} as const;

const chordFormulas: Record<ChordQuality, readonly number[]> = {
  '': [0, 4, 7],  // メジャーコード（デフォルト）
  'maj': [0, 4, 7],  // parseChord関数での処理用に残す
  'm': [0, 3, 7],
  'min': [0, 3, 7],
  '7': [0, 4, 7, 10],
  'maj7': [0, 4, 7, 11],
  'm7': [0, 3, 7, 10],
  'min7': [0, 3, 7, 10],
  'dim': [0, 3, 6],
  'dim7': [0, 3, 6, 9],
  'm7b5': [0, 3, 6, 10],  // 半減7度コード
  'aug': [0, 4, 8],
  'sus2': [0, 2, 7],
  'sus4': [0, 5, 7],
  '6': [0, 4, 7, 9],
  'm6': [0, 3, 7, 9],
  '9': [0, 4, 7, 10, 14],
  'maj9': [0, 4, 7, 11, 14],
  'm9': [0, 3, 7, 10, 14],
  'add9': [0, 4, 7, 14],
  'add11': [0, 4, 7, 17],
  'add#11': [0, 4, 7, 8],  // C, E, G, G# (シャープ11度は8半音)
  'add13': [0, 4, 7, 21],
  'add#13': [0, 4, 7, 22],
  '+5': [0, 4, 8],  // augmentedと同じ（入力用のみ）
  'maj7+5': [0, 4, 8, 11],
  '7+5': [0, 4, 8, 10],
  'm11': [0, 3, 7, 10, 14, 17],
  '13': [0, 4, 7, 10, 14, 21],
  'm13': [0, 3, 7, 10, 14, 21],
  // 省略系コード
  'omit5': [0, 4],  // 5度省略メジャー
  'm(omit5)': [0, 3],  // 5度省略マイナー
  '7omit5': [0, 4, 10],  // 5度省略セブンス
  'maj7omit5': [0, 4, 11],  // 5度省略メジャーセブンス
  'm7omit5': [0, 3, 10],  // 5度省略マイナーセブンス
  'omit3': [0, 7],  // 3度省略（パワーコード）
  '5': [0, 7],  // パワーコード
  '7omit3': [0, 7, 10],  // 3度省略セブンス
  'sus2omit5': [0, 2],  // 5度省略sus2
  'sus4omit5': [0, 5],  // 5度省略sus4
  '7sus4omit5': [0, 5, 10],  // 5度省略7sus4
  '9omit5': [0, 4, 10, 14],  // 5度省略9th
  'm9omit5': [0, 3, 10, 14]  // 5度省略m9
} as const;

function parseChord(chordString: string): ParsedChord {
  chordString = chordString.trim();
  let root = '';
  let quality = '';
  let bassNote: Note | undefined = undefined;

  // オンコード（スラッシュコード）の処理
  const slashIndex = chordString.indexOf('/');
  if (slashIndex !== -1) {
    const bassNoteString = chordString.substring(slashIndex + 1).trim();
    bassNote = (bassNoteString.charAt(0).toUpperCase() + bassNoteString.slice(1).toLowerCase()) as Note;
    chordString = chordString.substring(0, slashIndex).trim();
  }

  if (chordString.length >= 2 && (chordString[1] === '#' || chordString[1] === 'b')) {
    root = chordString.substring(0, 2);
    quality = chordString.substring(2);
  } else {
    root = chordString[0] || '';
    quality = chordString.substring(1);
  }

  root = (root.charAt(0).toUpperCase() + root.slice(1).toLowerCase()) as Note;

  if (quality === '') {
    quality = 'maj';
  }

  // 様々な別名表記を正規化（入力時の多様な表記対応）
  const qualityNormalization: Record<string, ChordQuality> = {
    // オーギュメント系
    '+5': 'aug',
    'augmented': 'aug',
    '+': 'aug',
    '#5': 'aug',
    // マイナー系
    'min': 'm',
    'minor': 'm',
    'mi': 'm',
    '-': 'm',
    // マイナーセブンス系
    'min7': 'm7',
    'minor7': 'm7',
    'mi7': 'm7',
    '-7': 'm7',
    // メジャーセブンス系
    'M7': 'maj7',
    'major7': 'maj7',
    'Maj7': 'maj7',
    'MA7': 'maj7',
    'Ma7': 'maj7',
    '△7': 'maj7',
    'j7': 'maj7',
    // ディミニッシュ系
    'diminished': 'dim',
    'o': 'dim',
    '°': 'dim',
    'dim7': 'dim7',
    'diminished7': 'dim7',
    'o7': 'dim7',
    '°7': 'dim7',
    // 半減7度系
    'half-dim': 'm7b5',
    'ø': 'm7b5',
    'm7♭5': 'm7b5',
    'm7-5': 'm7b5',
    'ø7': 'm7b5',
    // サスペンデッド系
    'sus': 'sus4',
    'suspended4': 'sus4',
    'suspended2': 'sus2',
    // ドミナント系
    'dom7': '7',
    'dominant7': '7',
    // シックス系
    'sixth': '6',
    'add6': '6',
    // ナインス系
    'ninth': '9',
    'add2': 'add9'
  };

  if (qualityNormalization[quality]) {
    quality = qualityNormalization[quality]!;
  }

  const result: ParsedChord = { 
    root: root as Note, 
    quality: quality as ChordQuality
  };
  
  if (bassNote) {
    result.bassNote = bassNote;
  }
  
  return result;
}

function getNoteIndex(note: string): number {
  const index = notes.indexOf(note as Note);
  if (index !== -1) return index;

  for (const [sharp, flat] of Object.entries(enharmonicEquivalents)) {
    if (flat === note) return notes.indexOf(sharp as Note);
  }

  return -1;
}

function getChordNotes(root: Note, intervals: readonly number[]): Note[] {
  const rootIndex = getNoteIndex(root);
  if (rootIndex === -1) return [];

  return intervals.map(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    return notes[noteIndex]!;
  });
}

function getChordFromString(chordString: string): Chord {
  const { root, quality, bassNote } = parseChord(chordString);

  // ルート音の検証
  if (getNoteIndex(root) === -1) {
    throw new Error('Invalid root note');
  }

  // コードクオリティの検証
  if (!chordFormulas[quality]) {
    throw new Error('Invalid chord quality');
  }

  const intervals = chordFormulas[quality]!;
  const chordNotes = getChordNotes(root, intervals);

  // ベース音が指定されている場合の検証と追加
  if (bassNote) {
    if (getNoteIndex(bassNote) === -1) {
      throw new Error('Invalid bass note');
    }
    // ベース音がすでにコードに含まれていない場合のみ追加
    if (!chordNotes.includes(bassNote)) {
      chordNotes.unshift(bassNote);
    } else {
      // 含まれている場合は先頭に移動
      const index = chordNotes.indexOf(bassNote);
      chordNotes.splice(index, 1);
      chordNotes.unshift(bassNote);
    }
  }

  const result: Chord = {
    root,
    quality: quality || 'maj',
    notes: chordNotes,
    intervals: [...intervals]
  };
  
  if (bassNote) {
    result.bassNote = bassNote;
  }
  
  return result;
}

function findPossibleChords(selectedNotes: Note[], bassNote?: Note): ChordSuggestionResult {
  const possibleChords: ChordSuggestion[] = [];
  const noteSet = new Set(selectedNotes.map(n => n.toUpperCase()));

  for (const rootNote of selectedNotes) {
    const rootIndex = getNoteIndex(rootNote);

    for (const [quality, intervals] of Object.entries(chordFormulas)) {
      // 重複するコード表記をスキップ（推定結果では1つだけ表示）
      if (quality === 'maj' || quality === '+5' || quality === 'min' || quality === 'min7') continue;

      const chordNotes = getChordNotes(rootNote, intervals);
      const chordNoteSet = new Set(chordNotes);

      let isMatch = true;

      for (const note of chordNoteSet) {
        if (!noteSet.has(note)) {
          isMatch = false;
          break;
        }
      }

      if (isMatch) {
        const displayQuality = quality === '' ? '' : quality;
        let chordName = rootNote + displayQuality;
        let finalNotes = [...chordNotes];
        let isExactMatch = false;

        // ベース音が指定されていて、ルート音と異なる場合はオンコード
        if (bassNote && bassNote !== rootNote) {
          chordName += '/' + bassNote;
          // ベース音を先頭に追加
          if (!finalNotes.includes(bassNote)) {
            finalNotes.unshift(bassNote);
          } else {
            // 含まれている場合は先頭に移動
            const index = finalNotes.indexOf(bassNote);
            finalNotes.splice(index, 1);
            finalNotes.unshift(bassNote);
          }

          // オンコードの場合、finalNotesと選択された音が完全一致するかチェック
          const finalNoteSet = new Set(finalNotes);
          isExactMatch = noteSet.size === finalNoteSet.size && 
                        [...noteSet].every(note => finalNoteSet.has(note as Note));
        } else {
          // 通常のコードの場合
          let extraNotes = 0;
          const extraNotesList: string[] = [];
          for (const note of noteSet) {
            if (!chordNoteSet.has(note as Note)) {
              extraNotes++;
              extraNotesList.push(note);
            }
          }

          // 余分な音が1つだけで、それが選択された音に含まれている場合、
          // オンコードとして完全一致を検討
          if (extraNotes === 1 && extraNotesList.length === 1) {
            const potentialBass = extraNotesList[0]! as Note;
            if (selectedNotes.includes(potentialBass)) {
              // オンコードとして扱う
              chordName += '/' + potentialBass;
              finalNotes.unshift(potentialBass);
              isExactMatch = true;
            } else {
              isExactMatch = false;
            }
          } else {
            isExactMatch = extraNotes === 0;
          }
        }

        // シンプルさのスコア計算（低いほどシンプル）
        let simplicityScore = 0;

        // オンコードは複雑度+10
        if (chordName.includes('/')) {
          simplicityScore += 10;
        }

        // 基本トライアド（3音）以外は構成音数に応じて複雑度追加
        if (finalNotes.length > 3) {
          simplicityScore += (finalNotes.length - 3) * 2;
        }

        // 拡張コード（7、9、11、13など）は複雑度追加
        if (quality.includes('7') || quality.includes('9') || quality.includes('11') || quality.includes('13')) {
          simplicityScore += 3;
        }

        // add系コードは複雑度追加
        if (quality.includes('add')) {
          simplicityScore += 2;
        }

        // omit系コードは複雑度追加
        if (quality.includes('omit')) {
          simplicityScore += 1;
        }

        const matchScore = finalNotes.length - (noteSet.size - finalNotes.length);

        const chordSuggestion: ChordSuggestion = {
          name: chordName,
          root: rootNote,
          quality: (quality as ChordQuality) || 'maj',
          notes: finalNotes,
          matchScore: matchScore,
          exactMatch: isExactMatch,
          simplicityScore: simplicityScore
        };
        
        if (bassNote) {
          chordSuggestion.bassNote = bassNote;
        }
        
        possibleChords.push(chordSuggestion);
      }
    }
  }

  possibleChords.sort((a, b) => {
    // 1. 完全一致を優先
    if (a.exactMatch && !b.exactMatch) return -1;
    if (!a.exactMatch && b.exactMatch) return 1;

    // 2. 同じマッチタイプの場合、シンプルさで優先（低いスコアが優先）
    if (a.simplicityScore !== b.simplicityScore) {
      return a.simplicityScore - b.simplicityScore;
    }

    // 3. 同じシンプルさなら、マッチスコアで優先
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;

    // 4. 最後に構成音数で優先（少ない方が優先）
    return a.notes.length - b.notes.length;
  });

  const uniqueChords: ChordSuggestion[] = [];
  const seen = new Set<string>();

  for (const chord of possibleChords) {
    const key = chord.name + chord.notes.join(',');
    if (!seen.has(key)) {
      seen.add(key);
      uniqueChords.push(chord);
    }
  }

  // 完全一致と部分一致を分ける
  const exactMatches = uniqueChords.filter(c => c.exactMatch);
  const partialMatches = uniqueChords.filter(c => !c.exactMatch);

  return {
    exact: exactMatches.slice(0, 5),
    partial: partialMatches.slice(0, 3)
  };
}

function getMidiNote(note: Note, octave: number = 4): number | null {
  const baseMidi = noteToMidi[note];
  if (baseMidi === undefined) return null;
  return baseMidi + (octave - 4) * 12;
}

function getFrequency(midiNote: number): number {
  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

function convertToNotation(notesArray: Note[], useFlats: boolean = false): Note[] {
  if (!useFlats) return notesArray;

  return notesArray.map(note => {
    return (enharmonicEquivalents[note] || note) as Note;
  });
}

function normalizeNote(note: Note): Note {
  // フラット記号の音をシャープに正規化
  return (reverseEnharmonic[note] || note) as Note;
}

export const MusicTheory: MusicTheoryInterface = {
  notes,
  flatNotes,
  parseChord,
  getChordFromString,
  findPossibleChords,
  getMidiNote,
  getFrequency,
  convertToNotation,
  normalizeNote,
  enharmonicEquivalents,
  reverseEnharmonic
};