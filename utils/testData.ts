// ─────────────────────────────────────────────────────────────
// Test credentials — SauceDemo publicly documented test users
// In production these would come from environment variables
// ─────────────────────────────────────────────────────────────

export const USERS = {
  standard: {
    username: 'standard_user',
    password: 'secret_sauce',
  },
  lockedOut: {
    username: 'locked_out_user',
    password: 'secret_sauce',
  },
  problemUser: {
    username: 'problem_user',
    password: 'secret_sauce',
  },
} as const;

export const INVALID_CREDENTIALS = {
  username: 'invalid_user',
  password: 'wrong_password',
} as const;

// ─────────────────────────────────────────────────────────────
// Error messages — exact strings asserted against the UI
// ─────────────────────────────────────────────────────────────

export const ERROR_MESSAGES = {
  invalidCredentials:
    'Epic sadface: Username and password do not match any user in this service',
  lockedOut:
    'Epic sadface: Sorry, this user has been locked out.',
  missingUsername:
    'Epic sadface: Username is required',
  missingPassword:
    'Epic sadface: Password is required',
} as const;

// ─────────────────────────────────────────────────────────────
// Products
// ─────────────────────────────────────────────────────────────

export const PRODUCTS = {
  backpack: {
    name: 'Sauce Labs Backpack',
    price: '$29.99',
  },
  bikeLight: {
    name: 'Sauce Labs Bike Light',
    price: '$9.99',
  },
  boltTshirt: {
    name: 'Sauce Labs Bolt T-Shirt',
    price: '$15.99',
  },
} as const;

// ─────────────────────────────────────────────────────────────
// Checkout form
// ─────────────────────────────────────────────────────────────

export const CHECKOUT_INFO = {
  firstName: 'Rijo',
  lastName: 'Johnson',
  postalCode: 'M5V 3A8',
} as const;

export const URLS = {
  base: 'https://www.saucedemo.com',
  inventory: '/inventory.html',
  cart: '/cart.html',
  checkoutStep1: '/checkout-step-one.html',
  checkoutStep2: '/checkout-step-two.html',
  checkoutComplete: '/checkout-complete.html',
} as const;
