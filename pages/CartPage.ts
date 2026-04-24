import { Page, Locator, expect } from '@playwright/test';

/**
 * CartPage — shopping cart at /cart.html
 *
 * Design decision: item assertions use a scoped locator pattern
 * identical to InventoryPage so the team only needs to learn one
 * mental model for "find a product on this page".
 */
export class CartPage {
  readonly page: Page;

  // Locators
  readonly pageTitle: Locator;
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    this.page                    = page;
    this.pageTitle               = page.locator('.title');
    this.cartItems               = page.locator('.cart_item');
    this.checkoutButton          = page.locator('[data-test="checkout"]');
    this.continueShoppingButton  = page.locator('[data-test="continue-shopping"]');
  }

  // ── Navigation ────────────────────────────────────────────

  async goto() {
    await this.page.goto('/cart.html', { waitUntil: 'domcontentloaded' });
  }

  async clickCheckout() {
    await this.checkoutButton.click();
  }

  async clickContinueShopping() {
    await this.continueShoppingButton.click();
  }

  async removeItem(productName: string) {
    const cartItem = this.page
      .locator('.cart_item')
      .filter({ hasText: productName });

    await cartItem.locator('button[data-test^="remove"]').click();
  }

  // ── Assertions ────────────────────────────────────────────

  async expectOnCartPage() {
    await expect(this.page).toHaveURL('/cart.html');
    await expect(this.pageTitle).toHaveText('Your Cart');
  }

  async expectItemInCart(productName: string) {
    await expect(
      this.page.locator('.cart_item_label').filter({ hasText: productName })
    ).toBeVisible();
  }

  async expectItemNotInCart(productName: string) {
    await expect(
      this.page.locator('.cart_item_label').filter({ hasText: productName })
    ).not.toBeVisible();
  }

  async expectCartItemCount(count: number) {
    await expect(this.cartItems).toHaveCount(count);
  }

  async expectCartEmpty() {
    await expect(this.cartItems).toHaveCount(0);
  }

  async getItemPrice(productName: string): Promise<string> {
    const cartItem = this.page
      .locator('.cart_item')
      .filter({ hasText: productName });

    return cartItem.locator('.inventory_item_price').innerText();
  }
}
