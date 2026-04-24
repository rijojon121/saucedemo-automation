import { Page, Locator, expect } from '@playwright/test';

/**
 * InventoryPage — product listing page after successful login.
 *
 * Design decision: addItemToCart / removeItemFromCart accept a product
 * name string rather than an index so tests are readable and resilient
 * to product re-ordering.
 */
export class InventoryPage {
  readonly page: Page;

  // Locators
  readonly pageTitle: Locator;
  readonly productList: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly sortDropdown: Locator;
  readonly burgerMenuButton: Locator;

  constructor(page: Page) {
    this.page             = page;
    this.pageTitle        = page.locator('.title');
    this.productList      = page.locator('.inventory_list');
    this.cartBadge        = page.locator('.shopping_cart_badge');
    this.cartLink         = page.locator('.shopping_cart_link');
    this.sortDropdown     = page.locator('[data-test="product_sort_container"]');
    this.burgerMenuButton = page.locator('#react-burger-menu-btn');
  }

  // ── Navigation ────────────────────────────────────────────

  async goto() {
    await this.page.goto('/inventory.html', { waitUntil: 'domcontentloaded' });
  }

  async goToCart() {
    await this.cartLink.click();
  }

  // ── Actions ───────────────────────────────────────────────

  /**
   * Adds a product to cart by matching its visible name.
   * Uses a scoped locator so it never clicks the wrong button
   * when multiple products are on the page.
   */
  async addItemToCart(productName: string) {
    const productCard = this.page
      .locator('.inventory_item')
      .filter({ hasText: productName });

    await productCard.locator('button[data-test^="add-to-cart"]').click();
  }

  async removeItemFromCart(productName: string) {
    const productCard = this.page
      .locator('.inventory_item')
      .filter({ hasText: productName });

    await productCard.locator('button[data-test^="remove"]').click();
  }

  async sortProductsBy(option: 'az' | 'za' | 'lohi' | 'hilo') {
    await this.sortDropdown.selectOption(option);
  }

  // ── Assertions ────────────────────────────────────────────

  async expectOnInventoryPage() {
    await expect(this.page).toHaveURL('/inventory.html');
    await expect(this.pageTitle).toHaveText('Products');
  }

  async expectCartBadgeCount(count: number) {
    await expect(this.cartBadge).toHaveText(String(count));
  }

  async expectCartBadgeHidden() {
    await expect(this.cartBadge).not.toBeVisible();
  }

  async expectProductVisible(productName: string) {
    await expect(
      this.page.locator('.inventory_item_name').filter({ hasText: productName })
    ).toBeVisible();
  }

  async getProductPrice(productName: string): Promise<string> {
    const productCard = this.page
      .locator('.inventory_item')
      .filter({ hasText: productName });

    return productCard.locator('.inventory_item_price').innerText();
  }
}
