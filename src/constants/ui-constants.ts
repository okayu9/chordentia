// UI constants
export const SELECTORS = {
  CHORD_INPUT: '#chord-input',
  PLAY_CHORD_BTN: '#play-chord',
  CHORD_RESULT: '#chord-result',
  NOTE_BUTTONS: '.note-button',
  CLEAR_NOTES_BTN: '#clear-notes',
  PLAY_NOTES_BTN: '#play-notes',
  CHORD_SUGGESTION: '#chord-suggestion',
  BASS_NOTE_SELECT: '#bass-note-select',
  NOTATION_RADIOS: 'input[name="notation"]',
  TIMBRE_SELECT: '#timbre-select',
} as const;

export const CSS_CLASSES = {
  SELECTED: 'selected',
  SHARP_NOTE: 'sharp-note',
  NOTE_BADGE: 'note-badge',
  BASS_NOTE: 'bass-note',
  CHORD_NOTES: 'chord-notes',
  CHORD_INFO: 'chord-info',
  EXACT_MATCH: 'exact-match',
  PARTIAL_MATCH: 'partial-match',
} as const;

export const HTML_ATTRIBUTES = {
  CURRENT_NOTE: 'currentNote',
  NOTE: 'note',
  FLAT: 'flat',
} as const;

export const MESSAGES = {
  EMPTY_CHORD_INPUT: '<p style="color: #888;">コードを入力すると構成音が表示されます</p>',
  NO_CHORDS_FOUND: '<p style="color: #888;">該当するコードが見つかりませんでした</p>',
  SELECT_MORE_NOTES: '<p style="color: #888;">2つ以上の音を選択するとコードを推定します</p>',
  BASS_LABEL: ' (bass)',
  ROOT_LABEL: 'ルート音: ',
  CHORD_TYPE_LABEL: 'コードタイプ: ',
  BASS_NOTE_LABEL: 'ベース音: ',
  NOTES_LABEL: '構成音: ',
  EXACT_MATCHES_TITLE: '完全一致',
  PARTIAL_MATCHES_TITLE: '部分一致',
  BASS_NONE_OPTION: 'なし',
} as const;

export const COLORS = {
  PRIMARY: '#4CAF50',
  ERROR: '#f44336',
  MUTED: '#888',
} as const;
