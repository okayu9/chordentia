import { test, expect } from '@playwright/test';

test.describe('Bass Note Functionality E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('index.html');
    await expect(page.locator('#chord-input')).toBeVisible();
    await expect(page.locator('#note-buttons')).toBeVisible();
  });

  test('should handle bass note selection for augmented chord', async ({ page }) => {
    // Clear input and select C, E, G# (augmented triad)
    await page.fill('#chord-input', '');
    await page.click('[data-note="C"]');
    await page.click('[data-note="E"]');
    await page.click('[data-note="G#"]');
    
    // Wait for suggestions to appear
    await expect(page.locator('#chord-suggestion')).toBeVisible();
    
    // Initially should show all three augmented chords
    await expect(page.locator('#chord-suggestion')).toContainText('Caug');
    await expect(page.locator('#chord-suggestion')).toContainText('Eaug');
    await expect(page.locator('#chord-suggestion')).toContainText('G#aug');
    
    // Select C as bass note
    await page.selectOption('#bass-note-select', 'C');
    
    // Should still show exact matches including regular Caug and Caug/E, Caug/G#
    await expect(page.locator('#chord-suggestion')).toContainText('Caug');
    
    // Select E as bass note
    await page.selectOption('#bass-note-select', 'E');
    
    // Should show Eaug and possibly Caug/E
    await expect(page.locator('#chord-suggestion')).toContainText('aug');
    
    // Select G# as bass note
    await page.selectOption('#bass-note-select', 'G#');
    
    // Should show G#aug and possibly other inversions
    await expect(page.locator('#chord-suggestion')).toContainText('aug');
  });

  test('should recognize F7/B slash chord', async ({ page }) => {
    // Clear input and select C#, F, A, B
    await page.fill('#chord-input', '');
    await page.click('[data-note="C#"]');
    await page.click('[data-note="F"]');
    await page.click('[data-note="A"]');
    await page.click('[data-note="B"]');
    
    // Select B as bass note
    await page.selectOption('#bass-note-select', 'B');
    
    // Should recognize slash chords including F7/B or other valid interpretations
    await expect(page.locator('#chord-suggestion')).toContainText('/B');
  });

  test('should update bass note options based on selected notes', async ({ page }) => {
    // Initially bass note select should be empty/disabled or have default option
    const bassSelect = page.locator('#bass-note-select');
    
    // Select some notes
    await page.click('[data-note="C"]');
    await page.click('[data-note="E"]');
    await page.click('[data-note="G"]');
    
    // Bass note options should now include the selected notes
    await expect(bassSelect).toContainText('C');
    await expect(bassSelect).toContainText('E');
    await expect(bassSelect).toContainText('G');
    
    // Add another note
    await page.click('[data-note="B"]');
    
    // Should now also include B
    await expect(bassSelect).toContainText('B');
  });

  test('should handle bass note changes dynamically', async ({ page }) => {
    // Select notes for a 7th chord
    await page.fill('#chord-input', '');
    await page.click('[data-note="C"]');
    await page.click('[data-note="E"]');
    await page.click('[data-note="G"]');
    await page.click('[data-note="B"]');
    
    // Initially should show C7 family chords
    await expect(page.locator('#chord-suggestion')).toContainText('C');
    
    // Change bass to E
    await page.selectOption('#bass-note-select', 'E');
    
    // Should update suggestions immediately
    await expect(page.locator('#chord-suggestion')).toBeVisible();
    
    // Change bass to G
    await page.selectOption('#bass-note-select', 'G');
    
    // Should update again
    await expect(page.locator('#chord-suggestion')).toBeVisible();
    
    // Clear bass selection
    await page.selectOption('#bass-note-select', '');
    
    // Should go back to original suggestions
    await expect(page.locator('#chord-suggestion')).toContainText('C');
  });

  test('should maintain chord suggestions when bass note is root', async ({ page }) => {
    // Select C major triad
    await page.fill('#chord-input', '');
    await page.click('[data-note="C"]');
    await page.click('[data-note="E"]');
    await page.click('[data-note="G"]');
    
    // Should show C major
    await expect(page.locator('#chord-suggestion')).toContainText('C');
    
    // Set bass to C (root)
    await page.selectOption('#bass-note-select', 'C');
    
    // Should still show C major prominently
    await expect(page.locator('#chord-suggestion')).toContainText('C');
  });

  test('should handle complex slash chord recognition', async ({ page }) => {
    // Test a more complex case: Am7/D
    await page.fill('#chord-input', '');
    await page.click('[data-note="A"]');
    await page.click('[data-note="C"]');
    await page.click('[data-note="E"]');
    await page.click('[data-note="G"]');
    await page.click('[data-note="D"]');
    
    // Set D as bass note
    await page.selectOption('#bass-note-select', 'D');
    
    // Should suggest slash chord variations
    await expect(page.locator('#chord-suggestion')).toBeVisible();
  });

  test('should clear bass note selection when notes are cleared', async ({ page }) => {
    // Select notes and bass
    await page.click('[data-note="C"]');
    await page.click('[data-note="E"]');
    await page.click('[data-note="G"]');
    await page.selectOption('#bass-note-select', 'E');
    
    // Clear all selections
    await page.click('#clear-notes');
    
    // Bass note select should be reset
    await expect(page.locator('#bass-note-select')).toHaveValue('');
  });

  test('should validate bass note is only from selected notes', async ({ page }) => {
    // Select C, E, G
    await page.click('[data-note="C"]');
    await page.click('[data-note="E"]');
    await page.click('[data-note="G"]');
    
    const bassSelect = page.locator('#bass-note-select');
    
    // Should only have C, E, G as options (plus empty option)
    await expect(bassSelect).toContainText('C');
    await expect(bassSelect).toContainText('E');
    await expect(bassSelect).toContainText('G');
    
    // Should not have other notes like F# as options
    await expect(bassSelect).not.toContainText('F#');
    await expect(bassSelect).not.toContainText('D');
  });
});