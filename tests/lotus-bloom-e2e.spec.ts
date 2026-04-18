import { expect, test } from '@playwright/test';

test.describe('Lotus agency scorer', () => {
  test('keeps the scorer, categories, and questions on /lotus/', async ({ page }) => {
    test.slow();

    await page.goto('/lotus/');

    await expect(page.getByRole('heading', { level: 1, name: /agency scorer and reflective workbench/i })).toBeVisible();
    await expect(page.locator('#lotus-title-input')).toBeVisible();
    await expect(page.locator('#lotus-text-input')).toBeVisible();
    await expect(page.locator('#lotus-score-button')).toBeVisible();
    await expect(page.locator('#lotus-result-title')).toBeVisible();
    await expect(page.locator('#lotus-title-input')).toHaveValue('');
    await expect(page.locator('#lotus-text-input')).toHaveValue('');
    await expect(page.locator('#lotus-result-title')).toHaveText('Paste or load a Lotus note');
    await expect(page.locator('#lotus-result-summary')).toContainText('Paste a note or load a public sample');

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
    await expect(page.locator('[data-lotus-sample="operations-handoff"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#lotus-title-input')).toHaveValue('Workflow handoff and monitoring memo');
    await page.locator('#lotus-score-button').click();
    await expect(page.locator('#lotus-result-title')).toHaveText('Workflow handoff and monitoring memo');
    await expect(page.locator('#lotus-preview')).toContainText('The team needs a clearer implementation process');

    await page.locator('#lotus-reset-button').click();
    await expect(page.getByRole('button', { name: 'Load starter sample', exact: true })).toBeVisible();
    await expect(page.locator('#lotus-title-input')).toHaveValue('Bonded intelligence under constraint');
    await expect(page.locator('[data-lotus-sample="bonded-intelligence"]')).toHaveAttribute('aria-pressed', 'true');

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

  test('normalizes markdown-heavy notes without leaking formatting noise into the reading surface', async ({ page }) => {
    await page.goto('/lotus/');

    await page.locator('#lotus-title-input').fill('');
    await page.locator('#lotus-text-input').fill(`# Markdown pressure note

- Governance drift is narrowing choice.
- Support collapse is reducing room to act.
- Meaning and ritual practice are helping coherence return.
`);

    await page.locator('#lotus-score-button').click();

    await expect(page.locator('#lotus-result-title')).toHaveText('Markdown pressure note');
    await expect(page.locator('#lotus-preview')).toContainText('Governance drift is narrowing choice.');
    await expect(page.locator('#lotus-preview')).not.toContainText('# Markdown pressure note');
    await expect(page.locator('#lotus-preview')).not.toContainText('- Governance drift is narrowing choice.');
    await expect(page.locator('#lotus-active-signal-count')).not.toHaveText('0');
  });
});
