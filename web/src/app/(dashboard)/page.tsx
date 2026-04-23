"use client";

import { useEffect, useState } from "react";
import { accountApi, transactionApi, Account, Transaction } from "@/lib/api";
import styles from "./dashboard.module.css";

const getCategoryIcon = (category: string, type: string): string => {
  if (type === "INCOME") return "💼";
  if (category.toLowerCase().includes("makan") || category.toLowerCase().includes("groceries")) return "🛒";
  if (category.toLowerCase().includes("rumah") || category.toLowerCase().includes("rent")) return "🏠";
  if (category.toLowerCase().includes("transport")) return "🚗";
  return "💸";
};

const formatCurrency = (value: number): string => {
  return `$${value.toFixed(2)}`;
};

const getFormattedDate = (): string => {
  const options: Intl.DateTimeFormatOptions = { weekday: "long", month: "long", day: "numeric", year: "numeric" };
  return new Date().toLocaleDateString("en-US", options);
};

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("monthly");
  const [period, setPeriod] = useState("This Month");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const email = localStorage.getItem("user_email") || "";
    setUserEmail(email);
  }, []);

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

  const recentTransactions = transactions.slice(0, 3);

  // Chart data for income vs expense (mock)
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const incomeData = [3200, 3800, 3500, 4000, 3700, 4200];
  const expenseData = [1800, 2100, 1600, 1187, 1900, 1500];
  const maxValue = Math.max(...incomeData, ...expenseData);

  if (isLoading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
        <p style={{ color: "var(--muted)" }}>Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px" }}>
        <div style={{ backgroundColor: "rgba(255,107,107,0.1)", padding: "24px", borderRadius: "12px" }}>
          <p style={{ color: "var(--red)", fontWeight: "600", marginBottom: "8px" }}>Error</p>
          <p style={{ color: "var(--red)", fontSize: "0.9rem" }}>{error}</p>
        </div>
      </div>
    );
  }

  const getUserName = (): string => {
    if (!userEmail) return "Welcome";
    const namePart = userEmail.split("@")[0];
    const firstName = namePart.split(".")[0];
    return firstName.charAt(0).toUpperCase() + firstName.slice(1);
  };

  return (
    <>
      {/* Topbar */}
      <div className={styles.topbar}>
        <div className={styles.pageTitle}>
          <h1>Hi, {getUserName()} 👋</h1>
          <p>Good Morning · {getFormattedDate()}</p>
        </div>
        <div className={styles.topbarActions}>
          <select className={styles.periodSel} value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option>This Month</option>
            <option>Last Month</option>
            <option>This Year</option>
          </select>
          <button className={styles.iconBtn} title="Search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <button className={styles.iconBtn} title="Notifications">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <div className={styles.notifDot} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.hi}`}>
          <div className={styles.statIco}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="1" y="4" width="22" height="16" rx="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
          </div>
          <div className={styles.statLbl}>Total Balance</div>
          <div className={styles.statVal}>{formatCurrency(totalBalance)}</div>
          <div className={`${styles.statChg} ${styles.upInv}`}>▲ +12.5% this month</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIco}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className={styles.statLbl}>Total Expense</div>
          <div className={styles.statVal} style={{ color: "var(--red)" }}>
            -{formatCurrency(totalExpense)}
          </div>
          <div className={`${styles.statChg} ${styles.down}`}>▼ -3.2% vs last month</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIco} style={{ color: "var(--blue)" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            </svg>
          </div>
          <div className={styles.statLbl}>Total Income</div>
          <div className={styles.statVal}>{formatCurrency(totalIncome)}</div>
          <div className={`${styles.statChg} ${styles.up}`}>▲ +8.1% vs last month</div>
        </div>
      </div>

      {/* Progress Card */}
      <div className={styles.progCard}>
        <div className={styles.progHdr}>
          <h3>Monthly Spending Limit</h3>
          <span>30% used</span>
        </div>
        <div className={styles.progBar}>
          <div className={styles.progFill} />
        </div>
        <div className={styles.progMeta}>
          <div className={styles.progNote}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            30% of your expenses used — looking good!
          </div>
          <div className={styles.progLim}>$20,000.00</div>
        </div>
      </div>

      {/* Mid Row */}
      <div className={styles.midRow}>
        {/* Savings Card */}
        <div className={styles.savCard}>
          <div className={styles.savTop}>
            <div className={styles.ringW}>
              <svg width="64" height="64" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="25" fill="none" stroke="rgba(10,36,36,.2)" strokeWidth="5" />
                <circle
                  cx="32"
                  cy="32"
                  r="25"
                  fill="none"
                  stroke="#0a2424"
                  strokeWidth="5"
                  strokeDasharray="157"
                  strokeDashoffset="40"
                  strokeLinecap="round"
                />
              </svg>
              <div className={styles.ringEm}>🚗</div>
            </div>
            <div>
              <div className={styles.savTitle}>Savings On Goals</div>
              <div className={styles.savSub}>75% reached · Car fund</div>
            </div>
          </div>
          <div className={styles.savStats}>
            <div className={styles.sstat}>
              <div className={styles.sstatLbl}>Revenue Last Week</div>
              <div className={styles.sstatVal}>{formatCurrency(totalIncome)}</div>
            </div>
            <div className={styles.sstat}>
              <div className={styles.sstatLbl}>Food Last Week</div>
              <div className={`${styles.sstatVal} ${styles.neg}`}>-$100.00</div>
            </div>
          </div>
        </div>

        {/* Chart Card */}
        <div className={styles.chartCard}>
          <div className={styles.chartHdr}>
            <h3>Income vs Expense</h3>
            <div className={styles.legend}>
              <div className={styles.leg}>
                <div className={styles.legDot} style={{ background: "var(--teal)" }} />
                Income
              </div>
              <div className={styles.leg}>
                <div className={styles.legDot} style={{ background: "var(--blue)" }} />
                Expense
              </div>
            </div>
          </div>
          <div className={styles.barsWrap}>
            {months.map((month, i) => (
              <div key={month} className={styles.bg}>
                <div className={styles.barsInner}>
                  <div
                    className={`${styles.bar} ${styles.inc}`}
                    style={{ height: `${(incomeData[i] / maxValue) * 85}px` }}
                    title={`Income $${incomeData[i].toLocaleString()}`}
                  />
                  <div
                    className={`${styles.bar} ${styles.exp}`}
                    style={{ height: `${(expenseData[i] / maxValue) * 85}px` }}
                    title={`Expense $${expenseData[i].toLocaleString()}`}
                  />
                </div>
                <div className={styles.blbl}>{month}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div>
        <div className={styles.txHdr}>
          <h3>Recent Transactions</h3>
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div className={styles.tabs}>
              <button className={styles.tab} onClick={() => setActiveTab("daily")}>
                Daily
              </button>
              <button className={styles.tab} onClick={() => setActiveTab("weekly")}>
                Weekly
              </button>
              <button className={`${styles.tab} ${styles.active}`} onClick={() => setActiveTab("monthly")}>
                Monthly
              </button>
            </div>
            <a className={styles.seeAll} href="/transactions">
              See All →
            </a>
          </div>
        </div>
        <div className={styles.txList}>
          {recentTransactions.length === 0 ? (
            <p style={{ color: "var(--muted)", padding: "20px" }}>No transactions yet</p>
          ) : (
            recentTransactions.map((tx) => (
              <div key={tx.id} className={styles.txItem}>
                <div className={`${styles.txIco} ${tx.type === "INCOME" ? styles.s : tx.category.toLowerCase().includes("groceries") ? styles.g : styles.r}`}>
                  {getCategoryIcon(tx.category, tx.type)}
                </div>
                <div className={styles.txInfo}>
                  <div className={styles.txName}>{tx.category}</div>
                  <div className={styles.txDate}>
                    {new Date(tx.date).toLocaleTimeString()} · {new Date(tx.date).toLocaleDateString()}
                  </div>
                </div>
                <div className={styles.txCat}>{tx.type}</div>
                <div className={`${styles.txAmt} ${tx.type === "INCOME" ? styles.pos : styles.neg}`}>
                  {tx.type === "INCOME" ? "+" : "-"}{formatCurrency(parseFloat(tx.amount.toString()))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
