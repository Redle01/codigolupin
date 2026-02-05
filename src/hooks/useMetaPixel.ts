import { useCallback } from "react";

// Declaração global para TypeScript
declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

const META_PIXEL_ID = "1585747689119987";

// Função auxiliar para hash SHA-256 (exigido pelo Meta para Advanced Matching)
async function hashValue(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export function useMetaPixel() {
  // PageView - disparar em cada página do funil
  const trackPageView = useCallback(() => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "PageView");
    }
  }, []);

  // Custom Event: Chegou no Checkout - disparar antes do redirecionamento
  const trackChegouCheckout = useCallback((data?: {
    result_type?: string;
    offer_flow?: number;
  }) => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("trackCustom", "ChegouNoCheckout", {
        result_type: data?.result_type,
        offer_flow: data?.offer_flow,
      });
    }
  }, []);

  // Associar visitor_id ao pixel para tracking avançado
  const setExternalId = useCallback((visitorId: string) => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("init", META_PIXEL_ID, {
        external_id: visitorId,
      });
    }
  }, []);

  // Inicializar com dados do usuário para Advanced Matching
  const initWithUser = useCallback(async (userData: {
    visitorId: string;
    email?: string;
  }) => {
    if (typeof window !== "undefined" && window.fbq) {
      const advancedMatchingData: Record<string, string> = {
        external_id: userData.visitorId,
      };

      if (userData.email) {
        advancedMatchingData.em = await hashValue(userData.email);
      }

      window.fbq("init", META_PIXEL_ID, advancedMatchingData);
    }
  }, []);

  return {
    trackPageView,
    trackChegouCheckout,
    setExternalId,
    initWithUser,
  };
}
