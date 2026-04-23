"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Wallet,
  TrendingUp,
  Repeat2,
  Clock,
  LogOut,
} from "lucide-react";
import styles from "./dashboard.module.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("User");
  const [userInitials, setUserInitials] = useState("U");

  useEffect(() => {
    const email = localStorage.getItem("user_email") || "";
    setUserEmail(email);

    if (email) {
      const namePart = email.split("@")[0];
      const name = namePart
        .split(".")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      setUserName(name);

      const initials = namePart
        .split(".")
        .map((word) => word.charAt(0).toUpperCase())
        .join("");
      setUserInitials(initials.slice(0, 2));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user_email");
    localStorage.removeItem("user_id");
    router.push("/login");
  };

  const isActive = (href: string) => pathname === href;

  const menuItems = [
    { label: "Dashboard", href: "/", icon: Home },
    { label: "Transactions", href: "/transactions", icon: Wallet, badge: "3" },
    { label: "Analytics", href: "/analytics", icon: TrendingUp },
    { label: "Transfer", href: "/transfer", icon: Repeat2 },
    { label: "Budget", href: "/budget", icon: Clock },
  ];

  const userRole = "Premium Plan";

  return (
    <div className={styles.app}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>📊</div>
          <span className={styles.logoText}>FinTrack</span>
        </div>

        <div className={styles.navSection}>
          <div className={styles.navLabel}>Main Menu</div>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive(item.href) ? styles.active : ""}`}
            >
              <item.icon width={16} height={16} />
              {item.label}
              {item.badge && <span className={styles.navBadge}>{item.badge}</span>}
            </Link>
          ))}
        </div>

        <div className={styles.navSection}>
          <div className={styles.navLabel}>Account</div>
          <button className={styles.navItem}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Profile
          </button>
          <button className={styles.navItem}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.07 4.93A10 10 0 0 1 21 12M12 2a10 10 0 0 1 7.07 2.93" />
            </svg>
            Settings
          </button>
        </div>

        <div className={styles.sidebarFooter}>
          <div className={styles.userCard}>
            <div className={styles.avatar}>{userInitials}</div>
            <div className={styles.userInfo}>
              <div className={styles.name}>{userName}</div>
              <div className={styles.role}>{userRole}</div>
            </div>
            <svg className={styles.chev} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
          <button
            onClick={handleLogout}
            className={styles.navItem}
            style={{ marginTop: "12px", color: "var(--red)" }}
          >
            <LogOut width={16} height={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {children}
      </main>

      {/* Right Panel */}
      <aside className={styles.panel}>
        <div className={styles.psec}>
          <h3>Savings Goals</h3>
          <div className={styles.goalsList}>
            <div className={styles.goal}>
              <div className={styles.goalTop}>
                <div className={styles.goalName}>
                  <span>🚗</span>Car Fund
                </div>
                <div className={styles.goalPct}>75%</div>
              </div>
              <div className={styles.gBar}>
                <div className={`${styles.gFill} ${styles.t}`} style={{ width: "75%" }} />
              </div>
              <div className={styles.gAmts}>
                <span>$7,500</span>
                <span>$10,000</span>
              </div>
            </div>

            <div className={styles.goal}>
              <div className={styles.goalTop}>
                <div className={styles.goalName}>
                  <span>🏖️</span>Vacation
                </div>
                <div className={styles.goalPct}>42%</div>
              </div>
              <div className={styles.gBar}>
                <div className={`${styles.gFill} ${styles.b}`} style={{ width: "42%" }} />
              </div>
              <div className={styles.gAmts}>
                <span>$2,100</span>
                <span>$5,000</span>
              </div>
            </div>

            <div className={styles.goal}>
              <div className={styles.goalTop}>
                <div className={styles.goalName}>
                  <span>💻</span>Laptop
                </div>
                <div className={styles.goalPct}>60%</div>
              </div>
              <div className={styles.gBar}>
                <div className={`${styles.gFill} ${styles.p}`} style={{ width: "60%" }} />
              </div>
              <div className={styles.gAmts}>
                <span>$900</span>
                <span>$1,500</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.psec}>
          <h3>Quick Actions</h3>
          <div className={styles.qaGrid}>
            <button className={styles.qa}>
              <div className={styles.qaIco}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              Add Income
            </button>
            <button className={styles.qa}>
              <div className={styles.qaIco}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              Add Expense
            </button>
            <button className={styles.qa}>
              <div className={styles.qaIco}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="17 1 21 5 17 9" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                </svg>
              </div>
              Transfer
            </button>
            <button className={styles.qa}>
              <div className={styles.qaIco}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              Reports
            </button>
          </div>
        </div>

        <div className={styles.psec}>
          <h3>Recent Contacts</h3>
          <div className={styles.contactsRow}>
            <div className={styles.contact}>
              <div className={styles.cAv} style={{ background: "linear-gradient(135deg, #6a9fff, #4f8ef7)" }}>
                AL
              </div>
              <div className={styles.cName}>Alice</div>
            </div>
            <div className={styles.contact}>
              <div className={styles.cAv} style={{ background: "linear-gradient(135deg, #f97316, #ef4444)" }}>
                BM
              </div>
              <div className={styles.cName}>Bob</div>
            </div>
            <div className={styles.contact}>
              <div className={styles.cAv} style={{ background: "linear-gradient(135deg, #a78bfa, #7c3aed)" }}>
                CK
              </div>
              <div className={styles.cName}>Carol</div>
            </div>
            <div className={styles.contact}>
              <div className={styles.cAv} style={{ background: "linear-gradient(135deg, #2ee8b5, #1dc99a)", color: "var(--bg)" }}>
                DW
              </div>
              <div className={styles.cName}>David</div>
            </div>
            <div className={styles.contact}>
              <button className={styles.cAdd}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </button>
              <div className={styles.cName}>Add</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
