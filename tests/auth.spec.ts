import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import {
  USERS,
  INVALID_CREDENTIALS,
  ERROR_MESSAGES,
} from '../utils/testData';

/**
 * Authentication test suite
 *
 * Covers:
 *   ✓ Successful login with standard_user
 *   ✓ Invalid credentials error (wrong username/password)
 *   ✓ Locked out user error
 *   ✓ Missing username validation
 *   ✓ Missing password validation
 *   ✓ Error message dismissal
 *   ✓ Logged-out users cannot access inventory directly
 */

test.describe('Authentication', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    await loginPage.goto();
  });

  // ── Happy path ──────────────────────────────────────────

  test('standard_user can log in successfully', async ({ page }) => {
    await loginPage.login(USERS.standard.username, USERS.standard.password);

    await inventoryPage.expectOnInventoryPage();
  });

  // ── Negative: invalid credentials ──────────────────────

  test('shows error for wrong username and password', async () => {
    await loginPage.login(
      INVALID_CREDENTIALS.username,
      INVALID_CREDENTIALS.password
    );

    await loginPage.expectErrorMessage(ERROR_MESSAGES.invalidCredentials);
  });

  test('shows error for correct username but wrong password', async () => {
    await loginPage.login(USERS.standard.username, 'wrong_password');

    await loginPage.expectErrorMessage(ERROR_MESSAGES.invalidCredentials);
  });

  // ── Negative: locked out user ────────────────────────────

  test('locked_out_user sees locked-out error message', async () => {
    await loginPage.login(USERS.lockedOut.username, USERS.lockedOut.password);

    await loginPage.expectErrorMessage(ERROR_MESSAGES.lockedOut);
  });

  test('locked_out_user remains on login page after failed attempt', async () => {
    await loginPage.login(USERS.lockedOut.username, USERS.lockedOut.password);

    await loginPage.expectOnLoginPage();
  });

  // ── Negative: empty field validation ────────────────────

  test('shows error when username is missing', async () => {
    await loginPage.fillPassword(USERS.standard.password);
    await loginPage.clickLogin();

    await loginPage.expectErrorMessage(ERROR_MESSAGES.missingUsername);
  });

  test('shows error when password is missing', async () => {
    await loginPage.fillUsername(USERS.standard.username);
    await loginPage.clickLogin();

    await loginPage.expectErrorMessage(ERROR_MESSAGES.missingPassword);
  });

  test('shows error when both fields are empty', async () => {
    await loginPage.clickLogin();

    await loginPage.expectErrorMessage(ERROR_MESSAGES.missingUsername);
  });

  // ── Error dismissal ──────────────────────────────────────

  test('error message can be dismissed with X button', async () => {
    await loginPage.login(
      INVALID_CREDENTIALS.username,
      INVALID_CREDENTIALS.password
    );

    await loginPage.expectErrorMessage(ERROR_MESSAGES.invalidCredentials);
    await loginPage.dismissError();
    await loginPage.expectErrorNotVisible();
  });

  // ── Auth guard ───────────────────────────────────────────

  test('unauthenticated user is redirected from inventory to login', async ({ page }) => {
    await page.goto('/inventory.html', { waitUntil: 'domcontentloaded' });

    // SauceDemo redirects back to login with a query param
    await expect(page).toHaveURL('/');
    await expect(loginPage.loginButton).toBeVisible();
  });
});
