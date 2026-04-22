import { z } from "zod";

/**
 * Auth Validation Schemas
 */
export const SignupSchema = z.object({
  email: z.string().email("Email harus valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

export const LoginSchema = z.object({
  email: z.string().email("Email harus valid"),
  password: z.string(),
});

export type SignupInput = z.infer<typeof SignupSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;

/**
 * Account Validation Schemas
 */
export const AccountTypeEnum = z.enum(["DEBIT", "KREDIT", "SAVINGS", "INVESTMENT"]);

export const CreateAccountSchema = z.object({
  name: z.string().min(1, "Nama akun diperlukan").max(100),
  type: AccountTypeEnum,
});

export const UpdateAccountSchema = z.object({
  name: z.string().min(1, "Nama akun diperlukan").max(100).optional(),
  type: AccountTypeEnum.optional(),
});

export type CreateAccountInput = z.infer<typeof CreateAccountSchema>;
export type UpdateAccountInput = z.infer<typeof UpdateAccountSchema>;

/**
 * Transaction Validation Schemas
 */
export const TransactionTypeEnum = z.enum(["INCOME", "EXPENSE", "ASSET", "DEBT"]);

export const CreateTransactionSchema = z.object({
  accountId: z.string().min(1, "Account diperlukan"),
  type: TransactionTypeEnum,
  category: z.string().min(1, "Kategori diperlukan"),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Amount harus valid (e.g., 1000 atau 1000.50)"),
  description: z.string().max(500).optional().nullable(),
  date: z.string().datetime({ message: "Date harus ISO datetime" }),
});

export const UpdateTransactionSchema = z.object({
  type: TransactionTypeEnum.optional(),
  category: z.string().min(1).optional(),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
  description: z.string().max(500).optional().nullable(),
  date: z.string().datetime().optional(),
});

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>;

/**
 * Transfer Validation Schema
 */
export const TransferSchema = z.object({
  toAccountId: z.string().min(1, "Target account diperlukan"),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Amount harus valid"),
  description: z.string().max(500).optional().nullable(),
});

export type TransferInput = z.infer<typeof TransferSchema>;

/**
 * Query Validation
 */
export const PaginationSchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("50"),
});

export const TransactionQuerySchema = z.object({
  accountId: z.string().optional(),
  type: TransactionTypeEnum.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("50"),
});

export type TransactionQuery = z.infer<typeof TransactionQuerySchema>;
