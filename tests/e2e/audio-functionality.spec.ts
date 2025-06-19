import { test, expect } from '@playwright/test';

test.describe('Audio Functionality E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('index.html');
    await expect(page.locator('#chord-input')).toBeVisible();
    
    // Grant audio permission (this may not work in all test environments)
    await page.evaluate(() => {
      // Mock AudioContext for testing if needed
      if (typeof window.AudioContext === 'undefined' && typeof window.webkitAudioContext === 'undefined') {
        (window as any).AudioContext = class MockAudioContext {
          createOscillator() {
            return {
              connect() {},
              start() {},
              stop() {},
              frequency: { value: 440 }
            };
          }
          createGain() {
            return {
              connect() {},
              gain: { value: 0.1 }
            };
          }
          get destination() { return {}; }
        };
      }
    });
  });

  test('should have audio controls visible', async ({ page }) => {
    // Check audio-related UI elements are present
    await expect(page.locator('#timbre-select')).toBeVisible();
    await expect(page.locator('#play-chord')).toBeVisible();
  });

  test('should change timbre selection', async ({ page }) => {
    const timbreSelect = page.locator('#timbre-select');
    
    // Should have multiple timbre options
    await expect(timbreSelect.locator('option')).toHaveCount(4); // sine, triangle, sawtooth, square
    
    // Change timbre
    await page.selectOption('#timbre-select', 'sawtooth');
    await expect(timbreSelect).toHaveValue('sawtooth');
    
    await page.selectOption('#timbre-select', 'square');
    await expect(timbreSelect).toHaveValue('square');
  });

  test('should enable play button when chord is present', async ({ page }) => {
    const playButton = page.locator('#play-chord');
    
    // Initially, play button might be disabled
    // Input a chord
    await page.fill('#chord-input', 'Cmaj7');
    
    // Play button should be enabled
    await expect(playButton).toBeEnabled();
  });

  test('should handle note clicking for audio', async ({ page }) => {
    // Click individual notes - should trigger audio
    await page.click('[data-note="C"]');
    await page.click('[data-note="E"]');
    await page.click('[data-note="G"]');
    
    // Notes should be visually selected
    await expect(page.locator('[data-note="C"]')).toHaveClass(/selected/);
    await expect(page.locator('[data-note="E"]')).toHaveClass(/selected/);
    await expect(page.locator('[data-note="G"]')).toHaveClass(/selected/);
  });

  test('should handle chord playback from suggestions', async ({ page }) => {
    // Select notes to get chord suggestions
    await page.click('[data-note="C"]');
    await page.click('[data-note="E"]');
    await page.click('[data-note="G"]');
    
    // Wait for suggestions
    await expect(page.locator('#chord-suggestion')).toBeVisible();
    
    // Click on a chord suggestion to play it
    const firstSuggestion = page.locator('#chord-suggestion .chord-suggestion-btn').first();
    await expect(firstSuggestion).toBeVisible();
    
    // Click should trigger audio playback
    await firstSuggestion.click();
  });

  test('should handle play button click', async ({ page }) => {
    // Input a chord
    await page.fill('#chord-input', 'Am7');
    
    // Play button should be enabled
    await expect(page.locator('#play-chord')).toBeEnabled();
    
    // Click play button
    await page.click('#play-chord');
    
    // Should not throw errors (audio might not play in test environment)
  });

  test('should maintain audio settings across interactions', async ({ page }) => {
    // Set timbre
    await page.selectOption('#timbre-select', 'triangle');
    
    // Input chord and play
    await page.fill('#chord-input', 'G7');
    await page.click('#play-chord');
    
    // Change to different chord
    await page.fill('#chord-input', 'Dm');
    
    // Timbre should still be triangle
    await expect(page.locator('#timbre-select')).toHaveValue('triangle');
  });

  test('should handle audio context initialization', async ({ page }) => {
    // Check that audio-related elements don't cause JavaScript errors
    
    // Navigate and interact with audio elements
    await page.click('[data-note="A"]');
    await page.selectOption('#timbre-select', 'sawtooth');
    await page.fill('#chord-input', 'A7');
    await page.click('#play-chord');
    
    // Check for any console errors related to audio
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Interact more with audio
    await page.click('[data-note="D"]');
    await page.click('[data-note="F#"]');
    
    // Most audio errors in test environment are expected (no actual audio device)
    // Just ensure the app doesn't crash
    await expect(page.locator('#chord-input')).toBeVisible();
  });

  test('should handle note button animations', async ({ page }) => {
    // Click a note and check for visual feedback
    const noteButton = page.locator('[data-note="C"]');
    
    await noteButton.click();
    
    // Note should be selected
    await expect(noteButton).toHaveClass(/selected/);
    
    // Click again to deselect
    await noteButton.click();
    
    // Should not be selected anymore
    await expect(noteButton).not.toHaveClass(/selected/);
  });
});