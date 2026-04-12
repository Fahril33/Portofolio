import { useEffect, useState } from "react";

export const navigateTo = (path: string) => {
  if (typeof window === "undefined") return;
  if (!path.startsWith("/")) return;
  if (window.location.pathname === path) return;

  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  window.scrollTo({ top: 0 });
};

export const usePathname = () => {
  const [pathname, setPathname] = useState(() =>
    typeof window === "undefined" ? "/" : window.location.pathname
  );

  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return pathname;
};

