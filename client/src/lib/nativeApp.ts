import { Capacitor } from "@capacitor/core";

export function isNativeApp(): boolean {
  if (Capacitor.isNativePlatform()) return true;
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("nativeapp") === "1";
}

