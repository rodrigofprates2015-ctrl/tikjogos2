import {
  AdMob,
  AdmobConsentStatus,
  InterstitialAdPluginEvents,
} from "@capacitor-community/admob";
import { isNativeApp } from "@/lib/nativeApp";

const ANDROID_TEST_INTERSTITIAL_ID =
  "ca-app-pub-3940256099942544/1033173712";

const configuredInterstitialId = import.meta.env.VITE_ADMOB_INTERSTITIAL_ID?.trim();
const interstitialId = configuredInterstitialId || ANDROID_TEST_INTERSTITIAL_ID;
const isTesting = !configuredInterstitialId;

let initialization: Promise<void> | null = null;

async function initializeNativeAdMob(): Promise<void> {
  if (!isNativeApp()) return;
  if (initialization) return initialization;

  initialization = (async () => {
    await AdMob.initialize({ initializeForTesting: isTesting });

    // Google UMP: if a consent message is configured in AdMob, display it
    // before requesting the first ad. Outside applicable regions this is a no-op.
    let consent = await AdMob.requestConsentInfo();
    if (
      !consent.canRequestAds &&
      consent.isConsentFormAvailable &&
      consent.status === AdmobConsentStatus.REQUIRED
    ) {
      consent = await AdMob.showConsentForm();
    }

    if (!consent.canRequestAds) {
      throw new Error("AdMob consent does not allow ad requests yet.");
    }
  })();

  return initialization;
}

/**
 * Shows a native full-screen ad and resolves only after it is dismissed.
 * During development the official Google test unit is always used.
 */
export async function showNativeInterstitial(): Promise<void> {
  await initializeNativeAdMob();

  const dismissed = await AdMob.addListener(
    InterstitialAdPluginEvents.Dismissed,
    () => finish(),
  );
  const failed = await AdMob.addListener(
    InterstitialAdPluginEvents.FailedToShow,
    () => finish(),
  );

  let settled = false;
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let resolveFinished: (() => void) | undefined;

  const cleanup = async () => {
    if (timeoutId) clearTimeout(timeoutId);
    await Promise.allSettled([dismissed.remove(), failed.remove()]);
  };

  function finish() {
    if (settled) return;
    settled = true;
    void cleanup().finally(() => resolveFinished?.());
  }

  const finished = new Promise<void>((resolve) => {
    resolveFinished = resolve;
    timeoutId = setTimeout(finish, 45_000);
  });

  try {
    await AdMob.prepareInterstitial({
      adId: interstitialId,
      isTesting,
      immersiveMode: true,
    });
    await AdMob.showInterstitial();
    await finished;
  } catch (error) {
    finish();
    await finished;
    throw error;
  }
}
