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
