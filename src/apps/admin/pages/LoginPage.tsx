import React, { useState } from "react";
import "./styles/login.css";

type LoginPageProps = {
  configured: boolean;
  envMode: string;
  missingEnv: string[];
  busy: boolean;
  error: string | null;
  onLogin: (email: string, password: string) => Promise<void>;
  onBack: () => void;
};

const LoginPage: React.FC<LoginPageProps> = ({
  configured,
  envMode,
  missingEnv,
  busy,
  error,
  onLogin,
  onBack,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    await onLogin(email.trim(), password);
  };

  return (
    <main className="authShell">
      <section className="authCard" aria-label="Login">
        <div className="authHeader">
          <div className="brandMark">
            {"</"}
            <span>{">"}</span>
          </div>
          <a
            className="authBack"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onBack();
            }}
          >
            Back to portfolio
          </a>
        </div>

        <h1 className="authTitle">Selamat datang kembali</h1>
        <p className="authSubtitle">
          Login untuk mengelola konten portofolio secara remote melalui <b>Lead Page</b>.
          Desainnya tetap hangat, simple, dan konsisten dengan tema sebelumnya.
        </p>

        <form className="authForm" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="field">
            <div className="rowSplit">
              <label htmlFor="password">Password</label>
              <button
                className="toggle"
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-pressed={showPassword}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button className="primaryBtn" type="submit" disabled={busy}>
            {busy ? "Signing in..." : "Login"}
          </button>
        </form>

        {!configured ? (
          <div className="authNote">
            Supabase env belum terdeteksi ({envMode}). Missing: {missingEnv.join(", ") || "-"}
            <br />
            Pastikan kamu restart `npm run dev` setelah mengubah `.env`.
            <br />
            <br />
            Format `.env`:
            <br />
            `VITE_SUPABASE_URL=...`
            <br />
            `VITE_SUPABASE_ANON_KEY=...`
          </div>
        ) : null}

        {error ? <div className="authError">{error}</div> : null}
      </section>
    </main>
  );
};

export default LoginPage;
