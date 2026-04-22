"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { accountApi, transactionApi, Account, Transaction } from "@/lib/api";
import { Plus, Trash2 } from "lucide-react";

const TRANSACTION_CATEGORIES: Record<string, string[]> = {
  INCOME: ["Gaji", "Bonus", "Freelance", "Investasi", "Lainnya"],
  EXPENSE: ["Makanan", "Transport", "Hiburan", "Kesehatan", "Lainnya"],
  ASSET: ["Emas", "Saham", "Properti", "Kendaraan", "Lainnya"],
  DEBT: ["Cicilan", "Kartu Kredit", "Pinjaman", "Hipotik", "Lainnya"],
};

const CreateTransactionSchema = z.object({
  accountId: z.string().min(1, "Akun diperlukan"),
  type: z.enum(["INCOME", "EXPENSE", "ASSET", "DEBT"]),
  category: z.string().min(1, "Kategori diperlukan"),
  amount: z.string().min(1, "Jumlah diperlukan"),
  description: z.string().optional(),
  date: z.string().min(1, "Tanggal diperlukan"),
});

type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;

export default function TransactionsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateTransactionInput>({
    resolver: zodResolver(CreateTransactionSchema),
    defaultValues: {
      type: "EXPENSE",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const transactionType = watch("type");

  useEffect(() => {
    if (transactionType && transactionType in TRANSACTION_CATEGORIES) {
      setCategories(TRANSACTION_CATEGORIES[transactionType]);
    }
  }, [transactionType]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [accountsRes, transactionsRes] = await Promise.all([
        accountApi.list(),
        transactionApi.list(),
      ]);

      if (accountsRes.success) {
        setAccounts(accountsRes.data?.accounts || []);
      }
      if (transactionsRes.success) {
        setTransactions(transactionsRes.data?.transactions || []);
      }
    } catch (err) {
      setError("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: CreateTransactionInput) => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await transactionApi.create({
        ...data,
        date: `${data.date}T00:00:00Z`,
      });

      if (response.success && response.data) {
        setTransactions([response.data, ...transactions]);
        reset({
          type: "EXPENSE",
          date: new Date().toISOString().split("T")[0],
        });
        setShowForm(false);
      } else {
        setError(response.error || "Gagal membuat transaksi");
      }
    } catch (err) {
      setError("Gagal membuat transaksi");
    } finally {
      setIsCreating(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!confirm("Yakin ingin menghapus transaksi ini?")) return;

    try {
      const response = await transactionApi.delete(id);
      if (response.success) {
        setTransactions(transactions.filter((t) => t.id !== id));
      }
    } catch (err) {
      setError("Gagal menghapus transaksi");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Transaksi</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus size={20} />
          Tambah Transaksi
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Buat Transaksi Baru</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Akun
                </label>
                <select
                  {...register("accountId")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Pilih Akun</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
                {errors.accountId && (
                  <p className="text-red-600 text-sm mt-1">{errors.accountId.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipe
                </label>
                <select
                  {...register("type")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="EXPENSE">Pengeluaran</option>
                  <option value="INCOME">Pendapatan</option>
                  <option value="ASSET">Aset</option>
                  <option value="DEBT">Utang</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <select
                  {...register("category")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jumlah (Rp)
                </label>
                <input
                  type="number"
                  {...register("amount")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="0"
                />
                {errors.amount && (
                  <p className="text-red-600 text-sm mt-1">{errors.amount.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal
                </label>
                <input
                  type="date"
                  {...register("date")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keterangan
                </label>
                <input
                  type="text"
                  {...register("description")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Opsional"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
            >
              {isCreating ? "Membuat..." : "Buat Transaksi"}
            </button>
          </form>
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-600">Memuat transaksi...</p>
      ) : transactions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Belum ada transaksi</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Akun
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                  Jumlah
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3 text-sm text-gray-900">
                    {new Date(t.date).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-900">{t.category}</td>
                  <td className="px-6 py-3 text-sm text-gray-900">
                    {accounts.find((a) => a.id === t.accountId)?.name}
                  </td>
                  <td className={`px-6 py-3 text-sm font-semibold text-right ${
                    t.type === "INCOME" ? "text-green-600" : "text-red-600"
                  }`}>
                    {t.type === "INCOME" ? "+" : "-"} Rp {parseFloat(t.amount).toLocaleString("id-ID")}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <button
                      onClick={() => deleteTransaction(t.id)}
                      className="p-2 hover:bg-red-100 rounded"
                    >
                      <Trash2 size={18} className="text-red-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
