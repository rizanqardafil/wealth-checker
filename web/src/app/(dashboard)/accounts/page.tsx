"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { accountApi, Account } from "@/lib/api";
import { Plus, Trash2, Edit2 } from "lucide-react";

const CreateAccountSchema = z.object({
  name: z.string().min(1, "Nama akun diperlukan"),
  type: z.enum(["DEBIT", "KREDIT", "SAVINGS", "INVESTMENT"]),
});

type CreateAccountInput = z.infer<typeof CreateAccountSchema>;

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAccountInput>({
    resolver: zodResolver(CreateAccountSchema),
    defaultValues: { type: "DEBIT" },
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setIsLoading(true);
      const response = await accountApi.list();
      if (response.success) {
        setAccounts(response.data?.accounts || []);
      }
    } catch (err) {
      setError("Gagal memuat akun");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: CreateAccountInput) => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await accountApi.create(data.name, data.type);
      if (response.success && response.data) {
        setAccounts([response.data, ...accounts]);
        reset();
        setShowForm(false);
      } else {
        setError(response.error || "Gagal membuat akun");
      }
    } catch (err) {
      setError("Gagal membuat akun");
    } finally {
      setIsCreating(false);
    }
  };

  const deleteAccount = async (id: string) => {
    if (!confirm("Yakin ingin menghapus akun ini?")) return;

    try {
      const response = await accountApi.delete(id);
      if (response.success) {
        setAccounts(accounts.filter((a) => a.id !== id));
      }
    } catch (err) {
      setError("Gagal menghapus akun");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Akun</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus size={20} />
          Tambah Akun
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Buat Akun Baru</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Akun
              </label>
              <input
                type="text"
                {...register("name")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Contoh: Rekening Utama"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipe Akun
              </label>
              <select
                {...register("type")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="DEBIT">Debit</option>
                <option value="KREDIT">Kredit</option>
                <option value="SAVINGS">Tabungan</option>
                <option value="INVESTMENT">Investasi</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isCreating}
              className="w-full bg-purple-600 text-white font-semibold py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
            >
              {isCreating ? "Membuat..." : "Buat Akun"}
            </button>
          </form>
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-600">Memuat akun...</p>
      ) : accounts.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">Belum ada akun. Buat akun baru untuk memulai!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {accounts.map((account) => (
            <div key={account.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {account.name}
                  </h3>
                  <p className="text-sm text-gray-500">{account.type}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded">
                    <Edit2 size={18} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => deleteAccount(account.id)}
                    className="p-2 hover:bg-red-100 rounded"
                  >
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                </div>
              </div>

              <p className="text-2xl font-bold text-purple-600">
                Rp {parseFloat(account.balance).toLocaleString("id-ID")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
