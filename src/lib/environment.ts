// Padrões de URL que identificam ambiente interno do Lovable
const INTERNAL_URL_PATTERNS = [
  /^https?:\/\/id-preview--[a-z0-9-]+\.lovable\.app/i,  // Preview Lovable
  /^https?:\/\/localhost(:\d+)?/i,                       // Localhost
  /^https?:\/\/127\.0\.0\.1(:\d+)?/i,                   // Localhost IP
  /^https?:\/\/.*\.lovable\.dev/i,                      // Lovable Dev
];

// URL de produção permitida
const PRODUCTION_URL = "https://codigolupin.lovable.app";

/**
 * Detecta se o acesso está sendo feito em ambiente interno (Lovable preview/dev)
 * @returns true se for acesso interno (não deve ser rastreado)
 */
export function isInternalAccess(): boolean {
  if (typeof window === "undefined") return true; // SSR = interno
  
  const origin = window.location.origin;
  
  // 1. Verificar se está em iframe (editor Lovable)
  if (window.parent !== window) {
    // Está em iframe - verificar se é Lovable
    try {
      if (document.referrer.includes("lovable.dev")) {
        return true;
      }
    } catch {
      // Cross-origin - pode ser embed externo, permitir
    }
  }
  
  // 2. Verificar padrões de URL internos
  for (const pattern of INTERNAL_URL_PATTERNS) {
    if (pattern.test(origin)) {
      return true;
    }
  }
  
  // 3. Verificar se NÃO é a URL de produção conhecida
  // (proteção extra contra novos domínios de preview)
  if (!origin.startsWith(PRODUCTION_URL.replace(/\/$/, ""))) {
    // Não é produção - considerar interno por segurança
    // Exceto se for domínio customizado (verificar se tem lovable no nome)
    if (origin.includes("lovable")) {
      return true;
    }
  }
  
  return false;
}

/**
 * Retorna informações do ambiente atual para debugging
 */
export function getEnvironmentInfo(): {
  isInternal: boolean;
  origin: string;
  inIframe: boolean;
  referrer: string;
} {
  if (typeof window === "undefined") {
    return { isInternal: true, origin: "ssr", inIframe: false, referrer: "" };
  }
  
  return {
    isInternal: isInternalAccess(),
    origin: window.location.origin,
    inIframe: window.parent !== window,
    referrer: document.referrer,
  };
}
