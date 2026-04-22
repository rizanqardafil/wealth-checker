import Decimal from "decimal.js";

/**
 * Calculate net worth: assets - debts
 */
export function calculateNetWorth(
  assets: Decimal | string | number,
  debts: Decimal | string | number
): Decimal {
  const assetsDecimal = new Decimal(assets);
  const debtsDecimal = new Decimal(debts);
  return assetsDecimal.minus(debtsDecimal);
}

/**
 * Calculate net income: income - expense
 */
export function calculateNetIncome(
  income: Decimal | string | number,
  expense: Decimal | string | number
): Decimal {
  const incomeDecimal = new Decimal(income);
  const expenseDecimal = new Decimal(expense);
  return incomeDecimal.minus(expenseDecimal);
}

/**
 * Calculate savings rate: (income - expense) / income * 100
 */
export function calculateSavingsRate(
  income: Decimal | string | number,
  expense: Decimal | string | number
): number {
  const incomeDecimal = new Decimal(income);
  const expenseDecimal = new Decimal(expense);

  if (incomeDecimal.isZero()) return 0;

  const netIncome = incomeDecimal.minus(expenseDecimal);
  return netIncome.dividedBy(incomeDecimal).times(100).toNumber();
}

/**
 * Calculate debt ratio: debt / assets
 */
export function calculateDebtRatio(
  debt: Decimal | string | number,
  assets: Decimal | string | number
): number {
  const debtDecimal = new Decimal(debt);
  const assetsDecimal = new Decimal(assets);

  if (assetsDecimal.isZero()) return 0;

  return debtDecimal.dividedBy(assetsDecimal).times(100).toNumber();
}

/**
 * Calculate emergency fund status (months of expenses)
 */
export function calculateEmergencyFundMonths(
  savings: Decimal | string | number,
  monthlyExpense: Decimal | string | number
): number {
  const savingsDecimal = new Decimal(savings);
  const monthlyExpenseDecimal = new Decimal(monthlyExpense);

  if (monthlyExpenseDecimal.isZero()) return 0;

  return savingsDecimal.dividedBy(monthlyExpenseDecimal).toNumber();
}

/**
 * Calculate financial health score (0-100)
 * - Savings rate: 40 points
 * - Debt ratio: 30 points (lower is better)
 * - Emergency fund: 20 points
 * - Investment ratio: 10 points
 */
export function calculateHealthScore(
  income: Decimal | string | number,
  expense: Decimal | string | number,
  debt: Decimal | string | number,
  assets: Decimal | string | number,
  monthlyExpense?: Decimal | string | number
): number {
  let score = 0;

  // Savings rate: 40 points max
  const savingsRate = calculateSavingsRate(income, expense);
  const savingsRatePoints = Math.min(40, (savingsRate / 100) * 40);
  score += savingsRatePoints;

  // Debt ratio: 30 points max (lower debt ratio = higher points)
  const debtRatio = calculateDebtRatio(debt, assets);
  const debtRatioPoints = Math.max(0, 30 - (debtRatio / 100) * 30);
  score += debtRatioPoints;

  // Emergency fund: 20 points max
  if (monthlyExpense) {
    const emergencyFundMonths = calculateEmergencyFundMonths(assets, monthlyExpense);
    const emergencyFundPoints = Math.min(20, (Math.min(emergencyFundMonths, 6) / 6) * 20);
    score += emergencyFundPoints;
  } else {
    score += 0; // Can't calculate without monthly expense
  }

  // Investment ratio: 10 points max (assets / net worth)
  const assetsDecimal = new Decimal(assets);
  const netWorth = calculateNetWorth(assets, debt);

  if (!netWorth.isZero() && netWorth.isPositive()) {
    const investmentRatio = assetsDecimal.dividedBy(netWorth).times(100).toNumber();
    const investmentRatioPoints = Math.min(10, (investmentRatio / 100) * 10);
    score += investmentRatioPoints;
  }

  return Math.round(score);
}

/**
 * Calculate freedom level (0-6)
 * Based on net worth and monthly savings capability
 */
export function calculateFreedomLevel(
  netWorth: Decimal | string | number,
  monthlyIncome: Decimal | string | number,
  monthlyExpense: Decimal | string | number,
  totalDebt: Decimal | string | number
): number {
  const netWorthDecimal = new Decimal(netWorth);
  const monthlyIncomeDecimal = new Decimal(monthlyIncome);
  const monthlyExpenseDecimal = new Decimal(monthlyExpense);
  const totalDebtDecimal = new Decimal(totalDebt);

  // Level 0: Pailit (net worth < 0)
  if (netWorthDecimal.isNegative()) return 0;

  // Level 1: Gaji ke Gaji (net worth 0-3 months expenses)
  const threeMonthExpense = monthlyExpenseDecimal.times(3);
  if (netWorthDecimal.lessThan(threeMonthExpense)) return 1;

  // Level 2: Dana Darurat (net worth 3-6 months expenses)
  const sixMonthExpense = monthlyExpenseDecimal.times(6);
  if (netWorthDecimal.lessThan(sixMonthExpense)) return 2;

  // Level 3: Utang Manageable (debt < 30% income)
  const maxDebt = monthlyIncomeDecimal.times(12).times(0.3);
  if (totalDebtDecimal.lessThan(maxDebt)) return 3;

  // Level 4: Investasi & Growth (assets > 5x annual income)
  const fiveTimesIncome = monthlyIncomeDecimal.times(12).times(5);
  if (netWorthDecimal.greaterThan(fiveTimesIncome)) return 4;

  // Level 5: Passive Income (investment returns > 30% expenses)
  // Simplified: if assets > 3x annual expense
  const threeTimesAnnualExpense = monthlyExpenseDecimal.times(12).times(3);
  if (netWorthDecimal.greaterThan(threeTimesAnnualExpense)) return 5;

  // Level 6: Financial Freedom (passive income > 100% expenses)
  // Simplified: if assets > 10x annual expense
  const tenTimesAnnualExpense = monthlyExpenseDecimal.times(12).times(10);
  if (netWorthDecimal.greaterThan(tenTimesAnnualExpense)) return 6;

  return 1; // Default
}

/**
 * Format number as currency (IDR)
 */
export function formatCurrency(
  value: Decimal | string | number,
  symbol: string = "Rp"
): string {
  const decimal = new Decimal(value);
  return `${symbol} ${decimal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

/**
 * Format number as percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}
