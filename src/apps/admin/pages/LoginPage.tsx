import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightToBracket,
  faCircleExclamation,
  faCircleNotch,
  faEnvelope,
  faEye,
  faEyeSlash,
  faLock,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import {
  clearEnteringLogin,
  isEnteringLoginActive,
} from "../../../lib/navigation";
import { useLogoLaunch } from "./hooks/useLogoLaunch";
import { useParticles } from "./hooks/useParticles";
import "./styles/login.css";

export interface LoginPageProps {
  configured: boolean;
  envMode: string;
  missingEnv: string[];
  busy: boolean;
  error: string | null;
  onLogin: (email: string, password: string) => Promise<void>;
  onBack: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({
  configured,
  envMode,
  missingEnv,
  busy,
  error,
  onLogin,
  onBack,
}: LoginPageProps): React.JSX.Element => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isEntering, setIsEntering] = useState<boolean>(() =>
    isEnteringLoginActive(),
  );
  const { clickCount, handleLogoClick } = useLogoLaunch(onBack);

  useParticles("login-particles");

  useEffect(() => {
    const handleEnterEvent = (): void => {
      setIsEntering(true);
    };

    window.addEventListener("admin-enter-login", handleEnterEvent);
    return () =>
      window.removeEventListener("admin-enter-login", handleEnterEvent);
  }, []);

  useEffect(() => {
    if (!isEntering) return;
    const t = window.setTimeout(() => {
      setIsEntering(false);
      clearEnteringLogin();
    }, 1500);
    return () => window.clearTimeout(t);
  }, [isEntering]);

  const handleBrandLogoClick = (): void => {
    if (isEntering) return;
    handleLogoClick();
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setPassword(e.target.value);
  };

  const handleTogglePasswordVisibility = (): void => {
    setShowPassword((prev) => !prev);
  };

  const handleFormSubmit: React.FormEventHandler<HTMLFormElement> = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    try {
      await onLogin(email.trim(), password);
    } catch {
      // Handled via props
    }
  };

  return (
    <main className="authShell">
      <div id="login-particles" className="authParticles" aria-hidden="true" />
      <section className="authCard" aria-label="Admin Login">
        <header className="authHeader">
          <h1 className="authTitle">Welcome.</h1>
          <button
            type="button"
            className={`brandBackBtn ${clickCount === 3 ? "launching" : ""} ${isEntering ? "entering-from-portfolio" : ""}`}
            onClick={handleBrandLogoClick}
            aria-label="Back to Portfolio"
            title="Back to Portfolio"
          >
            <span
              className={`logo-char char-1 ${clickCount >= 3 ? "active" : ""}`}
            >
              &lt;
            </span>
            <span
              className={`logo-char char-2 ${clickCount >= 2 ? "active" : ""}`}
            >
              /
            </span>
            <span
              className={`logo-char char-3 ${clickCount >= 1 ? "active" : ""}`}
            >
              &gt;
            </span>
          </button>
        </header>

        {error && (
          <div className="authError" role="alert">
            <FontAwesomeIcon icon={faCircleExclamation} className="alertIcon" />
            <span>{error}</span>
          </div>
        )}

        {!configured && (
          <div className="authWarning" role="alert">
            <FontAwesomeIcon
              icon={faTriangleExclamation}
              className="alertIcon"
            />
            <div className="authWarningContent">
              <strong>Supabase Not Connected</strong>
              <span>
                Missing: {missingEnv.join(", ") || "-"} ({envMode})
              </span>
            </div>
          </div>
        )}

        <form className="authForm" onSubmit={handleFormSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <div className="inputWrapper">
              <FontAwesomeIcon icon={faEnvelope} className="inputIcon" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                value={email}
                onChange={handleEmailChange}
                placeholder="name@email.com"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="inputWrapper">
              <FontAwesomeIcon icon={faLock} className="inputIcon" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
              />
              <button
                className="togglePasswordBtn"
                type="button"
                onClick={handleTogglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          <button className="primaryBtn" type="submit" disabled={busy}>
            {busy ? (
              <>
                <FontAwesomeIcon icon={faCircleNotch} spin />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <FontAwesomeIcon icon={faArrowRightToBracket} />
              </>
            )}
          </button>
        </form>
      </section>
    </main>
  );
};

export default LoginPage;
