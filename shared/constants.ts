/**
 * Transaction Categories
 */
export const TRANSACTION_CATEGORIES = {
  INCOME: [
    "Gaji",
    "Bonus",
    "Freelance",
    "Investasi",
    "Lainnya",
  ],
  EXPENSE: [
    "Makan & Minum",
    "Transport",
    "Hiburan",
    "Belanja",
    "Kesehatan",
    "Pendidikan",
    "Listrik & Air",
    "Internet",
    "Sewa",
    "Asuransi",
    "Lainnya",
  ],
  ASSET: [
    "Emas",
    "Saham",
    "Reksadana",
    "Properti",
    "Kendaraan",
    "Lainnya",
  ],
  DEBT: [
    "Cicilan Motor",
    "Cicilan Mobil",
    "Cicilan Properti",
    "Kartu Kredit",
    "Utang Teman",
    "Lainnya",
  ],
};

/**
 * Health Score Ranges
 */
export const HEALTH_SCORE_RANGES = {
  SANGAT_BURUK: { min: 0, max: 20, label: "Sangat Buruk" },
  BURUK: { min: 21, max: 40, label: "Buruk" },
  CUKUP: { min: 41, max: 60, label: "Cukup" },
  BAIK: { min: 61, max: 80, label: "Baik" },
  SANGAT_BAIK: { min: 81, max: 100, label: "Sangat Baik" },
};

/**
 * Colors for UI
 */
export const COLORS = {
  primary: "#6366f1",
  secondary: "#8b5cf6",
  accent: "#ec4899",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  neutral: "#6b7280",
};

/**
 * Date Format
 */
export const DATE_FORMAT = "DD/MM/YYYY";
export const DATE_TIME_FORMAT = "DD/MM/YYYY HH:mm";

/**
 * Currency
 */
export const DEFAULT_CURRENCY = "IDR";
export const CURRENCY_SYMBOL = "Rp";

/**
 * Decimal Places
 */
export const DECIMAL_PLACES = 2;
