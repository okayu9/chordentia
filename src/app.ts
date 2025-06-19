import type { Note, Chord, ChordSuggestionResult } from './types.js';
import { MusicTheory } from './music-theory.js';
import { AudioPlayer } from './audio-player.js';
import { MIN_NOTES_FOR_CHORD_SUGGESTION, DEFAULT_OCTAVE, DEFAULT_DURATION } from './constants/music-constants.js';
import { SELECTORS, CSS_CLASSES, HTML_ATTRIBUTES, MESSAGES, COLORS } from './constants/ui-constants.js';
import {
  getElementById,
  querySelectorAll,
  createOption,
  clearElement,
  setHTML,
  addClass,
  removeClass,
  toggleClass,
  hasClass,
  animateNotePress,
  animateChordPlay,
  animateButtonPress,
  triggerPlayingAnimation,
} from './utils/dom-utils.js';

interface AppState {
  selectedNotes: Note[];
  currentChord: Chord | null;
  currentChordNotes: Note[];
  useFlats: boolean;
}

class ChordentiaApp {
  private state: AppState = {
    selectedNotes: [],
    currentChord: null,
    currentChordNotes: [],
    useFlats: false,
  };

  private elements: {
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
  };

  constructor() {
    this.elements = this.initializeElements();
    this.initializeEventListeners();
    this.initializeUI();
  }

  private initializeElements() {
    return {
      chordInput: getElementById<HTMLInputElement>(SELECTORS.CHORD_INPUT.slice(1)),
      playChordBtn: getElementById<HTMLButtonElement>(SELECTORS.PLAY_CHORD_BTN.slice(1)),
      chordResult: getElementById<HTMLDivElement>(SELECTORS.CHORD_RESULT.slice(1)),
      noteButtons: querySelectorAll<HTMLButtonElement>(SELECTORS.NOTE_BUTTONS),
      clearNotesBtn: getElementById<HTMLButtonElement>(SELECTORS.CLEAR_NOTES_BTN.slice(1)),
      playNotesBtn: getElementById<HTMLButtonElement>(SELECTORS.PLAY_NOTES_BTN.slice(1)),
      chordSuggestion: getElementById<HTMLDivElement>(SELECTORS.CHORD_SUGGESTION.slice(1)),
      bassNoteSelect: getElementById<HTMLSelectElement>(SELECTORS.BASS_NOTE_SELECT.slice(1)),
      notationRadios: querySelectorAll<HTMLInputElement>(SELECTORS.NOTATION_RADIOS),
      timbreSelect: getElementById<HTMLSelectElement>(SELECTORS.TIMBRE_SELECT.slice(1)),
    };
  }

  private initializeEventListeners(): void {
    // Chord input events
    this.elements.chordInput.addEventListener('input', () => this.analyzeChordInput());
    this.elements.chordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.elements.playChordBtn.click();
      }
    });

    // Play chord button
    this.elements.playChordBtn.addEventListener('click', () => this.playCurrentChord());

    // Note buttons
    this.elements.noteButtons.forEach((button) => {
      button.addEventListener('click', () => this.handleNoteButtonClick(button));
    });

    // Control buttons
    this.elements.clearNotesBtn.addEventListener('click', () => this.clearSelectedNotes());
    this.elements.playNotesBtn.addEventListener('click', () => this.playSelectedNotes());

    // Bass note selection
    this.elements.bassNoteSelect.addEventListener('change', () => this.handleBassNoteChange());

    // Notation system change
    this.elements.notationRadios.forEach((radio) => {
      radio.addEventListener('change', () => this.handleNotationChange(radio));
    });

    // Timbre selection
    this.elements.timbreSelect.addEventListener('change', () => this.handleTimbreChange());
  }

  private initializeUI(): void {
    this.updateNoteButtons();
    setHTML(this.elements.chordResult, MESSAGES.EMPTY_CHORD_INPUT);
  }

  private updateNoteButtons(): void {
    this.elements.noteButtons.forEach((button) => {
      if (hasClass(button, CSS_CLASSES.SHARP_NOTE)) {
        if (this.state.useFlats) {
          button.textContent = button.dataset[HTML_ATTRIBUTES.FLAT] || '';
          button.dataset[HTML_ATTRIBUTES.CURRENT_NOTE] = button.dataset[HTML_ATTRIBUTES.FLAT];
        } else {
          button.textContent = button.dataset[HTML_ATTRIBUTES.NOTE] || '';
          button.dataset[HTML_ATTRIBUTES.CURRENT_NOTE] = button.dataset[HTML_ATTRIBUTES.NOTE];
        }
      } else {
        button.dataset[HTML_ATTRIBUTES.CURRENT_NOTE] = button.dataset[HTML_ATTRIBUTES.NOTE];
      }
    });
  }

  private analyzeChordInput(): void {
    const chordString = this.elements.chordInput.value.trim();
    
    if (!chordString) {
      setHTML(this.elements.chordResult, MESSAGES.EMPTY_CHORD_INPUT);
      this.state.currentChord = null;
      this.state.currentChordNotes = [];
      return;
    }

    try {
      const chord = MusicTheory.getChordFromString(chordString);
      this.displayChordAnalysis(chord);
    } catch (error) {
      // Invalid chord - clear current state but don't show error
      this.state.currentChord = null;
      this.state.currentChordNotes = [];
    }
  }

  private displayChordAnalysis(chord: Chord): void {
    const { root, quality, notes, bassNote } = chord;

    // Convert to appropriate notation
    const displayNotes = MusicTheory.convertToNotation(notes, this.state.useFlats);
    const displayRoot = this.convertNoteToDisplay(root);
    const displayBass = bassNote ? this.convertNoteToDisplay(bassNote) : null;

    const chordName = this.formatChordName(displayRoot, quality, displayBass);
    const noteBadges = this.createNoteBadges(displayNotes, displayBass);

    const html = `
      <h3 style="color: ${COLORS.PRIMARY}; margin-bottom: 1rem;">${chordName}</h3>
      <div class="${CSS_CLASSES.CHORD_NOTES}">
        ${noteBadges}
      </div>
      <div class="${CSS_CLASSES.CHORD_INFO}">
        <p>${MESSAGES.ROOT_LABEL}${displayRoot}</p>
        <p>${MESSAGES.CHORD_TYPE_LABEL}${quality}</p>
        ${displayBass ? `<p>${MESSAGES.BASS_NOTE_LABEL}${displayBass}</p>` : ''}
        <p>${MESSAGES.NOTES_LABEL}${displayNotes.join(' - ')}</p>
      </div>
    `;

    setHTML(this.elements.chordResult, html);
    this.state.currentChordNotes = notes;
    this.state.currentChord = chord;
  }

  private convertNoteToDisplay(note: Note): string {
    return this.state.useFlats ? (MusicTheory.enharmonicEquivalents[note] || note) : note;
  }

  private formatChordName(root: string, quality: string, bassNote?: string | null): string {
    let name = root + (quality === 'maj' ? '' : quality);
    if (bassNote) {
      name += '/' + bassNote;
    }
    return name;
  }

  private createNoteBadges(notes: Note[], bassNote?: string | null): string {
    return notes
      .map((note, index) => {
        const isBass = bassNote && index === 0 && note === bassNote;
        const badgeClass = `${CSS_CLASSES.NOTE_BADGE}${isBass ? ` ${CSS_CLASSES.BASS_NOTE}` : ''}`;
        const label = isBass ? `${note}${MESSAGES.BASS_LABEL}` : note;
        return `<span class="${badgeClass}">${label}</span>`;
      })
      .join('');
  }

  private handleNoteButtonClick(button: HTMLButtonElement): void {
    const note = button.dataset[HTML_ATTRIBUTES.CURRENT_NOTE] || button.dataset[HTML_ATTRIBUTES.NOTE] || '';
    const normalizedNote = MusicTheory.normalizeNote(note as Note);

    // Add visual feedback for note press
    animateNotePress(button);

    // Play the individual note
    try {
      const midiNote = MusicTheory.getMidiNote(normalizedNote, DEFAULT_OCTAVE);
      if (midiNote !== null) {
        const frequency = MusicTheory.getFrequency(midiNote);
        AudioPlayer.playNote(frequency);
      }
    } catch (error) {
      console.error('Failed to play note:', normalizedNote);
    }

    if (hasClass(button, CSS_CLASSES.SELECTED)) {
      removeClass(button, CSS_CLASSES.SELECTED);
      this.state.selectedNotes = this.state.selectedNotes.filter(
        (n) => MusicTheory.normalizeNote(n) !== normalizedNote
      );
    } else {
      addClass(button, CSS_CLASSES.SELECTED);
      this.state.selectedNotes.push(normalizedNote);
    }

    this.updateSelectedNotesDisplay();
  }

  private updateSelectedNotesDisplay(): void {
    if (this.state.selectedNotes.length === 0) {
      clearElement(this.elements.chordSuggestion);
    } else if (this.state.selectedNotes.length >= MIN_NOTES_FOR_CHORD_SUGGESTION) {
      this.findAndDisplayChords();
    } else {
      setHTML(this.elements.chordSuggestion, MESSAGES.SELECT_MORE_NOTES);
    }
    this.updateBassNoteOptions();
  }

  private findAndDisplayChords(): void {
    const selectedBassNote = this.elements.bassNoteSelect.value || undefined;
    const possibleChords = MusicTheory.findPossibleChords(
      this.state.selectedNotes,
      selectedBassNote as Note
    );
    this.displayChordSuggestions(possibleChords);
  }

  private displayChordSuggestions(chordResults: ChordSuggestionResult): void {
    const { exact, partial } = chordResults;

    if (exact.length === 0 && partial.length === 0) {
      setHTML(this.elements.chordSuggestion, MESSAGES.NO_CHORDS_FOUND);
      return;
    }

    const exactHTML = this.createChordSuggestionHTML(exact, MESSAGES.EXACT_MATCHES_TITLE, CSS_CLASSES.EXACT_MATCH);
    const partialHTML = this.createChordSuggestionHTML(partial, MESSAGES.PARTIAL_MATCHES_TITLE, CSS_CLASSES.PARTIAL_MATCH);

    setHTML(this.elements.chordSuggestion, exactHTML + partialHTML);
    this.attachChordSuggestionListeners();
  }

  private createChordSuggestionHTML(suggestions: any[], title: string, className: string): string {
    if (suggestions.length === 0) return '';

    const items = suggestions
      .slice(0, 10) // Limit to first 10 suggestions
      .map((chord) => {
        const displayName = this.state.useFlats ? this.convertChordNameToFlat(chord.name) : chord.name;
        const displayNotes = MusicTheory.convertToNotation(chord.notes, this.state.useFlats);
        const notesString = displayNotes.join(' - ');
        
        return `
          <button class="chord-suggestion-btn" data-chord="${chord.name}">
            <div class="chord-suggestion-name">${displayName}</div>
            <div class="chord-suggestion-notes">${notesString}</div>
          </button>
        `;
      })
      .join('');

    return `
      <div class="${className}">
        <h4>${title}</h4>
        <div class="chord-suggestions-grid">${items}</div>
      </div>
    `;
  }

  private convertChordNameToFlat(chordName: string): string {
    let result = chordName;
    for (const [sharp, flat] of Object.entries(MusicTheory.enharmonicEquivalents)) {
      result = result.replace(new RegExp(sharp, 'g'), flat);
    }
    return result;
  }

  private attachChordSuggestionListeners(): void {
    const suggestionButtons = this.elements.chordSuggestion.querySelectorAll('.chord-suggestion-btn');
    suggestionButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const chordName = (button as HTMLElement).dataset.chord || '';
        this.playChordByName(chordName, button as HTMLElement);
      });
    });
  }

  private playChordByName(chordName: string, sourceElement?: HTMLElement): void {
    try {
      const chord = MusicTheory.getChordFromString(chordName);
      
      // If called from chord suggestion, use the root note as bass note to ensure proper voicing
      const bassNote = sourceElement ? chord.root : chord.bassNote;
      
      AudioPlayer.playChord(chord.notes, DEFAULT_OCTAVE, DEFAULT_DURATION, bassNote);
      
      if (sourceElement) {
        // If called from a chord suggestion button, animate that button
        animateButtonPress(sourceElement);
        
        // Also animate any visible note badges in the chord suggestion area
        const suggestionNoteBadges = this.elements.chordSuggestion.querySelectorAll<HTMLElement>('.note-badge');
        if (suggestionNoteBadges.length > 0) {
          suggestionNoteBadges.forEach((badge, index) => {
            setTimeout(() => {
              triggerPlayingAnimation(badge, 600);
            }, index * 50);
          });
        }
      } else {
        // If called from main chord result area, animate that area
        const noteBadges = this.elements.chordResult.querySelectorAll<HTMLElement>('.note-badge');
        animateChordPlay(this.elements.chordResult, noteBadges);
      }
    } catch (error) {
      console.error('Failed to play chord:', chordName);
    }
  }

  private clearSelectedNotes(): void {
    this.state.selectedNotes = [];
    this.elements.noteButtons.forEach((btn) => removeClass(btn, CSS_CLASSES.SELECTED));
    this.updateSelectedNotesDisplay();
    clearElement(this.elements.chordSuggestion);
    this.elements.bassNoteSelect.value = '';
  }

  private playSelectedNotes(): void {
    if (this.state.selectedNotes.length > 0) {
      const selectedBassNote = this.elements.bassNoteSelect.value || undefined;
      AudioPlayer.playChord(
        this.state.selectedNotes,
        DEFAULT_OCTAVE,
        DEFAULT_DURATION,
        selectedBassNote as Note | undefined
      );
      
      // Add visual feedback for play button and selected note buttons
      animateButtonPress(this.elements.playNotesBtn);
      
      // Animate selected note buttons
      this.elements.noteButtons.forEach((button) => {
        if (hasClass(button, CSS_CLASSES.SELECTED)) {
          setTimeout(() => {
            animateNotePress(button);
          }, Math.random() * 100); // Slight random delay for more natural effect
        }
      });
    }
  }

  private playCurrentChord(): void {
    if (this.state.currentChord && this.state.currentChordNotes.length > 0) {
      AudioPlayer.playChord(
        this.state.currentChordNotes,
        DEFAULT_OCTAVE,
        DEFAULT_DURATION,
        this.state.currentChord.bassNote
      );
      
      // Add visual feedback for play button and chord display
      animateButtonPress(this.elements.playChordBtn);
      const noteBadges = querySelectorAll<HTMLElement>('.note-badge');
      animateChordPlay(this.elements.chordResult, noteBadges);
    } else {
      const chordString = this.elements.chordInput.value.trim();
      if (chordString) {
        // Add visual feedback for play button
        animateButtonPress(this.elements.playChordBtn);
        this.playChordByName(chordString);
      }
    }
  }

  private handleBassNoteChange(): void {
    if (this.state.selectedNotes.length >= MIN_NOTES_FOR_CHORD_SUGGESTION) {
      this.findAndDisplayChords();
    }
  }

  private handleNotationChange(radio: HTMLInputElement): void {
    this.state.useFlats = radio.value === 'flat';
    this.updateNoteButtons();

    // Update current chord display if exists
    if (this.state.currentChord) {
      this.displayChordAnalysis(this.state.currentChord);
    }

    // Update chord suggestions if any
    if (this.state.selectedNotes.length >= MIN_NOTES_FOR_CHORD_SUGGESTION) {
      this.findAndDisplayChords();
    }
  }

  private handleTimbreChange(): void {
    const timbre = this.elements.timbreSelect.value;
    AudioPlayer.setTimbre(timbre as any);
  }

  private updateBassNoteOptions(): void {
    const currentValue = this.elements.bassNoteSelect.value;
    clearElement(this.elements.bassNoteSelect);
    
    // Add default "none" option
    this.elements.bassNoteSelect.appendChild(createOption('', MESSAGES.BASS_NONE_OPTION));
    
    // Add selected notes as bass options
    this.state.selectedNotes.forEach((note) => {
      const displayNote = this.convertNoteToDisplay(note);
      this.elements.bassNoteSelect.appendChild(createOption(note, displayNote));
    });

    // Restore previous selection if still valid
    if (currentValue && this.state.selectedNotes.includes(currentValue as Note)) {
      this.elements.bassNoteSelect.value = currentValue;
    }
  }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ChordentiaApp();
});