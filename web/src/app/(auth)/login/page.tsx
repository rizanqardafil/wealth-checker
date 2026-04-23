"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import styles from "../auth.module.css";

const LoginSchema = z.object({
  email: z.string().email("Email harus valid"),
  password: z.string().min(1, "Password diperlukan"),
});

type LoginInput = z.infer<typeof LoginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Login gagal. Coba lagi.");
        return;
      }

      localStorage.setItem("user_email", data.email);
      localStorage.setItem("user_id", result.data?.user?.id || "");
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <h1>Welcome</h1>
      </div>

      {/* ── Card ── */}
      <div className={styles.card}>
        {error && <div className={styles.errorMsg}>{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className={styles.formFieldsGrid}>
          {/* Email */}
          <div className={styles.field}>
            <label className={styles.label}>Username Or Email</label>
            <div className={styles.inputWrap}>
              <input
                type="email"
                {...register("email")}
                placeholder="example@example.com"
                autoComplete="email"
                className={`${styles.input} ${styles.inputSmall} ${errors.email ? styles.error : ""}`}
              />
            </div>
            {errors.email && <p className={styles.fieldError}>{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrap}>
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder="••••••••"
                autoComplete="current-password"
                className={`${styles.input} ${errors.password ? styles.error : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.eyeBtn}
                aria-label="Toggle password"
              >
                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
              </button>
            </div>
            {errors.password && <p className={styles.fieldError}>{errors.password.message}</p>}
          </div>
        </form>

        {/* ── Actions ── */}
        <div className={styles.actions}>
          {/* Log In */}
          <button
            type="button"
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            {isLoading ? "Memproses..." : "Log In"}
          </button>

          {/* Forgot */}
          <Link href="/forgot-password" className={styles.forgot}>
            Forgot Password?
          </Link>

          {/* Sign Up */}
          <button
            type="button"
            onClick={() => router.push("/signup")}
            className={`${styles.btn} ${styles.btnOutline}`}
          >
            Sign Up
          </button>

          {/* Fingerprint */}
          <p className={styles.fingerprintRow}>
            Use{" "}
            <span onClick={() => console.log("Fingerprint auth")}>
              Fingerprint
            </span>{" "}
            To Access
          </p>
        </div>

        {/* ── Divider ── */}
        <div className={styles.dividerRow}>
          <div className={styles.dividerLine} />
          <span className={styles.dividerText}>or sign up with</span>
          <div className={styles.dividerLine} />
        </div>

        {/* ── Social ── */}
        <div className={styles.socialRow}>
          {/* Facebook */}
          <button type="button" className={styles.socialBtn} title="Facebook">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </button>

          {/* Google */}
          <button type="button" className={styles.socialBtn} title="Google">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Bottom prompt ── */}
      <p className={styles.signupPrompt}>
        Don&apos;t have an account?{" "}
        <Link href="/signup">Sign Up</Link>
      </p>
    </div>
  );
}
