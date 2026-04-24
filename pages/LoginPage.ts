import { Page, Locator, expect } from '@playwright/test';

/**
 * LoginPage — encapsulates all interactions with saucedemo.com login screen.
 *
 * Design decision: selectors use data-test attributes where available
 * (SauceDemo provides them). This decouples tests from CSS classes
 * and is the same pattern we'd apply to a production app.
 */
export class LoginPage {
  readonly page: Page;

  // Locators
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly errorCloseButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput    = page.locator('[data-test="username"]');
    this.passwordInput    = page.locator('[data-test="password"]');
    this.loginButton      = page.locator('[data-test="login-button"]');
    this.errorMessage     = page.locator('[data-test="error"]');
    this.errorCloseButton = page.locator('.error-button');
  }

  // ── Navigation ────────────────────────────────────────────

  async goto() {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
  }

  // ── Actions ───────────────────────────────────────────────

  async fillUsername(username: string) {
    await this.usernameInput.fill(username);
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async clickLogin() {
    await this.loginButton.click();
  }

  /**
   * Primary login method — fills credentials and submits.
   * Returns void; callers assert the outcome themselves.
   */
  async login(username: string, password: string) {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickLogin();
  }

  async dismissError() {
    await this.errorCloseButton.click();
  }

  // ── Assertions ────────────────────────────────────────────

  async expectErrorMessage(message: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }

  async expectErrorNotVisible() {
    await expect(this.errorMessage).not.toBeVisible();
  }

  async expectOnLoginPage() {
    await expect(this.loginButton).toBeVisible();
    await expect(this.page).toHaveURL('/');
  }
}
