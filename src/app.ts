import type { Note, Chord, ChordSuggestion, ChordSuggestionResult, WaveType } from './types.js';
import { MusicTheory } from './music-theory.js';
import { AudioPlayer } from './audio-player.js';

document.addEventListener('DOMContentLoaded', () => {
  const chordInput = document.getElementById('chord-input') as HTMLInputElement;
  const playChordBtn = document.getElementById('play-chord') as HTMLButtonElement;
  const chordResult = document.getElementById('chord-result') as HTMLDivElement;
  
  const noteButtons = document.querySelectorAll('.note-button') as NodeListOf<HTMLButtonElement>;
  const clearNotesBtn = document.getElementById('clear-notes') as HTMLButtonElement;
  const playNotesBtn = document.getElementById('play-notes') as HTMLButtonElement;
  const chordSuggestion = document.getElementById('chord-suggestion') as HTMLDivElement;
  const bassNoteSelect = document.getElementById('bass-note-select') as HTMLSelectElement;
  const notationRadios = document.querySelectorAll('input[name="notation"]') as NodeListOf<HTMLInputElement>;
  const timbreSelect = document.getElementById('timbre-select') as HTMLSelectElement;
  
  let selectedNotes: Note[] = [];
  let currentChordNotes: Note[] = [];
  let currentChord: Chord | null = null;
  let useFlats: boolean = false;
  
  function convertChordNameToFlat(chordName: string): string {
    let result = chordName;
    for (const [sharp, flat] of Object.entries(MusicTheory.enharmonicEquivalents)) {
      result = result.replace(new RegExp(sharp, 'g'), flat);
    }
    return result;
  }
  
  function updateNoteButtons(): void {
    const noteButtons = document.querySelectorAll('.note-button') as NodeListOf<HTMLButtonElement>;
    noteButtons.forEach(button => {
      if (button.classList.contains('sharp-note')) {
        if (useFlats) {
          button.textContent = button.dataset.flat || '';
          button.dataset.currentNote = button.dataset.flat;
        } else {
          button.textContent = button.dataset.note || '';
          button.dataset.currentNote = button.dataset.note;
        }
      } else {
        button.dataset.currentNote = button.dataset.note;
      }
    });
  }
  
  function displayChordAnalysis(chord: Chord): void {
    const { root, quality, notes, bassNote } = chord;
    
    // 表記法に応じて音名を変換
    const displayNotes = MusicTheory.convertToNotation(notes, useFlats);
    const displayRoot = useFlats ? (MusicTheory.enharmonicEquivalents[root] || root) : root;
    const displayBass = bassNote ? (useFlats ? (MusicTheory.enharmonicEquivalents[bassNote] || bassNote) : bassNote) : null;
    
    let chordName = displayRoot + (quality === 'maj' ? '' : quality);
    
    // オンコードの場合、ベース音を表示
    if (displayBass) {
      chordName += '/' + displayBass;
    }
    
    let html = `
      <h3 style="color: #4CAF50; margin-bottom: 1rem;">${chordName}</h3>
      <div class="chord-notes">
        ${displayNotes.map((note, index) => {
          // ベース音を強調表示
          const isBass = displayBass && index === 0 && note === displayBass;
          return `<span class="note-badge${isBass ? ' bass-note' : ''}">${note}${isBass ? ' (bass)' : ''}</span>`;
        }).join('')}
      </div>
      <div class="chord-info">
        <p>ルート音: ${displayRoot}</p>
        <p>コードタイプ: ${quality}</p>
        ${displayBass ? `<p>ベース音: ${displayBass}</p>` : ''}
        <p>構成音: ${displayNotes.join(' - ')}</p>
      </div>
    `;
    
    chordResult.innerHTML = html;
    currentChordNotes = notes;
    currentChord = chord;
  }
  
  function displayChordSuggestions(chordResults: ChordSuggestionResult): void {
    const { exact, partial } = chordResults;
    
    if (exact.length === 0 && partial.length === 0) {
      chordSuggestion.innerHTML = '<p style="color: #888;">該当するコードが見つかりませんでした</p>';
      return;
    }
    
    let html = '<div class="possible-chords">';
    
    // 完全一致のコード
    if (exact.length > 0) {
      html += '<h4 style="color: #4CAF50; margin-bottom: 0.5rem;">完全一致</h4>';
      exact.forEach(chord => {
        const displayName = useFlats ? convertChordNameToFlat(chord.name) : chord.name;
        const displayNotes = MusicTheory.convertToNotation(chord.notes, useFlats);
        html += `
          <div class="chord-option exact-match" data-chord='${JSON.stringify(chord)}'>
            <div class="chord-name">${displayName}</div>
            <div class="chord-notes-list">構成音: ${displayNotes.join(', ')}</div>
          </div>
        `;
      });
    }
    
    // 部分一致のコード
    if (partial.length > 0) {
      html += '<h4 style="color: #888; margin-top: 1rem; margin-bottom: 0.5rem;">部分一致（一部の音を使用）</h4>';
      partial.forEach(chord => {
        const displayName = useFlats ? convertChordNameToFlat(chord.name) : chord.name;
        const displayNotes = MusicTheory.convertToNotation(chord.notes, useFlats);
        html += `
          <div class="chord-option partial-match" data-chord='${JSON.stringify(chord)}'>
            <div class="chord-name">${displayName}</div>
            <div class="chord-notes-list">構成音: ${displayNotes.join(', ')}</div>
          </div>
        `;
      });
    }
    
    html += '</div>';
    
    chordSuggestion.innerHTML = html;
    
    document.querySelectorAll('.chord-option').forEach(option => {
      (option as HTMLElement).addEventListener('click', function() {
        const chord: ChordSuggestion = JSON.parse((this as HTMLElement).dataset.chord!);
        AudioPlayer.playChord(chord.notes, 4, 2, chord.bassNote);
      });
    });
  }
  
  function updateSelectedNotesDisplay(): void {
    if (selectedNotes.length === 0) {
      chordSuggestion.innerHTML = '';
    } else {
      // 2つ以上の音が選択されたら自動的にコード推定
      if (selectedNotes.length >= 2) {
        findAndDisplayChords();
      } else {
        chordSuggestion.innerHTML = '<p style="color: #888;">2つ以上の音を選択するとコードを推定します</p>';
      }
    }
    updateBassNoteOptions();
  }
  
  function updateBassNoteOptions(): void {
    const currentValue = bassNoteSelect.value;
    bassNoteSelect.innerHTML = '<option value="">なし</option>';
    selectedNotes.forEach(note => {
      const option = document.createElement('option');
      option.value = note;
      const displayNote = useFlats ? (MusicTheory.enharmonicEquivalents[note] || note) : note;
      option.textContent = displayNote;
      bassNoteSelect.appendChild(option);
    });
    // 以前の選択を維持（可能な場合）
    if (currentValue && selectedNotes.includes(currentValue as Note)) {
      bassNoteSelect.value = currentValue;
    }
  }
  
  function analyzeChordInput(): void {
    const chordString = chordInput.value.trim();
    if (!chordString) {
      chordResult.innerHTML = '<p style="color: #888;">コードを入力すると構成音が表示されます</p>';
      currentChord = null;
      currentChordNotes = [];
      return;
    }
    
    try {
      const chord = MusicTheory.getChordFromString(chordString);
      displayChordAnalysis(chord);
    } catch (error) {
      // 無効なコードの場合は何も表示しない（前の結果を残す）
      // ただし、currentChordはクリアする
      currentChord = null;
      currentChordNotes = [];
    }
  }
  
  playChordBtn.addEventListener('click', () => {
    if (currentChord && currentChordNotes.length > 0) {
      AudioPlayer.playChord(currentChordNotes, 4, 2, currentChord.bassNote);
    } else {
      const chordString = chordInput.value.trim();
      if (chordString) {
        try {
          const chord = MusicTheory.getChordFromString(chordString);
          AudioPlayer.playChord(chord.notes, 4, 2, chord.bassNote);
        } catch (error) {
          console.error('コードの再生に失敗しました');
        }
      }
    }
  });
  
  noteButtons.forEach(button => {
    button.addEventListener('click', function() {
      const note = this.dataset.currentNote || this.dataset.note || '';
      const normalizedNote = MusicTheory.normalizeNote(note as Note);
      
      if (this.classList.contains('selected')) {
        this.classList.remove('selected');
        selectedNotes = selectedNotes.filter(n => MusicTheory.normalizeNote(n) !== normalizedNote);
      } else {
        this.classList.add('selected');
        selectedNotes.push(normalizedNote);
      }
      
      updateSelectedNotesDisplay();
    });
  });
  
  clearNotesBtn.addEventListener('click', () => {
    selectedNotes = [];
    noteButtons.forEach(btn => btn.classList.remove('selected'));
    updateSelectedNotesDisplay();
    chordSuggestion.innerHTML = '';
    bassNoteSelect.value = '';
  });
  
  function findAndDisplayChords(): void {
    const selectedBassNote = bassNoteSelect.value || undefined;
    const possibleChords = MusicTheory.findPossibleChords(selectedNotes, selectedBassNote as Note | undefined);
    displayChordSuggestions(possibleChords);
  }
  
  playNotesBtn.addEventListener('click', () => {
    if (selectedNotes.length > 0) {
      // アルペジオの代わりに同時再生
      AudioPlayer.playChord(selectedNotes);
    }
  });
  
  // コード入力の自動解析
  chordInput.addEventListener('input', analyzeChordInput);
  chordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      // Enterキーで再生
      playChordBtn.click();
    }
  });
  
  // ベース音選択が変更されたときも自動的にコード推定
  bassNoteSelect.addEventListener('change', () => {
    if (selectedNotes.length >= 2) {
      findAndDisplayChords();
    }
  });
  
  // 表記法変更のイベントリスナー
  notationRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      useFlats = this.value === 'flat';
      updateNoteButtons();
      
      // 現在の解析結果を更新
      if (currentChord) {
        displayChordAnalysis(currentChord);
      }
      
      // 現在の推定結果を更新
      if (selectedNotes.length >= 2) {
        findAndDisplayChords();
      }
    });
  });
  
  // 音色変更のイベントリスナー
  timbreSelect.addEventListener('change', function() {
    AudioPlayer.setTimbre(this.value as WaveType);
  });
  
  // 初期表示
  analyzeChordInput();
  updateNoteButtons();
  updateSelectedNotesDisplay();
});