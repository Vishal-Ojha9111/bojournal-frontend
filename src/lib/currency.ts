// FILE: src/lib/currency.ts
// PURPOSE: Currency formatting utilities for INR (Indian Rupee)
// API: N/A

/**
 * Format a number as Indian Rupee currency
 * @param amount - The amount to format
 * @param options - Optional Intl.NumberFormat options
 * @returns Formatted currency string with ₹ symbol
 * 
 * Examples:
 * formatCurrency(1000) => "₹1,000.00"
 * formatCurrency(1500.5) => "₹1,500.50"
 * formatCurrency(999999) => "₹9,99,999.00"
 */
export const formatCurrency = (
  amount: number,
  options?: Intl.NumberFormatOptions
): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);
};

/**
 * Format a number as currency without decimals
 * @param amount - The amount to format
 * @returns Formatted currency string without decimals
 * 
 * Example:
 * formatCurrencyWhole(1500.75) => "₹1,501"
 */
export const formatCurrencyWhole = (amount: number): string => {
  return formatCurrency(amount, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

/**
 * Get the currency symbol for INR
 * @returns Indian Rupee symbol
 */
export const getCurrencySymbol = (): string => {
  return '₹';
};

/**
 * Get the currency code
 * @returns Currency code (INR)
 */
export const getCurrencyCode = (): string => {
  return 'INR';
};


export const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount/100);
  };