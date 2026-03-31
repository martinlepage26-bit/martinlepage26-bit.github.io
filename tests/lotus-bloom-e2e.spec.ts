import { expect, test } from '@playwright/test';

test.describe('Lotus agency scorer', () => {
  test('keeps the scorer, categories, and questions on /lotus/', async ({ page }) => {
    test.slow();

    await page.goto('/lotus/');

    await expect(page.getByRole('heading', { level: 1, name: /when life gets harder to carry/i })).toBeVisible();
    await expect(page.locator('#lotus-title-input')).toBeVisible();
    await expect(page.locator('#lotus-text-input')).toBeVisible();
    await expect(page.locator('#lotus-score-button')).toBeVisible();
    await expect(page.locator('#lotus-result-title')).toBeVisible();

    await page.locator('#lotus-title-input').fill('Regression recovery note');
    await page
      .locator('#lotus-text-input')
      .fill(
        'Stress and isolation are tightening access and meaning while governance pressure, workflow ambiguity, and blocked options keep agency narrow. Support, clarity, community, and ritual practice help restore coherence.',
      );
    await page.locator('#lotus-score-button').click();

    await expect(page.locator('#lotus-result-title')).toHaveText('Regression recovery note');
    await expect(page.locator('#lotus-preview')).toContainText('Stress and isolation are tightening access and meaning');
    await expect(page.locator('#lotus-active-signal-count')).not.toHaveText('0');

    const activePills = page.locator('#lotus-active-signals .lotus-pill:not(.lotus-pill-muted)');
    await expect(activePills.first()).toBeVisible();

    await page.locator('[data-lotus-sample="operations-handoff"]').click();
    await expect(page.locator('#lotus-title-input')).toHaveValue('Workflow handoff and monitoring memo');
    await page.locator('#lotus-score-button').click();
    await expect(page.locator('#lotus-result-title')).toHaveText('Workflow handoff and monitoring memo');
    await expect(page.locator('#lotus-preview')).toContainText('The team needs a clearer implementation process');

    const vector = page.locator('#lotus-vector');
    await vector.scrollIntoViewIfNeeded();
    await expect(vector.getByText('Agency & Social Positioning Analyzer', { exact: true })).toBeVisible();
    await expect(vector.getByRole('button', { name: 'Assessment', exact: true })).toBeVisible();
    await expect(vector.getByRole('button', { name: 'LOTUS', exact: true })).toBeVisible();
    await expect(vector.getByRole('button', { name: 'Constraints', exact: true })).toBeVisible();
    await expect(vector.getByRole('button', { name: 'Scaffolds', exact: true })).toBeVisible();
    await expect(vector.getByRole('button', { name: 'Results', exact: true })).toBeVisible();

    await expect(vector.getByRole('heading', { name: 'Origins and Youth' })).toBeVisible();
    await expect(vector.getByText('Impactful moments of your youth', { exact: true })).toBeVisible();
    await expect(vector.getByText('Current material and economic reality', { exact: true })).toBeVisible();

    await vector.getByRole('button', { name: 'Constraints', exact: true }).click();
    await expect(vector.getByText('Body', { exact: true })).toBeVisible();
    await expect(vector.getByText('Time', { exact: true })).toBeVisible();
    await expect(vector.getByText('Institutional', { exact: true })).toBeVisible();

    await vector.getByRole('button', { name: 'Scaffolds', exact: true }).click();
    await expect(vector.getByText('Relational', { exact: true })).toBeVisible();
    await expect(vector.getByText('Material', { exact: true })).toBeVisible();
    await expect(vector.getByText('Interpretive', { exact: true })).toBeVisible();

    await vector.getByRole('button', { name: 'Results', exact: true }).click();
    await expect(vector.getByText('Agency Vector', { exact: true })).toBeVisible();
    await expect(vector.getByText('Effective LOTUS State', { exact: true })).toBeVisible();
    await expect(vector.getByText('Formula Trace', { exact: true })).toBeVisible();
  });
});
