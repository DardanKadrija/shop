const { test, expect } = require('@playwright/test');

test('basic shop flow', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('brand')).toHaveText('Wildin Shop');

  // search and assert a product appears
  await page.fill('[data-testid="search-input"]', 'Hoodie');
  await expect(page.getByTestId('product-grid')).toContainText('Trailblazer Hoodie');

  // add first visible product to cart
  await page.locator('[data-testid="add-to-cart"]').first().click();
  await expect(page.getByTestId('cart-count')).toHaveText('1');

  // open cart and assert item present
  await page.click('[data-testid="cart-button"]');
  await expect(page.getByTestId('cart-items')).toContainText('Trailblazer Hoodie');

  // attempt checkout
  await page.click('[data-testid="checkout-button"]');
  await expect(page.getByTestId('checkout-message')).toContainText('Checked out');
});
