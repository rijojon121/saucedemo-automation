import { Page, Locator, expect } from '@playwright/test';

/**
 * CheckoutPage — covers all three checkout steps:
 *   Step 1: /checkout-step-one.html   (personal info form)
 *   Step 2: /checkout-step-two.html   (order summary)
 *   Complete: /checkout-complete.html (confirmation)
 *
 * Design decision: keeping all checkout steps in one Page Object
 * reflects the reality that checkout is a single user journey.
 * If the checkout flow grew significantly, we'd split per step.
 */
export class CheckoutPage {
  readonly page: Page;

  // Step 1 locators
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly errorMessage: Locator;

  // Step 2 locators
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;
  readonly summaryItems: Locator;

  // Complete locators
  readonly confirmationHeader: Locator;
  readonly confirmationText: Locator;
  readonly backToHomeButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Step 1
    this.firstNameInput  = page.locator('[data-test="firstName"]');
    this.lastNameInput   = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton  = page.locator('[data-test="continue"]');
    this.cancelButton    = page.locator('[data-test="cancel"]');
    this.errorMessage    = page.locator('[data-test="error"]');

    // Step 2
    this.subtotalLabel = page.locator('.summary_subtotal_label');
    this.taxLabel      = page.locator('.summary_tax_label');
    this.totalLabel    = page.locator('.summary_total_label');
    this.finishButton  = page.locator('[data-test="finish"]');
    this.summaryItems  = page.locator('.cart_item');

    // Complete
    this.confirmationHeader  = page.locator('.complete-header');
    this.confirmationText    = page.locator('.complete-text');
    this.backToHomeButton    = page.locator('[data-test="back-to-products"]');
  }

  // ── Step 1: Info form ─────────────────────────────────────

  async fillCheckoutInfo(firstName: string, lastName: string, postalCode: string) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  async clickContinue() {
    await this.continueButton.click();
  }

  async clickCancel() {
    await this.cancelButton.click();
  }

  // ── Step 2: Summary ───────────────────────────────────────

  async clickFinish() {
    await this.finishButton.click();
  }

  async getSubtotal(): Promise<string> {
    return this.subtotalLabel.innerText();
  }

  async getTotal(): Promise<string> {
    return this.totalLabel.innerText();
  }

  // ── Complete ──────────────────────────────────────────────

  async clickBackToHome() {
    await this.backToHomeButton.click();
  }

  // ── Assertions ────────────────────────────────────────────

  async expectOnStepOne() {
    await expect(this.page).toHaveURL('/checkout-step-one.html');
  }

  async expectOnStepTwo() {
    await expect(this.page).toHaveURL('/checkout-step-two.html');
  }

  async expectOnConfirmationPage() {
    await expect(this.page).toHaveURL('/checkout-complete.html');
  }

  async expectConfirmationHeader(text: string) {
    await expect(this.confirmationHeader).toHaveText(text);
  }

  async expectSummaryItemCount(count: number) {
    await expect(this.summaryItems).toHaveCount(count);
  }

  async expectErrorMessage(message: string) {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }

  async expectSubtotalContains(value: string) {
    await expect(this.subtotalLabel).toContainText(value);
  }
}
