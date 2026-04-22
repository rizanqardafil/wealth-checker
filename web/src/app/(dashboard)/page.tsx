"use client";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-600 text-sm font-medium mb-2">Total Saldo</h2>
          <p className="text-3xl font-bold text-purple-600">Rp 0</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-600 text-sm font-medium mb-2">Total Pendapatan</h2>
          <p className="text-3xl font-bold text-green-600">Rp 0</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-gray-600 text-sm font-medium mb-2">Total Pengeluaran</h2>
          <p className="text-3xl font-bold text-red-600">Rp 0</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Transaksi Terbaru</h2>
        <p className="text-gray-500">Belum ada transaksi</p>
      </div>
    </div>
  );
}
