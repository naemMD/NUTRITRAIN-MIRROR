import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type InstallState =
  | "idle"           // no prompt available yet
  | "available"      // Android/Chrome: beforeinstallprompt fired
  | "ios"            // iOS Safari: manual instructions needed
  | "installed"      // user accepted or app is already installed
  | "dismissed";     // user dismissed the prompt

export function useInstallPrompt() {
  const [state, setState] = useState<InstallState>("idle");
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Only run on web
    if (Platform.OS !== "web") return;

    // Check if already installed (display-mode: standalone)
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true
    ) {
      setState("installed");
      return;
    }

    // Detect iOS Safari (no beforeinstallprompt support)
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isSafari =
      /Safari/.test(navigator.userAgent) &&
      !/CriOS|FxiOS|Chrome/.test(navigator.userAgent);

    if (isIOS && isSafari) {
      setState("ios");
      return;
    }

    // Android / Chrome / Edge — listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setState("available");
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Listen for successful install
    window.addEventListener("appinstalled", () => {
      deferredPrompt.current = null;
      setState("installed");
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt.current) return;

    await deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;

    if (outcome === "accepted") {
      setState("installed");
    } else {
      setState("dismissed");
    }
    deferredPrompt.current = null;
  }, []);

  return {
    /** Current install state */
    state,
    /** true if we can show an install button/banner */
    canPrompt: state === "available" || state === "ios",
    /** true if we need to show iOS-specific instructions instead of a button */
    isIOS: state === "ios",
    /** Trigger the native install prompt (Android/Chrome only) */
    promptInstall,
  };
}
