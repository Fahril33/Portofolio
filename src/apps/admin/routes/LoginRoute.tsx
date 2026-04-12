import React, { useState } from "react";
import { navigateTo } from "../../../lib/navigation";
import { useAuth } from "../lib/auth";
import LoginPage from "../pages/LoginPage";

const LoginRoute: React.FC = () => {
  const auth = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (auth.status === "admin") {
      navigateTo("/lead");
    }
  }, [auth.status]);

  const onLogin = async (email: string, password: string) => {
    setError(null);
    setBusy(true);
    try {
      await auth.login(email, password);
      navigateTo("/lead");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login gagal.");
    } finally {
      setBusy(false);
    }
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
      onLogin={onLogin}
      onBack={() => navigateTo("/")}
    />
  );
};

export default LoginRoute;
