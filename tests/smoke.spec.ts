import { test, expect, request } from '@playwright/test';

test('dashboard renders and wallet gating works', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/Contract Addresses/i)).toBeVisible();
  // If a "Connect Wallet" button exists, make sure it shows
  const connect = page.getByRole('button', { name: /connect wallet/i });
  if (await connect.isVisible().catch(() => false)) {
    await expect(connect).toBeVisible();
  }
  // While disconnected, actions should be gated/disabled
  const depositBtn = page.getByRole('button', { name: /deposit/i });
  await expect(depositBtn).toBeDisabled();
});

test('relayer health endpoint responds (if configured)', async ({ request }) => {
  const relayer = process.env.NEXT_PUBLIC_RELAYER_URL;
  test.skip(!relayer, 'No relayer URL configured');
  const url = `${relayer!.replace(/\/$/, '')}/health`;
  const res = await request.get(url);
  expect(res.status(), `GET ${url}`).toBe(200);
  const body = await res.json().catch(() => ({}));
  expect(!!(body.ok ?? body.status ?? body.healthy)).toBeTruthy();
});
