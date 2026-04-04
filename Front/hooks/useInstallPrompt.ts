import { useCallback, useEffect, useRef, useState } from "react";

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

function isRunningOnWeb(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

export function useInstallPrompt() {
  const [state, setState] = useState<InstallState>("hidden");
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (!isRunningOnWeb()) return;

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

    // Detect Android
    const isAndroid = /Android/i.test(ua);

    // Detect any mobile browser
    const isMobile =
      isIOS ||
      isAndroid ||
      /webOS|BlackBerry|Opera Mini|IEMobile|Mobile/i.test(ua) ||
      (navigator.maxTouchPoints > 0 && window.innerWidth < 768);

    // Desktop — don't show banner
    if (!isMobile) {
      setState("hidden");
      return;
    }

    // iOS — always show manual share instructions
    if (isIOS) {
      setState("ios");
      return;
    }

    // Android/other mobile — start with manual, upgrade if native prompt fires
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
