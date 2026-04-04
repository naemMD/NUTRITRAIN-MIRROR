import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type InstallState =
  | "hidden"         // not on web, or already installed, or desktop
  | "ios"            // iOS Safari — manual share instructions
  | "android-ready"  // beforeinstallprompt fired — one-tap install available
  | "android-manual" // mobile Chrome/browser but prompt not (yet) available
  | "installed"      // user accepted install
  | "dismissed";     // user dismissed the banner

export function useInstallPrompt() {
  const [state, setState] = useState<InstallState>("hidden");
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    // Already running as installed PWA
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true
    ) {
      setState("installed");
      return;
    }

    const ua = navigator.userAgent;

    // Detect iOS
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    // Detect mobile (but not iOS)
    const isMobileAndroid = /Android/i.test(ua);
    const isMobile = isIOS || isMobileAndroid || /Mobile/i.test(ua);

    // Desktop — don't show banner
    if (!isMobile) {
      setState("hidden");
      return;
    }

    // iOS Safari — always show manual instructions
    if (isIOS) {
      setState("ios");
      return;
    }

    // Android/mobile — start with manual, upgrade if prompt fires
    setState("android-manual");

    const onPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setState("android-ready");
    };

    const onInstalled = () => {
      deferredPrompt.current = null;
      setState("installed");
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt.current) return;
    await deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    setState(outcome === "accepted" ? "installed" : "dismissed");
    deferredPrompt.current = null;
  }, []);

  return {
    state,
    /** true when the banner should be visible */
    canShow: state === "ios" || state === "android-ready" || state === "android-manual",
    /** true if one-tap native install is available */
    canNativeInstall: state === "android-ready",
    /** true if we need to show iOS share instructions */
    isIOS: state === "ios",
    /** true if Android but no native prompt — show manual instructions */
    isAndroidManual: state === "android-manual",
    /** Trigger the native Chrome install prompt */
    promptInstall,
  };
}
