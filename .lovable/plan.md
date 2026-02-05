

# Plano: Excluir Acessos Internos das Métricas do Funil

## Análise do Problema

Atualmente, todos os acessos ao funil são contabilizados nas métricas, incluindo:
- Acessos via ambiente de preview do Lovable (`id-preview--*.lovable.app`)
- Testes feitos pelo administrador durante desenvolvimento
- Navegações internas durante edição do projeto

Isso causa inflação de métricas e distorção das taxas de conversão reais.

---

## Estratégia de Detecção

### Método 1: Detecção por URL (Cliente)

O ambiente Lovable tem URLs características que podem ser detectadas:

| Ambiente | Padrão de URL |
|----------|---------------|
| **Preview Lovable** | `id-preview--*.lovable.app` |
| **Publicado** | `codigolupin.lovable.app` ou domínio customizado |
| **Localhost** | `localhost:*` |

### Método 2: Detecção por Parâmetros de Embed (Cliente)

O Lovable injeta o app dentro de um iframe com parâmetros específicos. Podemos detectar:
- `window.parent !== window` (está em iframe)
- Referrer contendo `lovable.dev`

### Método 3: Validação no Backend (Edge Function)

Adicionar validação na Edge Function para rejeitar tracking de origens internas baseado no header `Origin` ou `Referer`.

---

## Implementação Escolhida

Implementar **verificação híbrida** (cliente + servidor) para máxima segurança:

1. **Cliente**: Função `isInternalAccess()` que detecta ambiente interno
2. **Cliente**: Bloquear `trackPageView` e `trackMetaPageView` se for acesso interno
3. **Backend**: Validar origem no Edge Function `quiz-metrics` e `quiz-submit-email`

---

## Arquivos a Modificar

| Arquivo | Tipo de Alteração |
|---------|-------------------|
| `src/lib/environment.ts` | **NOVO** - Função utilitária para detectar ambiente interno |
| `src/hooks/useFunnelMetrics.ts` | Adicionar verificação antes de enviar tracking |
| `src/components/quiz/Quiz.tsx` | Bloquear Meta Pixel PageView em ambiente interno |
| `src/hooks/useQuiz.ts` | Bloquear submissão de lead em ambiente interno |
| `supabase/functions/quiz-metrics/index.ts` | Validar origem no backend (track action) |
| `supabase/functions/quiz-submit-email/index.ts` | Validar origem no backend |

---

## Detalhes de Implementação

### 1. Criar Utilitário de Detecção de Ambiente (`src/lib/environment.ts`)

```typescript
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
  
  const currentUrl = window.location.href;
  const origin = window.location.origin;
  
  // 1. Verificar se está em iframe (editor Lovable)
  if (window.parent !== window) {
    // Está em iframe - verificar se é Lovable
    try {
      // Tentativa de acessar parent vai falhar se for cross-origin
      // Se for Lovable, o parent é lovable.dev
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
```

### 2. Modificar `useFunnelMetrics.ts` - Bloquear Tracking Interno

```typescript
import { isInternalAccess } from "@/lib/environment";

// Na função trackPageView:
const trackPageView = useCallback((page: keyof FunnelMetrics["pageViews"]) => {
  // Não rastrear acessos internos (Lovable preview/admin)
  if (isInternalAccess()) {
    console.debug("[Metrics] Skipping internal access tracking");
    return;
  }
  
  const visitorId = getOrCreateVisitorId();
  
  scheduleIdleWork(() => {
    sendTrackingEvent(visitorId, page);
  });
}, []);
```

### 3. Modificar `Quiz.tsx` - Bloquear Meta Pixel em Ambiente Interno

```typescript
import { isInternalAccess } from "@/lib/environment";

// No useEffect de tracking:
useEffect(() => {
  // Não rastrear em ambiente interno
  if (isInternalAccess()) {
    console.debug("[Quiz] Skipping tracking in internal environment");
    return;
  }

  let currentPage: string;
  // ... resto da lógica
  
  if (currentPage !== lastTrackedPage.current) {
    trackPageView(currentPage as keyof typeof metrics.pageViews);
    trackMetaPageView();
    lastTrackedPage.current = currentPage;
  }
}, [state.currentStep, state.currentQuestion, trackPageView, trackMetaPageView]);

// No useEffect de inicialização do Meta Pixel:
useEffect(() => {
  // Não inicializar Meta Pixel em ambiente interno
  if (isInternalAccess()) return;
  
  if (!pixelInitializedRef.current) {
    const visitorId = getOrCreateVisitorId();
    setExternalId(visitorId);
    pixelInitializedRef.current = true;
  }
}, [setExternalId]);
```

### 4. Modificar `useQuiz.ts` - Bloquear Leads Internos

```typescript
import { isInternalAccess } from "@/lib/environment";

// Na função submitEmail:
const submitEmail = useCallback(async () => {
  if (!state.email) return false;
  
  // Não salvar leads em ambiente interno
  if (isInternalAccess()) {
    console.debug("[Quiz] Skipping email submission in internal environment");
    setState((prev) => ({ ...prev, isSubmitting: false }));
    return true; // Simular sucesso para continuar o fluxo
  }
  
  setState((prev) => ({ ...prev, isSubmitting: true }));
  // ... resto da lógica
}, [state.email, state.answers, state.offerFlow]);
```

### 5. Edge Function `quiz-metrics` - Validação de Origem

```typescript
// No início da função, antes de processar "track" action:
if (action === "track") {
  const origin = req.headers.get("origin") || "";
  const referer = req.headers.get("referer") || "";
  
  // Lista de origens permitidas (produção)
  const ALLOWED_ORIGINS = [
    "https://codigolupin.lovable.app",
    // Adicionar domínios customizados se houver
  ];
  
  // Lista de padrões de origens bloqueadas (interno)
  const BLOCKED_PATTERNS = [
    /id-preview--.*\.lovable\.app/i,
    /localhost/i,
    /127\.0\.0\.1/i,
    /\.lovable\.dev/i,
  ];
  
  // Verificar se origem é bloqueada
  const isBlocked = BLOCKED_PATTERNS.some(pattern => 
    pattern.test(origin) || pattern.test(referer)
  );
  
  if (isBlocked) {
    console.log("Blocked internal tracking request from:", origin || referer);
    return new Response(
      JSON.stringify({ success: true, blocked: true, reason: "internal_access" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
  
  // ... resto do processamento
}
```

### 6. Edge Function `quiz-submit-email` - Validação de Origem

```typescript
// Após as validações iniciais, antes de inserir lead:
const origin = req.headers.get("origin") || "";
const referer = req.headers.get("referer") || "";

const BLOCKED_PATTERNS = [
  /id-preview--.*\.lovable\.app/i,
  /localhost/i,
  /127\.0\.0\.1/i,
  /\.lovable\.dev/i,
];

const isInternalRequest = BLOCKED_PATTERNS.some(pattern => 
  pattern.test(origin) || pattern.test(referer)
);

if (isInternalRequest) {
  console.log("Blocked internal lead submission from:", origin || referer);
  return new Response(
    JSON.stringify({ success: true, blocked: true, reason: "internal_access" }),
    { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}
```

---

## Fluxo de Proteção

```text
┌─────────────────────────────────────────────────────────────────┐
│                    ACESSO AO FUNIL                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              CLIENTE: isInternalAccess()                         │
│                                                                  │
│  Verifica:                                                       │
│  • URL contém "id-preview--*.lovable.app"? → BLOQUEAR            │
│  • Está em iframe com referrer lovable.dev? → BLOQUEAR           │
│  • URL é localhost? → BLOQUEAR                                   │
│  • URL é codigolupin.lovable.app? → PERMITIR                     │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┴───────────────────┐
          ▼                                       ▼
┌──────────────────┐                   ┌──────────────────┐
│  INTERNO = true  │                   │  INTERNO = false │
│                  │                   │                  │
│  • Não rastrear  │                   │  • Enviar track  │
│  • Não salvar    │                   │  • Salvar lead   │
│    lead          │                   │  • Meta Pixel    │
│  • Sem Meta Pixel│                   │                  │
└──────────────────┘                   └────────┬─────────┘
                                                │
                                                ▼
                              ┌─────────────────────────────────┐
                              │     BACKEND: Edge Functions      │
                              │                                  │
                              │  Valida headers Origin/Referer   │
                              │  • Padrão bloqueado → Rejeitar   │
                              │  • Origem válida → Processar     │
                              └─────────────────────────────────┘
```

---

## Resultado Esperado

| Cenário | PageView | Lead | Métricas |
|---------|----------|------|----------|
| Acesso via `id-preview--*.lovable.app` | ❌ | ❌ | ❌ |
| Acesso via editor Lovable (iframe) | ❌ | ❌ | ❌ |
| Acesso via localhost | ❌ | ❌ | ❌ |
| Acesso via `codigolupin.lovable.app` | ✅ | ✅ | ✅ |
| Acesso via link externo em aba anônima | ✅ | ✅ | ✅ |

---

## Validação Pós-Implementação

1. **Teste Interno (Preview Lovable)**:
   - Acessar funil via ambiente Lovable
   - Verificar console para mensagem "Skipping internal access"
   - Confirmar que métricas não aumentaram no admin

2. **Teste Externo (Produção)**:
   - Abrir aba anônima
   - Acessar `codigolupin.lovable.app`
   - Navegar pelo funil
   - Verificar que métricas contabilizam normalmente

3. **Verificar Edge Functions**:
   - Logs devem mostrar "Blocked internal tracking request" para acessos internos
   - Logs devem processar normalmente acessos de produção

---

## Garantias

- Fluxo visual do funil 100% preservado
- Funcionalidades mantidas em todos os ambientes
- Apenas tracking é bloqueado em ambiente interno
- Performance não afetada (verificação é síncrona e leve)
- Meta Pixel não dispara em ambiente interno
- Dados do admin dashboard refletem apenas tráfego real

