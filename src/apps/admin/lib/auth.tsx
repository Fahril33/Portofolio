import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getSupabaseEnvStatus,
  getValidAccessToken,
  isAdmin as checkIsAdmin,
  signInWithPassword,
  signOut,
} from "../../../lib/supabaseRest";

export type AuthStatus = "loading" | "anonymous" | "member" | "admin";

export interface AuthContextValue {
  status: AuthStatus;
  configured: boolean;
  envMissing: string[];
  envMode: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
}: AuthProviderProps): React.JSX.Element => {
  const env = useMemo(() => getSupabaseEnvStatus(), []);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect((): (() => void) => {
    if (!env.configured) {
      setStatus("anonymous");
      return (): void => {};
    }

    let cancelled = false;
    const init = async (): Promise<void> => {
      const token = await getValidAccessToken();
      if (cancelled) return;
      if (!token) {
        setStatus("anonymous");
        return;
      }

      const admin = await checkIsAdmin();
      if (cancelled) return;
      setStatus(admin ? "admin" : "member");
    };

    void init();
    return (): void => {
      cancelled = true;
    };
  }, [env.configured]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      configured: env.configured,
      envMissing: env.missing,
      envMode: env.mode,
      login: async (email: string, password: string): Promise<void> => {
        if (!env.configured) throw new Error("Supabase env belum terdeteksi.");
        setStatus("loading");
        try {
          await signInWithPassword(email, password);
          const admin = await checkIsAdmin();
          if (!admin) {
            await signOut();
            setStatus("anonymous");
            throw new Error(
              "Akun ini belum terdaftar sebagai admin. Tambahkan user_id ke tabel public.admin_users dulu."
            );
          }
          setStatus("admin");
        } catch (err) {
          setStatus("anonymous");
          throw err;
        }
      },
      logout: async (): Promise<void> => {
        setStatus("loading");
        try {
          await signOut();
        } finally {
          setStatus("anonymous");
        }
      },
      getAccessToken: async (): Promise<string | null> => {
        if (!env.configured) return null;
        return await getValidAccessToken();
      },
    }),
    [env.configured, env.missing, env.mode, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
