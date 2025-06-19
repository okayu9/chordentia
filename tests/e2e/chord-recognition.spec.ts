import { test, expect } from '@playwright/test';

test.describe('Chord Recognition E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the built HTML file
    await page.goto('index.html');
    
    // Wait for the app to be loaded
    await expect(page.locator('#chord-input')).toBeVisible();
    await expect(page.locator('#note-buttons')).toBeVisible();
  });

  test('should load the application correctly', async ({ page }) => {
    // Check main elements are present
    await expect(page.locator('h1')).toHaveText('Chordentia');
    await expect(page.locator('#chord-input')).toBeVisible();
    await expect(page.locator('#note-buttons')).toBeVisible();
    await expect(page.locator('.notation-toggle')).toBeVisible();
  });

  test('should recognize basic chord from input', async ({ page }) => {
    // Input a basic chord
    await page.fill('#chord-input', 'Cmaj7');
    
    // Check chord display
    await expect(page.locator('#chord-result h3')).toHaveText('Cmaj7');
    await expect(page.locator('#chord-result .chord-notes')).toContainText('C');
    await expect(page.locator('#chord-result .chord-notes')).toContainText('E');
    await expect(page.locator('#chord-result .chord-notes')).toContainText('G');
    await expect(page.locator('#chord-result .chord-notes')).toContainText('B');
  });

  test('should recognize augmented chord', async ({ page }) => {
    // Test aug7 chord recognition
    await page.fill('#chord-input', 'Faug7/B');
    
    // Check chord display
    await expect(page.locator('#chord-result h3')).toHaveText('Faug7/B');
    await expect(page.locator('#chord-result .chord-notes')).toContainText('F');
    await expect(page.locator('#chord-result .chord-notes')).toContainText('A');
    await expect(page.locator('#chord-result .chord-notes')).toContainText('C#');
    await expect(page.locator('#chord-result .chord-notes')).toContainText('D#');
    await expect(page.locator('#chord-result .chord-notes')).toContainText('B');
  });

  test('should select notes on keyboard and recognize chords', async ({ page }) => {
    // Clear any existing input
    await page.fill('#chord-input', '');
    
    // Click on C, E, G notes
    await page.click('[data-note="C"]');
    await page.click('[data-note="E"]');
    await page.click('[data-note="G"]');
    
    // Wait for chord suggestions to appear
    await expect(page.locator('#chord-suggestion')).toBeVisible();
    
    // Check that C major chord is suggested
    await expect(page.locator('#chord-suggestion')).toContainText('C');
  });

  test('should recognize augmented triad from selected notes', async ({ page }) => {
    // Clear any existing input
    await page.fill('#chord-input', '');
    
    // Select C, E, G# (C augmented)
    await page.click('[data-note="C"]');
    await page.click('[data-note="E"]');
    await page.click('[data-note="G#"]');
    
    // Wait for chord suggestions
    await expect(page.locator('#chord-suggestion')).toBeVisible();
    
    // Check that augmented chords are suggested
    await expect(page.locator('#chord-suggestion')).toContainText('Caug');
    await expect(page.locator('#chord-suggestion')).toContainText('Eaug');
    await expect(page.locator('#chord-suggestion')).toContainText('G#aug');
  });

  test('should handle notation system toggle', async ({ page }) => {
    // Fill in a chord with sharps
    await page.fill('#chord-input', 'C#maj7');
    
    // Check initial display (should show sharps)
    await expect(page.locator('#chord-result .chord-notes')).toContainText('C#');
    await expect(page.locator('#chord-result .chord-notes')).toContainText('F');
    await expect(page.locator('#chord-result .chord-notes')).toContainText('G#');
    await expect(page.locator('#chord-result .chord-notes')).toContainText('C');
    
    // Toggle to flat notation
    await page.check('input[value="flat"]');
    
    // Check that notation changed to flats
    await expect(page.locator('#chord-result .chord-notes')).toContainText('Db');
    await expect(page.locator('#chord-result .chord-notes')).toContainText('F');
    await expect(page.locator('#chord-result .chord-notes')).toContainText('Ab');
    await expect(page.locator('#chord-result .chord-notes')).toContainText('C');
  });

  test('should display error for invalid chord', async ({ page }) => {
    // Input invalid chord
    await page.fill('#chord-input', 'X123');
    
    // Check that no chord analysis appears (input doesn't change the display)
    await expect(page.locator('#chord-result')).not.toContainText('X123');
  });

  test('should clear selection when clear button is clicked', async ({ page }) => {
    // Select some notes
    await page.click('[data-note="C"]');
    await page.click('[data-note="E"]');
    await page.click('[data-note="G"]');
    
    // Verify notes are selected
    await expect(page.locator('[data-note="C"]')).toHaveClass(/selected/);
    await expect(page.locator('[data-note="E"]')).toHaveClass(/selected/);
    await expect(page.locator('[data-note="G"]')).toHaveClass(/selected/);
    
    // Click clear button
    await page.click('#clear-notes');
    
    // Verify notes are no longer selected
    await expect(page.locator('[data-note="C"]')).not.toHaveClass(/selected/);
    await expect(page.locator('[data-note="E"]')).not.toHaveClass(/selected/);
    await expect(page.locator('[data-note="G"]')).not.toHaveClass(/selected/);
    
    // Verify suggestions are cleared
    await expect(page.locator('#chord-suggestion')).toBeEmpty();
  });
});