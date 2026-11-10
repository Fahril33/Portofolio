import React, { useState } from "react";
import { navigateTo, navigateWithSlide } from "../../../lib/navigation";
import { useAuth } from "../lib/auth";
import LoginPage from "../pages/LoginPage";

export default function LoginRoute(): React.JSX.Element | null {
  const auth = useAuth();
  const [busy, setBusy] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect((): void => {
    if (auth.status === "admin") {
      navigateTo("/lead");
    }
  }, [auth.status]);

  const handleLoginSubmit = async (email: string, password: string): Promise<void> => {
    setError(null);
    setBusy(true);
    try {
      await auth.login(email, password);
      navigateTo("/lead");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Login gagal.");
    } finally {
      setBusy(false);
    }
  };

  const handleBackToPortfolio = (): void => {
    navigateWithSlide("/", "backward");
  };

  if (auth.status === "loading" && !busy) {
    return null; // Initial session check, wait gracefully
  }

  if (auth.status === "admin") {
    // Already redirecting via useEffect, don't show the login form
    return null;
  }

  return (
    <LoginPage
      configured={auth.configured}
      envMode={auth.envMode}
      missingEnv={auth.envMissing}
      busy={busy}
      error={error}
      onLogin={handleLoginSubmit}
      onBack={handleBackToPortfolio}
    />
  );
}
