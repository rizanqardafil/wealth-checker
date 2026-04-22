import Decimal from "decimal.js";

/**
 * Calculate financial health score (0-100)
 * Phase 1: Simple placeholder, will expand in Phase 3
 */
export function calculateHealthScore(
  income: Decimal,
  expense: Decimal,
  debt: Decimal,
  assets: Decimal
): number {
  // Placeholder for Phase 1
  // Phase 3 will have complex calculation:
  // - Savings rate: (income - expense) / income × 40 points
  // - Debt ratio: (debt / assets) × 30 points
  // - Emergency fund: × 20 points
  // - Investment ratio: × 10 points
  return 50; // Default middle score
}

/**
 * Calculate freedom level (0-6)
 * Phase 1: Simple placeholder, will expand in Phase 3
 */
export function calculateFreedomLevel(
  netWorth: Decimal,
  income: Decimal,
  debt: Decimal
): number {
  // Phase 3 levels:
  // 0: Pailit (netWorth < 0)
  // 1: Gaji ke Gaji (0 to 3 months)
  // 2: Dana Darurat (3-6 months)
  // 3: Utang Manageable
  // 4: Investasi & Growth
  // 5: Passive Income
  // 6: Financial Freedom

  if (netWorth.lessThan(0)) return 0;
  return 1; // Default for Phase 1
}

/**
 * Calculate net worth: assets - debts
 */
export function calculateNetWorth(
  assets: Decimal,
  debts: Decimal
): Decimal {
  return assets.minus(debts);
}

/**
 * Calculate net income: income - expense
 */
export function calculateNetIncome(
  income: Decimal,
  expense: Decimal
): Decimal {
  return income.minus(expense);
}
