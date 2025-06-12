import type {
  Note,
  ChordQuality,
  Chord,
  ParsedChord,
  ChordSuggestion,
  ChordSuggestionResult,
  MusicTheoryInterface,
} from './types.js';

const notes: readonly Note[] = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const;
const flatNotes: readonly Note[] = [
  'C',
  'Db',
  'D',
  'Eb',
  'Ebb',
  'E',
  'F',
  'Gb',
  'G',
  'Ab',
  'Abb',
  'A',
  'Bb',
  'Bbb',
  'B',
] as const;

const enharmonicEquivalents: Record<string, string> = {
  'C#': 'Db',
  'D#': 'Eb',
  'F#': 'Gb',
  'G#': 'Ab',
  'A#': 'Bb',
  // フラット対応
  Cb: 'B',
  Fb: 'E',
  // トリプルフラット対応
  Ebb: 'D',
  Abb: 'G',
  Bbb: 'A',
} as const;

const reverseEnharmonic: Record<string, string> = {
  Db: 'C#',
  Eb: 'D#',
  Gb: 'F#',
  Ab: 'G#',
  Bb: 'A#',
  // トリプルフラット対応（Ebb -> D, Abb -> G, Bbb -> A）
  Ebb: 'D',
  Abb: 'G', 
  Bbb: 'A',
} as const;

const noteToMidi: Record<string, number> = {
  C: 60,
  'C#': 61,
  Db: 61,
  D: 62,
  'D#': 63,
  Eb: 63,
  Ebb: 62, // Ebb = D
  E: 64,
  Fb: 64, // Fb = E
  F: 65,
  'F#': 66,
  Gb: 66,
  G: 67,
  'G#': 68,
  Ab: 68,
  Abb: 67, // Abb = G
  A: 69,
  'A#': 70,
  Bb: 70,
  Bbb: 69, // Bbb = A
  B: 71,
  Cb: 71, // Cb = B
} as const;

const chordFormulas: Record<ChordQuality, readonly number[]> = {
  '': [0, 4, 7], // メジャーコード（デフォルト）
  maj: [0, 4, 7], // parseChord関数での処理用に残す
  m: [0, 3, 7],
  min: [0, 3, 7],
  '7': [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
  min7: [0, 3, 7, 10],
  dim: [0, 3, 6],
  dim7: [0, 3, 6, 9],
  m7b5: [0, 3, 6, 10], // 半減7度コード
  aug: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  '6': [0, 4, 7, 9],
  m6: [0, 3, 7, 9],
  '9': [0, 4, 7, 10, 14],
  maj9: [0, 4, 7, 11, 14],
  m9: [0, 3, 7, 10, 14],
  add9: [0, 4, 7, 14],
  add11: [0, 4, 7, 17],
  'add#11': [0, 4, 7, 8], // C, E, G, G# (シャープ11度は8半音)
  add13: [0, 4, 7, 21],
  'add#13': [0, 4, 7, 22],
  '+5': [0, 4, 8], // augmentedと同じ（入力用のみ）
  'maj7+5': [0, 4, 8, 11],
  '7+5': [0, 4, 8, 10],
  m11: [0, 3, 7, 10, 14, 17],
  '13': [0, 4, 7, 10, 14, 21],
  m13: [0, 3, 7, 10, 14, 21],
  // 省略系コード
  omit5: [0, 4], // 5度省略メジャー
  'm(omit5)': [0, 3], // 5度省略マイナー
  '7omit5': [0, 4, 10], // 5度省略セブンス
  maj7omit5: [0, 4, 11], // 5度省略メジャーセブンス
  m7omit5: [0, 3, 10], // 5度省略マイナーセブンス
  omit3: [0, 7], // 3度省略（パワーコード）
  'maj7(omit3)': [0, 7, 11], // メジャー7th 3度なし
  '5': [0, 7], // パワーコード
  '7omit3': [0, 7, 10], // 3度省略セブンス
  sus2omit5: [0, 2], // 5度省略sus2
  sus4omit5: [0, 5], // 5度省略sus4
  '7sus4omit5': [0, 5, 10], // 5度省略7sus4
  '9omit5': [0, 4, 10, 14], // 5度省略9th
  m9omit5: [0, 3, 10, 14], // 5度省略m9
  // 新規追加されたコード
  '7b9': [0, 4, 7, 10, 13], // ドミナント7thフラット9th
  'm7(11)': [0, 3, 7, 10, 17], // マイナー7th with 11th
  mM7: [0, 3, 7, 11], // マイナーメジャー7th
  '9sus4': [0, 5, 7, 10, 14], // 9th suspended 4th
  '7sus4': [0, 5, 7, 10], // ドミナント7th suspended 4th
  // 更に追加されたコード（2番目の楽譜から）
  '7(13)': [0, 4, 7, 10, 21], // ドミナント7th with 13th
  '7#9': [0, 4, 7, 10, 15], // ドミナント7th シャープ9th
  'm7(9)': [0, 3, 7, 10, 14], // マイナー7th with 9th
  'maj7(9)': [0, 4, 7, 11, 14], // メジャー7th with 9th
  '9b5': [0, 4, 6, 10, 14], // 9th フラット5th
  'maj7(9,13)': [0, 4, 7, 11, 14, 21], // メジャー7th with 9th and 13th
  '7(9,13)': [0, 4, 7, 10, 14, 21], // ドミナント7th with 9th and 13th
  'maj7(13)': [0, 4, 7, 11, 21], // メジャー7th with 13th
  '7b5': [0, 4, 6, 10], // ドミナント7th フラット5th
  '7(9)': [0, 4, 7, 10, 14], // ドミナント7th with 9th
  '7(b9,b13)': [0, 4, 7, 10, 13, 20], // ドミナント7th フラット9th and フラット13th
  'aug7(b9)': [0, 4, 8, 10, 13], // オーギュメント7th フラット9th
  'aug9(#11)': [0, 4, 8, 10, 14, 18], // オーギュメント9th シャープ11th
  // 3番目の楽譜からの追加
  'm7b5(11)': [0, 3, 6, 10, 17], // マイナー7thフラット5th with 11th
  'm7(9,11)': [0, 3, 7, 10, 14, 17], // マイナー7th with 9th and 11th
  'aug7#9': [0, 4, 8, 10, 15], // オーギュメント7th シャープ9th
  // 追加の一般的なコード表記
  '(9)': [0, 4, 7, 10, 14], // テンション9thのみ（ドミナント7+9と同じ）
  '(11)': [0, 4, 7, 10, 17], // テンション11thのみ
  '(13)': [0, 4, 7, 10, 21], // テンション13thのみ
  'add2': [0, 2, 4, 7], // 2度追加（add9と似ているが1オクターブ下）
  'add4': [0, 4, 5, 7], // 4度追加
  'add6': [0, 4, 7, 9], // 6度追加（6thコードと同じ）
  '7alt': [0, 4, 6, 10, 13, 15], // オルタードドミナント（b5, #5, b9, #9含む）
  '7(b5,#9)': [0, 4, 6, 10, 15], // ドミナント7th フラット5th シャープ9th
  '7(#5,b9)': [0, 4, 8, 10, 13], // ドミナント7th シャープ5th フラット9th
  '7(#9,#11)': [0, 4, 7, 10, 15, 18], // ドミナント7th シャープ9th シャープ11th
  '7(b9,#11)': [0, 4, 7, 10, 13, 18], // ドミナント7th フラット9th シャープ11th
  '6/9': [0, 4, 7, 9, 14], // 6th with 9th
  'maj6/9': [0, 4, 7, 9, 14], // メジャー6th with 9th（6/9と同じ）
  'sus': [0, 5, 7], // サスペンデッド（sus4と同じ）
} as const;

function parseChord(chordString: string): ParsedChord {
  chordString = chordString.trim();
  let root = '';
  let quality = '';
  let bassNote: Note | undefined = undefined;

  // 特殊なケース: 6/9コードの処理（スラッシュコードではない）
  if (chordString.includes('6/9') || chordString.includes('maj6/9')) {
    // 6/9は特殊なコード表記で、スラッシュコードではない
  } else {
    // オンコード（スラッシュコード）の処理
    const slashIndex = chordString.indexOf('/');
    if (slashIndex !== -1) {
      const bassNoteString = chordString.substring(slashIndex + 1).trim();
      bassNote = (bassNoteString.charAt(0).toUpperCase() +
        bassNoteString.slice(1).toLowerCase()) as Note;
      chordString = chordString.substring(0, slashIndex).trim();
    }
  }

  // トリプルフラット対応: Ebb, Abb, Bbb
  if (chordString.length >= 3 && chordString.substring(1, 3) === 'bb') {
    root = chordString.substring(0, 3);
    quality = chordString.substring(3);
  } else if (chordString.length >= 2 && (chordString[1] === '#' || chordString[1] === 'b')) {
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
    augmented: 'aug',
    '+': 'aug',
    '#5': 'aug',
    // マイナー系
    min: 'm',
    minor: 'm',
    mi: 'm',
    '-': 'm',
    // マイナーセブンス系
    min7: 'm7',
    minor7: 'm7',
    mi7: 'm7',
    '-7': 'm7',
    // メジャーセブンス系
    M7: 'maj7',
    major7: 'maj7',
    Maj7: 'maj7',
    MA7: 'maj7',
    Ma7: 'maj7',
    '△7': 'maj7',
    j7: 'maj7',
    M9: 'maj9', // 楽譜表記対応
    'M7(9)': 'maj7(9)', // EbM7(9)の表記対応
    // マイナーメジャーセブンス系
    mM7: 'mM7',
    minmaj7: 'mM7',
    mmaj7: 'mM7',
    mMA7: 'mM7',
    // ディミニッシュ系
    diminished: 'dim',
    o: 'dim',
    '°': 'dim',
    dim7: 'dim7',
    diminished7: 'dim7',
    o7: 'dim7',
    '°7': 'dim7',
    // 半減7度系
    'half-dim': 'm7b5',
    ø: 'm7b5',
    'm7♭5': 'm7b5',
    'm7-5': 'm7b5',
    ø7: 'm7b5',
    // サスペンデッド系
    sus: 'sus4',
    suspended4: 'sus4',
    suspended2: 'sus2',
    // ドミナント系
    dom7: '7',
    dominant7: '7',
    '(b9)': '7b9', // 楽譜表記対応
    '7(b9)': '7b9',
    '(13)': '7(13)', // 楽譜表記対応
    '7(13)': '7(13)',
    '(#9)': '7#9', // 楽譜表記対応
    '7(#9)': '7#9',
    '(9)': '(9)', // テンション9th独立表記
    '7(9)': '7(9)',
    '(b9,b13)': '7(b9,b13)', // 楽譜表記対応
    '7(b9,b13)': '7(b9,b13)',
    '(9,13)': '7(9,13)', // 楽譜表記対応
    '7(9,13)': '7(9,13)',
    '-5': '7b5', // 楽譜表記対応
    '7-5': '7b5',
    'b5': '7b5',
    '7b5': '7b5',
    // 11thコード系
    '(11)': '(11)', // テンション11th（独立した表記）
    '-5(11)': 'm7b5(11)', // 楽譜表記対応
    'm7-5(11)': 'm7b5(11)',
    '(9,11)': 'm7(9,11)', // 楽譜表記対応
    'm7(9,11)': 'm7(9,11)',
    // オーギュメント系拡張
    'aug7(b9)': 'aug7(b9)',
    'aug9(#11)': 'aug9(#11)',
    'aug7(#9)': 'aug7#9', // 楽譜表記対応
    'aug7#9': 'aug7#9',
    'augM7': 'maj7+5', // オーギュメントメジャー7th
    'bbaug': 'aug', // ダブルフラット+オーギュメント（Bbbaug）
    'bbaugM7': 'maj7+5', // ダブルフラット+オーギュメントメジャー7th（BbbaugM7）
    'baug': 'aug', // フラット+オーギュメント（通常の処理）
    'baugM7': 'maj7+5', // フラット+オーギュメントメジャー7th
    // シックス系
    sixth: '6',
    // ナインス系
    ninth: '9',
    '9sus4': '9sus4',
    'C9sus4': '9sus4',
    '(b5)': '9b5', // 楽譜表記対応
    '9(b5)': '9b5',
    // sus4系
    '7sus4': '7sus4',
    // 追加の正規化マッピング
    '△': 'maj7', // トライアングル記号
    'no3': 'omit3', // no3をomit3に正規化
    'no5': 'omit5', // no5をomit5に正規化
    'omit3': 'omit3',
    'omit5': 'omit5',
    'add2': 'add2',
    'add4': 'add4',
    'add6': 'add6',
    '6add9': '6/9', // 6add9を6/9に正規化
    '69': '6/9', // 69を6/9に正規化
    'maj69': 'maj6/9', // maj69をmaj6/9に正規化
    'M69': 'maj6/9', // M69をmaj6/9に正規化
    'alt': '7alt', // altを7altに正規化
    '7altered': '7alt', // 7alteredを7altに正規化
    'altered': '7alt', // alteredを7altに正規化
    '(b5,#9)': '7(b5,#9)', // 楽譜表記対応
    '7(b5,#9)': '7(b5,#9)',
    '(#5,b9)': '7(#5,b9)', // 楽譜表記対応
    '7(#5,b9)': '7(#5,b9)',
    '(#9,#11)': '7(#9,#11)', // 楽譜表記対応
    '7(#9,#11)': '7(#9,#11)',
    '(b9,#11)': '7(b9,#11)', // 楽譜表記対応
    '7(b9,#11)': '7(b9,#11)',
    'suspended': 'sus4' // suspendedをsus4に正規化
  };

  if (qualityNormalization[quality]) {
    quality = qualityNormalization[quality]!;
  }

  const result: ParsedChord = {
    root: root as Note,
    quality: quality as ChordQuality,
  };

  if (bassNote) {
    result.bassNote = bassNote;
  }

  return result;
}

function getNoteIndex(note: string): number {
  const index = notes.indexOf(note as Note);
  if (index !== -1) return index;

  // 通常のenharmonic検索
  for (const [sharp, flat] of Object.entries(enharmonicEquivalents)) {
    if (flat === note) return notes.indexOf(sharp as Note);
  }

  // トリプルフラットの検索（Ebb->D, Abb->G, Bbb->A）
  for (const [tripleFlat, natural] of Object.entries(enharmonicEquivalents)) {
    if (tripleFlat === note) return notes.indexOf(natural as Note);
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
    intervals: [...intervals],
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
      if (quality === 'maj' || quality === '+5' || quality === 'min' || quality === 'min7' || 
          quality === 'no3' || quality === 'no5' || quality === 'maj7(no3)' || quality === 'sus' ||
          quality === '5')
        continue;

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
        const finalNotes = [...chordNotes];
        let isExactMatch = false;

        // ベース音処理と完全一致判定
        if (bassNote) {
          // ベース音が指定されている場合
          if (bassNote !== rootNote) {
            // オンコード（ベース音がルート音と異なる）
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
          }

          // ベース音が指定されている場合の完全一致判定
          const finalNoteSet = new Set(finalNotes);
          isExactMatch =
            noteSet.size === finalNoteSet.size &&
            [...noteSet].every(note => finalNoteSet.has(note as Note)) &&
            finalNotes.includes(bassNote); // ベース音が必ず含まれている必要がある
        } else {
          // ベース音が指定されていない場合の通常処理
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

        // ベース音が指定されている場合の処理
        if (bassNote) {
          if (bassNote === rootNote) {
            // ベース音がルート音と同じ場合は優先度を上げる（複雑度を下げる）
            simplicityScore -= 5;
          } else {
            // オンコードは複雑度+10
            simplicityScore += 10;
          }
        } else if (chordName.includes('/')) {
          // ベース音が指定されていないが、推定でオンコードになった場合
          simplicityScore += 10;
        }

        // 基本トライアド（3音）以外は構成音数に応じて複雑度追加
        if (finalNotes.length > 3) {
          simplicityScore += (finalNotes.length - 3) * 2;
        }

        // 拡張コード（7、9、11、13など）は複雑度追加
        if (
          quality.includes('7') ||
          quality.includes('9') ||
          quality.includes('11') ||
          quality.includes('13')
        ) {
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
          simplicityScore: simplicityScore,
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
    partial: partialMatches.slice(0, 3),
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
  flatNotes: ['C', 'Db', 'D', 'Eb', 'Ebb', 'E', 'F', 'Gb', 'G', 'Ab', 'Abb', 'A', 'Bb', 'Bbb', 'B'],
  parseChord,
  getChordFromString,
  findPossibleChords,
  getMidiNote,
  getFrequency,
  convertToNotation,
  normalizeNote,
  enharmonicEquivalents,
  reverseEnharmonic,
};
