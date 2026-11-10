import { useEffect, useRef, useState } from "react";

export interface UseLogoLaunchResult {
  clickCount: number;
  handleLogoClick: () => void;
}

export const useLogoLaunch = (onLaunch: () => void): UseLogoLaunchResult => {
  const [clickCount, setClickCount] = useState<number>(0);
  const clickTimer = useRef<number | null>(null);
  const isCooldown = useRef<boolean>(false);
  const logoClick = useRef<{ count: number; lastAt: number }>({
    count: 0,
    lastAt: 0,
  });

  const handleLogoClick = (): void => {
    if (isCooldown.current) return;

    const now = Date.now();
    const within = now - logoClick.current.lastAt < 600;
    const nextCount = within ? logoClick.current.count + 1 : 1;
    logoClick.current.count = nextCount;
    logoClick.current.lastAt = now;

    setClickCount(nextCount);

    if (clickTimer.current != null) {
      window.clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }

    if (nextCount >= 3) {
      isCooldown.current = true;
      logoClick.current.count = 0;

      // After launch animation, trigger slide page transition
      window.setTimeout(() => {
        onLaunch();
      }, 1100);
      return;
    }

    clickTimer.current = window.setTimeout(() => {
      logoClick.current.count = 0;
      // Start cooldown during fadeout back to white
      isCooldown.current = true;
      setClickCount(0);
      window.setTimeout(() => {
        isCooldown.current = false;
      }, 600);
    }, 600);
  };

  useEffect(() => {
    return (): void => {
      if (clickTimer.current != null) {
        window.clearTimeout(clickTimer.current);
      }
    };
  }, []);

  return {
    clickCount,
    handleLogoClick,
  };
};

