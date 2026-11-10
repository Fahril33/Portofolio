import { useEffect, useState } from "react";

const RETURN_KEY = "portfolio_return_from_login_ts";
const ENTER_LOGIN_KEY = "admin_enter_login_ts";
let returnTimestamp = 0;
let enterLoginTimestamp = 0;

export const setReturningFromLogin = (val: boolean): void => {
  if (typeof window !== "undefined") {
    if (val) {
      returnTimestamp = Date.now() + 2500;
      window.sessionStorage.setItem(RETURN_KEY, String(returnTimestamp));
      window.dispatchEvent(new CustomEvent("portfolio-return-from-login"));
    } else {
      returnTimestamp = 0;
      window.sessionStorage.removeItem(RETURN_KEY);
    }
  }
};

export const isReturningFromLoginActive = (): boolean => {
  if (typeof window === "undefined") return false;
  const now = Date.now();
  if (returnTimestamp > now) return true;
  const stored = window.sessionStorage.getItem(RETURN_KEY);
  if (stored) {
    const exp = Number(stored);
    if (Number.isFinite(exp) && exp > now) {
      return true;
    }
    window.sessionStorage.removeItem(RETURN_KEY);
  }
  return false;
};

export const clearReturningFromLogin = (): void => {
  returnTimestamp = 0;
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(RETURN_KEY);
  }
};

export const setEnteringLogin = (val: boolean): void => {
  if (typeof window !== "undefined") {
    if (val) {
      enterLoginTimestamp = Date.now() + 2500;
      window.sessionStorage.setItem(ENTER_LOGIN_KEY, String(enterLoginTimestamp));
      window.dispatchEvent(new CustomEvent("admin-enter-login"));
    } else {
      enterLoginTimestamp = 0;
      window.sessionStorage.removeItem(ENTER_LOGIN_KEY);
    }
  }
};

export const isEnteringLoginActive = (): boolean => {
  if (typeof window === "undefined") return false;
  const now = Date.now();
  if (enterLoginTimestamp > now) return true;
  const stored = window.sessionStorage.getItem(ENTER_LOGIN_KEY);
  if (stored) {
    const exp = Number(stored);
    if (Number.isFinite(exp) && exp > now) {
      return true;
    }
    window.sessionStorage.removeItem(ENTER_LOGIN_KEY);
  }
  return false;
};

export const clearEnteringLogin = (): void => {
  enterLoginTimestamp = 0;
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(ENTER_LOGIN_KEY);
  }
};

export const consumeReturningFromLogin = (): boolean => {
  return isReturningFromLoginActive();
};

export const navigateTo = (path: string): void => {
  if (typeof window === "undefined") return;
  if (!path.startsWith("/")) return;
  if (window.location.pathname === path) return;

  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0 });
};

export const navigateWithSlide = (
  path: string,
  direction: "forward" | "backward" = "forward"
): void => {
  if (typeof window === "undefined") return;
  if (!path.startsWith("/")) return;
  if (window.location.pathname === path) return;

  if (direction === "backward" && path === "/") {
    setReturningFromLogin(true);
  }
  if (path === "/login") {
    setEnteringLogin(true);
  }

  window.dispatchEvent(
    new CustomEvent("page-slide-transition", {
      detail: { targetPath: path, direction },
    })
  );
};

export const usePathname = (): string => {
  const [pathname, setPathname] = useState<string>(() =>
    typeof window === "undefined" ? "/" : window.location.pathname
  );

  useEffect(() => {
    const onPopState = (): void => setPathname(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return pathname;
};
