// DOM utility functions
export function getElementById<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id) as T;
  if (!element) {
    throw new Error(`Element with id "${id}" not found`);
  }
  return element;
}

export function querySelector<T extends Element>(selector: string): T {
  const element = document.querySelector(selector) as T;
  if (!element) {
    throw new Error(`Element with selector "${selector}" not found`);
  }
  return element;
}

export function querySelectorAll<T extends Element>(selector: string): NodeListOf<T> {
  return document.querySelectorAll(selector);
}

export function createOption(value: string, text: string, selected = false): HTMLOptionElement {
  const option = document.createElement('option');
  option.value = value;
  option.textContent = text;
  option.selected = selected;
  return option;
}

export function clearElement(element: HTMLElement): void {
  element.innerHTML = '';
}

export function setHTML(element: HTMLElement, html: string): void {
  element.innerHTML = html;
}

export function addClass(element: HTMLElement, className: string): void {
  element.classList.add(className);
}

export function removeClass(element: HTMLElement, className: string): void {
  element.classList.remove(className);
}

export function toggleClass(element: HTMLElement, className: string): boolean {
  return element.classList.toggle(className);
}

export function hasClass(element: HTMLElement, className: string): boolean {
  return element.classList.contains(className);
}

// Visual feedback utilities
export function addTemporaryClass(element: HTMLElement, className: string, duration: number): void {
  addClass(element, className);
  setTimeout(() => {
    removeClass(element, className);
  }, duration);
}

export function addRippleEffect(element: HTMLElement): void {
  // Remove existing ripple class and re-add it to restart animation
  removeClass(element, 'ripple');
  // Force reflow
  element.offsetHeight;
  addClass(element, 'ripple');
  
  // Clean up after animation
  setTimeout(() => {
    removeClass(element, 'ripple');
  }, 600);
}

export function triggerPlayingAnimation(element: HTMLElement, duration = 600): void {
  addTemporaryClass(element, 'playing', duration);
}

export function animateNotePress(noteButton: HTMLElement): void {
  triggerPlayingAnimation(noteButton, 600);
  addRippleEffect(noteButton);
}

export function animateChordPlay(chordResult: HTMLElement, noteBadges: NodeListOf<HTMLElement>): void {
  triggerPlayingAnimation(chordResult, 800);
  
  noteBadges.forEach((badge, index) => {
    setTimeout(() => {
      triggerPlayingAnimation(badge, 600);
    }, index * 50); // Stagger the animations
  });
}

export function animateButtonPress(button: HTMLElement): void {
  triggerPlayingAnimation(button, 500);
  addRippleEffect(button);
}
