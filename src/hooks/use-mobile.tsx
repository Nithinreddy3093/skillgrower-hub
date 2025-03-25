import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768; // Define mobile width threshold

export function useIsMobile() {
  const getIsMobile = () => window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;

  const [isMobile, setIsMobile] = useState<boolean | undefined>(
    typeof window !== "undefined" ? getIsMobile() : undefined
  );

  useEffect(() => {
    if (typeof window === "undefined") return; // Prevents issues in SSR environments

    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const handleChange = () => setIsMobile(mediaQuery.matches);

    // Initial check
    setIsMobile(mediaQuery.matches);

    // Add event listener for changes
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return isMobile;
}

