import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">Wealth Checker</h1>
        <p className="text-xl text-white/80 mb-8">Personal Finance Dashboard</p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="px-8 py-3 bg-purple-700 text-white rounded-lg font-semibold hover:bg-purple-800"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
