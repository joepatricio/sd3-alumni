/**
 * Device capability and low-power detection utility.
 * Evaluates UserAgent, mobile Client Hints, CPU concurrency,
 * device memory, data saver preferences, and WebGL GPU renderer
 * to identify devices with constrained graphical capabilities.
 */

import { useState, useEffect } from "react";

export interface DeviceCapabilities {
  /** Whether the device is a mobile or tablet based on UserAgent, touch, or client hints */
  isMobile: boolean;
  /** Whether the screen viewport is narrow (< 768px) */
  isSmallScreen: boolean;
  /**
   * Whether the device has constrained graphical or computational capabilities:
   * triggers on mobile devices, tablets, low CPU cores (<= 4), low RAM (<= 4GB),
   * software/low-end GPU renderers, data saver mode, or reduced motion.
   */
  isLowPower: boolean;
}

let cachedCapabilities: DeviceCapabilities | null = null;

export function getDeviceCapabilities(): DeviceCapabilities {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {
      isMobile: false,
      isSmallScreen: false,
      isLowPower: false,
    };
  }

  const isSmallScreen = window.innerWidth < 768;

  // If already calculated, reuse cached hardware/UA signals and only update dynamic viewport
  if (cachedCapabilities) {
    return {
      ...cachedCapabilities,
      isSmallScreen,
    };
  }

  // 1. User Agent & Touch checks
  const ua = navigator.userAgent || navigator.vendor || (window as unknown as { opera?: string }).opera || "";
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua);
  // iPadOS 13+ reports "Macintosh" in userAgent, but has touch points > 1
  const isIPadOS = /Macintosh/i.test(ua) && typeof navigator.maxTouchPoints === "number" && navigator.maxTouchPoints > 1;
  const isClientHintsMobile = Boolean(
    (navigator as unknown as { userAgentData?: { mobile?: boolean } }).userAgentData?.mobile
  );
  const isMobile = isMobileUA || isIPadOS || isClientHintsMobile;

  // 2. Hardware constraints (Concurrency & Device Memory)
  // Low concurrency: 4 cores or fewer (standard mobile or entry-level desktop)
  const concurrency = typeof navigator.hardwareConcurrency === "number" ? navigator.hardwareConcurrency : 8;
  const isLowConcurrency = concurrency > 0 && concurrency <= 4;

  // Device memory in GB (Chrome/Edge/Android)
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
  const isLowMemory = typeof mem === "number" && mem > 0 && mem <= 4;

  // 3. User Preference constraints
  const isSaveData = Boolean(
    (navigator as unknown as { connection?: { saveData?: boolean } }).connection?.saveData
  );
  const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 4. WebGL GPU renderer check (detect software or weak mobile GPUs)
  let isLowEndGPU = false;
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (gl) {
      const ext = gl.getExtension("WEBGL_debug_renderer_info");
      if (ext) {
        const renderer = (gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) as string | undefined)?.toLowerCase() || "";
        if (
          renderer.includes("swiftshader") ||
          renderer.includes("llvmpipe") ||
          renderer.includes("software") ||
          renderer.includes("mali-4") ||
          renderer.includes("mali-t") ||
          renderer.includes("adreno 3") ||
          renderer.includes("adreno (tm) 3") ||
          renderer.includes("powervr sgx")
        ) {
          isLowEndGPU = true;
        }
      }
      const loseExt = gl.getExtension("WEBGL_lose_context") as { loseContext: () => void } | null;
      if (loseExt) loseExt.loseContext();
    }
  } catch {
    // Ignore WebGL detection errors
  }

  // A device is classified as low power if it is a mobile device,
  // has low hardware resources, has an entry-level GPU, or has low-power/data-saver enabled.
  const isLowPower = isMobile || isLowConcurrency || isLowMemory || isSaveData || isReducedMotion || isLowEndGPU;

  cachedCapabilities = {
    isMobile,
    isSmallScreen,
    isLowPower,
  };

  return cachedCapabilities;
}

/**
 * React hook to access real-time device capabilities and power tier.
 * Updates dynamically on window resize / orientation change.
 */
export function useDeviceCapabilities(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>(() => getDeviceCapabilities());

  useEffect(() => {
    const update = () => {
      setCapabilities(getDeviceCapabilities());
    };
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);

  return capabilities;
}

