/**
 * API Client Wrapper
 * Handles all API calls to backend with proper error handling
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * Type definitions for API responses
 */
export interface Account {
  id: string;
  name: string;
  type: string;
  balance: string;
  currency: string;
}

export interface AccountsListResponse {
  accounts: Account[];
}

export interface Transaction {
  id: string;
  accountId: string;
  type: string;
  category: string;
  amount: string;
  description?: string;
  date: string;
}

export interface TransactionsListResponse {
  transactions: Transaction[];
  count: number;
}

/**
 * Fetch wrapper with error handling
 */
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // Include cookies for auth
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "An error occurred",
      };
    }

    return data;
  } catch (error) {
    console.error("API error:", error);
    return {
      success: false,
      error: "Failed to connect to server",
    };
  }
}

/**
 * Auth API calls
 */
export const authApi = {
  signup: (email: string, password: string) =>
    apiFetch<{ id: string; email: string }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, confirmPassword: password }),
    }),

  session: () => apiFetch<{ id: string; email: string }>("/api/auth/session"),
};

/**
 * Account API calls
 */
export const accountApi = {
  list: () => apiFetch<AccountsListResponse>("/api/accounts", { method: "GET" }),

  create: (name: string, type: string) =>
    apiFetch<Account>("/api/accounts", {
      method: "POST",
      body: JSON.stringify({ name, type }),
    }),

  getById: (id: string) =>
    apiFetch<Account>(`/api/accounts/${id}`, { method: "GET" }),

  update: (id: string, data: { name?: string; type?: string }) =>
    apiFetch<Account>(`/api/accounts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<{ id: string }>(`/api/accounts/${id}`, { method: "DELETE" }),

  transfer: (
    fromId: string,
    toId: string,
    amount: string,
    description?: string
  ) =>
    apiFetch<{ id: string; fromAccountId: string; toAccountId: string; amount: string }>(
      `/api/accounts/${fromId}/transfer`,
      {
        method: "POST",
        body: JSON.stringify({
          toAccountId: toId,
          amount,
          description,
        }),
      }
    ),
};

/**
 * Transaction API calls
 */
export const transactionApi = {
  list: (params?: {
    accountId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.accountId) query.append("accountId", params.accountId);
    if (params?.type) query.append("type", params.type);
    if (params?.startDate) query.append("startDate", params.startDate);
    if (params?.endDate) query.append("endDate", params.endDate);
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());

    return apiFetch<TransactionsListResponse>(`/api/transactions?${query.toString()}`, {
      method: "GET",
    });
  },

  create: (data: {
    accountId: string;
    type: string;
    category: string;
    amount: string;
    description?: string;
    date: string;
  }) =>
    apiFetch<Transaction>("/api/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (
    id: string,
    data: {
      type?: string;
      category?: string;
      amount?: string;
      description?: string | null;
      date?: string;
    }
  ) =>
    apiFetch<Transaction>(`/api/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<{ id: string }>(`/api/transactions/${id}`, { method: "DELETE" }),
};
