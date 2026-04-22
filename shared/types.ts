import { z } from "zod";

/**
 * User Types
 */
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type User = z.infer<typeof UserSchema>;

/**
 * Account Types
 */
export const AccountTypeEnum = z.enum(["DEBIT", "KREDIT", "SAVINGS", "INVESTMENT"]);
export type AccountType = z.infer<typeof AccountTypeEnum>;

export const AccountSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  type: AccountTypeEnum,
  balance: z.string(), // Decimal as string
  currency: z.string().default("IDR"),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Account = z.infer<typeof AccountSchema>;

/**
 * Transaction Types
 */
export const TransactionTypeEnum = z.enum(["INCOME", "EXPENSE", "ASSET", "DEBT"]);
export type TransactionType = z.infer<typeof TransactionTypeEnum>;

export const TransactionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  accountId: z.string(),
  type: TransactionTypeEnum,
  category: z.string(),
  amount: z.string(), // Decimal as string
  description: z.string().optional(),
  date: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Transaction = z.infer<typeof TransactionSchema>;

/**
 * Asset Types
 */
export const AssetTypeEnum = z.enum(["GOLD", "STOCKS", "REAL_ESTATE", "VEHICLE", "OTHER"]);
export type AssetType = z.infer<typeof AssetTypeEnum>;

export const AssetSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  type: AssetTypeEnum,
  quantity: z.string(),
  unitPrice: z.string(),
  currentValue: z.string(),
  purchaseDate: z.date(),
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Asset = z.infer<typeof AssetSchema>;

/**
 * Debt Types
 */
export const DebtTypeEnum = z.enum(["LOAN", "CREDIT_CARD", "PERSONAL", "MORTGAGE"]);
export type DebtType = z.infer<typeof DebtTypeEnum>;

export const DebtStatusEnum = z.enum(["ACTIVE", "SETTLED"]);
export type DebtStatus = z.infer<typeof DebtStatusEnum>;

export const DebtSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  type: DebtTypeEnum,
  amount: z.string(),
  remaining: z.string(),
  monthlyPayment: z.string(),
  interestRate: z.string().optional(),
  dueDate: z.date().optional(),
  status: DebtStatusEnum,
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Debt = z.infer<typeof DebtSchema>;

/**
 * Budget Types
 */
export const BudgetSchema = z.object({
  id: z.string(),
  userId: z.string(),
  category: z.string(),
  plannedAmount: z.string(),
  month: z.number().min(1).max(12),
  year: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Budget = z.infer<typeof BudgetSchema>;

/**
 * Financial Snapshot Types
 */
export const FinancialSnapshotSchema = z.object({
  id: z.string(),
  userId: z.string(),
  month: z.number().min(1).max(12),
  year: z.number(),
  totalAssets: z.string(),
  totalDebts: z.string(),
  netWorth: z.string(),
  totalIncome: z.string(),
  totalExpense: z.string(),
  netIncome: z.string(),
  healthScore: z.number().min(0).max(100),
  freedomLevel: z.number().min(0).max(6),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type FinancialSnapshot = z.infer<typeof FinancialSnapshotSchema>;

/**
 * API Response Types
 */
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
});
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Freedom Levels
 */
export const FreedomLevelSchema = z.object({
  level: z.number().min(0).max(6),
  label: z.string(),
  description: z.string(),
  minNetWorth: z.string(),
  maxNetWorth: z.string().optional(),
});
export type FreedomLevel = z.infer<typeof FreedomLevelSchema>;

export const FREEDOM_LEVELS: FreedomLevel[] = [
  {
    level: 0,
    label: "Pailit",
    description: "Net worth kurang dari 0 (utang lebih banyak dari aset)",
    minNetWorth: "-999999999",
    maxNetWorth: "0",
  },
  {
    level: 1,
    label: "Hidup Gaji ke Gaji",
    description: "Net worth 0-3 bulan pengeluaran",
    minNetWorth: "0",
    maxNetWorth: "0.0",
  },
  {
    level: 2,
    label: "Punya Dana Darurat",
    description: "Net worth 3-6 bulan pengeluaran",
    minNetWorth: "0.0",
  },
  {
    level: 3,
    label: "Utang Manageable",
    description: "Utang < 30% dari pendapatan tahunan",
    minNetWorth: "0.0",
  },
  {
    level: 4,
    label: "Investasi & Growth",
    description: "Aset > 5x pendapatan tahunan",
    minNetWorth: "0.0",
  },
  {
    level: 5,
    label: "Passive Income",
    description: "Investasi menghasilkan > 30% dari pengeluaran",
    minNetWorth: "0.0",
  },
  {
    level: 6,
    label: "Kebebasan Finansial",
    description: "Passive income > 100% dari pengeluaran",
    minNetWorth: "0.0",
  },
];
