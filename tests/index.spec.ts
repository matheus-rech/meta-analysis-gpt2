import { test, expect } from '@playwright/test';

test('meta-analysis form submission', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Fill in the form
  await page.fill('textarea', 'Test meta-analysis query');
  await page.selectOption('select', 'standard');
  
  // Submit the form
  await page.click('button[type="submit"]');
  
  // Wait for results to load
  await page.waitForSelector('h2:has-text("Meta-Analysis Results")');
  
  // Check if results are displayed
  expect(await page.isVisible('h3:has-text("Summary")')).toBeTruthy();
  expect(await page.isVisible('h3:has-text("Forest Plot")')).toBeTruthy();
});

test('error handling', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Simulate an error by submitting an empty query
  await page.click('button[type="submit"]');
  
  // Check if error message is displayed
  expect(await page.isVisible('.error')).toBeTruthy();
});