import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import {
  USERS,
  PRODUCTS,
  CHECKOUT_INFO,
} from '../utils/testData';

/**
 * Checkout E2E test suite
 *
 * Covers:
 *   ✓ Full purchase flow: login → add to cart → checkout → confirmation
 *   ✓ Multi-item checkout with price total validation
 *   ✓ Add and remove item from inventory
 *   ✓ Cart badge count increments and decrements correctly
 *   ✓ Price shown in cart matches inventory price
 *   ✓ Checkout form validation (missing required fields)
 *   ✓ Cancel checkout returns to correct page
 *   ✓ Back to products from confirmation page
 */

test.describe('Checkout Flow', () => {
  let loginPage: LoginPage;
  let inventoryPage: InventoryPage;
  let cartPage: CartPage;
  let checkoutPage: CheckoutPage;

  // Log in as standard_user before every test in this suite
  test.beforeEach(async ({ page }) => {
    loginPage     = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    cartPage      = new CartPage(page);
    checkoutPage  = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login(USERS.standard.username, USERS.standard.password);
    await inventoryPage.expectOnInventoryPage();
  });

  // ── Core E2E happy path ──────────────────────────────────

  test('completes full purchase flow for a single item', async () => {
    // 1. Add item on inventory page
    await inventoryPage.addItemToCart(PRODUCTS.backpack.name);
    await inventoryPage.expectCartBadgeCount(1);

    // 2. Navigate to cart and verify item
    await inventoryPage.goToCart();
    await cartPage.expectOnCartPage();
    await cartPage.expectItemInCart(PRODUCTS.backpack.name);
    await cartPage.expectCartItemCount(1);

    // 3. Proceed to checkout info
    await cartPage.clickCheckout();
    await checkoutPage.expectOnStepOne();

    // 4. Fill checkout form
    await checkoutPage.fillCheckoutInfo(
      CHECKOUT_INFO.firstName,
      CHECKOUT_INFO.lastName,
      CHECKOUT_INFO.postalCode
    );
    await checkoutPage.clickContinue();

    // 5. Verify order summary
    await checkoutPage.expectOnStepTwo();
    await checkoutPage.expectSummaryItemCount(1);
    await checkoutPage.expectSubtotalContains(PRODUCTS.backpack.price);

    // 6. Finish order
    await checkoutPage.clickFinish();

    // 7. Confirm success
    await checkoutPage.expectOnConfirmationPage();
    await checkoutPage.expectConfirmationHeader('Thank you for your order!');
  });

  // ── Multi-item checkout ──────────────────────────────────

  test('completes checkout with multiple items and validates total', async ({ page }) => {
    await inventoryPage.addItemToCart(PRODUCTS.backpack.name);
    await inventoryPage.addItemToCart(PRODUCTS.bikeLight.name);
    await inventoryPage.expectCartBadgeCount(2);

    await inventoryPage.goToCart();
    await cartPage.expectCartItemCount(2);
    await cartPage.expectItemInCart(PRODUCTS.backpack.name);
    await cartPage.expectItemInCart(PRODUCTS.bikeLight.name);

    await cartPage.clickCheckout();
    await checkoutPage.fillCheckoutInfo(
      CHECKOUT_INFO.firstName,
      CHECKOUT_INFO.lastName,
      CHECKOUT_INFO.postalCode
    );
    await checkoutPage.clickContinue();
    await checkoutPage.expectOnStepTwo();

    // Validate the subtotal is the sum of both items ($29.99 + $9.99 = $39.98)
    await checkoutPage.expectSubtotalContains('39.98');

    await checkoutPage.clickFinish();
    await checkoutPage.expectConfirmationHeader('Thank you for your order!');
  });

  // ── Cart management ──────────────────────────────────────

  test('cart badge increments to 2 when two items added', async () => {
    await inventoryPage.addItemToCart(PRODUCTS.backpack.name);
    await inventoryPage.expectCartBadgeCount(1);

    await inventoryPage.addItemToCart(PRODUCTS.bikeLight.name);
    await inventoryPage.expectCartBadgeCount(2);
  });

  test('removing item from inventory decrements cart badge', async () => {
    await inventoryPage.addItemToCart(PRODUCTS.backpack.name);
    await inventoryPage.expectCartBadgeCount(1);

    await inventoryPage.removeItemFromCart(PRODUCTS.backpack.name);
    await inventoryPage.expectCartBadgeHidden();
  });

  test('price in cart matches price shown on inventory page', async () => {
    const inventoryPrice = await inventoryPage.getProductPrice(PRODUCTS.backpack.name);

    await inventoryPage.addItemToCart(PRODUCTS.backpack.name);
    await inventoryPage.goToCart();

    const cartPrice = await cartPage.getItemPrice(PRODUCTS.backpack.name);
    expect(inventoryPrice).toBe(cartPrice);
  });

  test('item removed from cart no longer appears in cart', async () => {
    await inventoryPage.addItemToCart(PRODUCTS.backpack.name);
    await inventoryPage.goToCart();
    await cartPage.expectItemInCart(PRODUCTS.backpack.name);

    await cartPage.removeItem(PRODUCTS.backpack.name);
    await cartPage.expectItemNotInCart(PRODUCTS.backpack.name);
    await cartPage.expectCartEmpty();
  });

  // ── Negative: checkout form validation ──────────────────

  test('checkout shows error when first name is missing', async () => {
    await inventoryPage.addItemToCart(PRODUCTS.backpack.name);
    await inventoryPage.goToCart();
    await cartPage.clickCheckout();

    // Submit with no info filled in
    await checkoutPage.clickContinue();
    await checkoutPage.expectErrorMessage('First Name is required');
  });

  test('checkout shows error when last name is missing', async () => {
    await inventoryPage.addItemToCart(PRODUCTS.backpack.name);
    await inventoryPage.goToCart();
    await cartPage.clickCheckout();

    await checkoutPage.fillCheckoutInfo(CHECKOUT_INFO.firstName, '', '');
    await checkoutPage.clickContinue();
    await checkoutPage.expectErrorMessage('Last Name is required');
  });

  test('checkout shows error when postal code is missing', async () => {
    await inventoryPage.addItemToCart(PRODUCTS.backpack.name);
    await inventoryPage.goToCart();
    await cartPage.clickCheckout();

    await checkoutPage.fillCheckoutInfo(
      CHECKOUT_INFO.firstName,
      CHECKOUT_INFO.lastName,
      ''
    );
    await checkoutPage.clickContinue();
    await checkoutPage.expectErrorMessage('Postal Code is required');
  });

  // ── Cancel flow ──────────────────────────────────────────

  test('cancelling checkout step 1 returns to cart', async () => {
    await inventoryPage.addItemToCart(PRODUCTS.backpack.name);
    await inventoryPage.goToCart();
    await cartPage.clickCheckout();
    await checkoutPage.expectOnStepOne();

    await checkoutPage.clickCancel();
    await cartPage.expectOnCartPage();
  });

  // ── Post-purchase navigation ─────────────────────────────

  test('back to products from confirmation returns to inventory', async () => {
    await inventoryPage.addItemToCart(PRODUCTS.backpack.name);
    await inventoryPage.goToCart();
    await cartPage.clickCheckout();
    await checkoutPage.fillCheckoutInfo(
      CHECKOUT_INFO.firstName,
      CHECKOUT_INFO.lastName,
      CHECKOUT_INFO.postalCode
    );
    await checkoutPage.clickContinue();
    await checkoutPage.clickFinish();
    await checkoutPage.expectOnConfirmationPage();

    await checkoutPage.clickBackToHome();
    await inventoryPage.expectOnInventoryPage();
  });
});
