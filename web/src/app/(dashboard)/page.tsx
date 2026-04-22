"use client";

import { useEffect, useState } from "react";
import { accountApi, transactionApi, Account, Transaction } from "@/lib/api";

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [accountsRes, transactionsRes] = await Promise.all([
          accountApi.list(),
          transactionApi.list(),
        ]);

        if (accountsRes.success) {
          setAccounts(accountsRes.data?.accounts || []);
        } else {
          console.warn("Failed to load accounts:", accountsRes.error);
          setError(accountsRes.error || "Gagal memuat akun");
        }

        if (transactionsRes.success) {
          setTransactions(transactionsRes.data?.transactions || []);
        } else {
          console.warn("Failed to load transactions:", transactionsRes.error);
        }
      } catch (err) {
        console.error("Failed to load data:", err);
        setError(err instanceof Error ? err.message : "Gagal memuat data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const totalBalance = accounts.reduce((sum, acc) => sum + parseFloat(acc.balance.toString()), 0);
  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

  const recentTransactions = transactions.slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600">Memuat data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-700 font-semibold mb-2">Error</p>
          <p className="text-red-600 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-600 text-sm font-medium mb-2">Total Saldo</h2>
          <p className="text-3xl font-bold text-purple-600">
            Rp {totalBalance.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-gray-500 mt-2">{accounts.length} akun</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-600 text-sm font-medium mb-2">Total Pendapatan</h2>
          <p className="text-3xl font-bold text-green-600">
            Rp {totalIncome.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-gray-500 mt-2">Semua waktu</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-600 text-sm font-medium mb-2">Total Pengeluaran</h2>
          <p className="text-3xl font-bold text-red-600">
            Rp {totalExpense.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-gray-500 mt-2">Semua waktu</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Transaksi Terbaru</h2>
          {recentTransactions.length === 0 ? (
            <p className="text-gray-500">Belum ada transaksi</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between pb-3 border-b last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{t.category}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(t.date).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  <p
                    className={`font-semibold ${
                      t.type === "INCOME" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {t.type === "INCOME" ? "+" : "-"} Rp{" "}
                    {parseFloat(t.amount.toString()).toLocaleString("id-ID", {
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Accounts Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Akun Saya</h2>
          {accounts.length === 0 ? (
            <p className="text-gray-500">Belum ada akun</p>
          ) : (
            <div className="space-y-3">
              {accounts.map((acc) => (
                <div key={acc.id} className="flex items-center justify-between pb-3 border-b last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{acc.name}</p>
                    <p className="text-sm text-gray-500">{acc.type}</p>
                  </div>
                  <p className="font-semibold text-purple-600">
                    Rp {parseFloat(acc.balance.toString()).toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
