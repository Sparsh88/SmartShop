/**
 * Helper to format price in Indian Rupees (INR) format (e.g. ₹10,230)
 * Uses the Indian numbering system where commas are placed after first three digits and then every two.
 */
export function formatPrice(price: number | string | undefined | null): string {
  if (price === undefined || price === null) return '₹0';
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return '₹0';

  // Format using the en-IN locale
  const formatted = num.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });

  return `₹${formatted}`;
}
