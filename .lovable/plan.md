
# Plano: Integracao Meta Pixel, Pre-Preenchimento de Checkout e Filtro de Calendario

## Resumo Executivo

Este plano implementa:
1. Pre-preenchimento automatico de dados no checkout externo (Ticto)
2. Integracao completa do Meta Pixel com ID `1585747689119987`
3. Filtro de calendario na area administrativa para selecao de datas

Todas as mudancas sao no backend/logica - zero alteracao visual para o usuario.

---

## Requisitos e Solucoes

| Requisito | Solucao Tecnica |
|-----------|-----------------|
| Pre-preencher checkout | Passar email via parametros de URL (ja parcialmente implementado) |
| Meta Pixel PageView | Script no head + hook de tracking |
| Meta Pixel InitiateCheckout | Evento no clique do CTA |
| Evento "Chegou no Checkout" | Custom event antes do redirect |
| Filtro de calendario | Componente DatePickerRange no admin |
| Associar pixel ao visitor_id | Passar external_id no fbq() |

---

## Fase 1: Integracao do Meta Pixel

### 1.1 Adicionar Script do Meta Pixel no `index.html`

Inserir o script padrao do Meta Pixel no `<head>`:

```html
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1585747689119987');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=1585747689119987&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->
```

**Nota**: O `fbq('track', 'PageView')` sera disparado via hook React para melhor controle.

### 1.2 Criar Hook de Rastreamento: `src/hooks/useMetaPixel.ts`

Hook que encapsula todas as funcoes do Meta Pixel:

```typescript
// Declaracao global para TypeScript
declare global {
  interface Window {
    fbq: (...args: unknown[]) => void;
  }
}

const META_PIXEL_ID = "1585747689119987";

export function useMetaPixel() {
  // PageView - disparar em cada pagina
  const trackPageView = useCallback(() => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "PageView");
    }
  }, []);

  // InitiateCheckout - disparar no clique do CTA
  const trackInitiateCheckout = useCallback((data?: {
    content_name?: string;
    value?: number;
    currency?: string;
  }) => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "InitiateCheckout", {
        content_name: data?.content_name || "Quiz Result",
        value: data?.value || 0,
        currency: data?.currency || "BRL",
      });
    }
  }, []);

  // Custom Event: Chegou no Checkout
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

  // Associar visitor_id ao pixel para tracking avancado
  const setExternalId = useCallback((visitorId: string) => {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("init", META_PIXEL_ID, {
        external_id: visitorId,
      });
    }
  }, []);

  return {
    trackPageView,
    trackInitiateCheckout,
    trackChegouCheckout,
    setExternalId,
  };
}
```

### 1.3 Integrar Pixel no Quiz: `src/components/quiz/Quiz.tsx`

Adicionar chamadas de tracking nos momentos corretos:

```typescript
// No Quiz.tsx
import { useMetaPixel } from "@/hooks/useMetaPixel";

export function Quiz() {
  const { trackPageView, setExternalId } = useMetaPixel();
  
  // Associar visitor_id ao pixel na inicializacao
  useEffect(() => {
    const visitorId = getOrCreateVisitorId();
    setExternalId(visitorId);
  }, [setExternalId]);

  // Disparar PageView em cada mudanca de step
  useEffect(() => {
    // PageView em todas as paginas (exceto loading)
    if (state.currentStep !== "loading") {
      trackPageView();
    }
  }, [state.currentStep, state.currentQuestion, trackPageView]);
  
  // ... resto do codigo
}
```

### 1.4 Integrar Eventos de Checkout: `src/hooks/useQuiz.ts`

Modificar `redirectToCheckout` para disparar eventos antes do redirect:

```typescript
import { useMetaPixel } from "./useMetaPixel";

// Dentro de useQuiz():
const { trackInitiateCheckout, trackChegouCheckout } = useMetaPixel();

const redirectToCheckout = useCallback(() => {
  const flow = state.offerFlow || 1;
  const checkoutUrl = flow === 1 
    ? quizConfig.checkoutUrls.flow1 
    : quizConfig.checkoutUrls.flow2;
  
  if (!checkoutUrl) return;
  
  // Disparar eventos de pixel ANTES do redirect
  // 1. Custom event: Chegou no Checkout
  trackChegouCheckout({
    result_type: state.result,
    offer_flow: flow,
  });
  
  // 2. InitiateCheckout padrao
  trackInitiateCheckout({
    content_name: state.result || "Quiz Result",
    value: flow === 1 ? 47 : 97, // Valor estimado da oferta
    currency: "BRL",
  });
  
  // ... resto da validacao e redirect
}, [state, trackInitiateCheckout, trackChegouCheckout]);
```

---

## Fase 2: Pre-Preenchimento de Dados no Checkout

### 2.1 Atualizar URLs de Checkout com Parametros

O checkout da Ticto aceita parametros de URL para pre-preenchimento. Modificar `redirectToCheckout` em `useQuiz.ts`:

```typescript
const redirectToCheckout = useCallback(() => {
  const flow = state.offerFlow || 1;
  const checkoutUrl = flow === 1 
    ? quizConfig.checkoutUrls.flow1 
    : quizConfig.checkoutUrls.flow2;
  
  if (!checkoutUrl) return;
  
  try {
    const url = new URL(checkoutUrl);
    
    // Pre-preencher email (ja implementado)
    if (state.email) {
      url.searchParams.set("email", state.email);
    }
    
    // Pre-preencher nome (se capturado no futuro)
    // url.searchParams.set("name", state.name);
    
    // Adicionar identificadores para rastreamento
    url.searchParams.set("profile", state.result || "");
    url.searchParams.set("utm_source", "quiz");
    url.searchParams.set("utm_medium", "funnel");
    url.searchParams.set("utm_campaign", `flow${flow}`);
    
    // Visitor ID para associar no webhook
    const visitorId = getOrCreateVisitorId();
    url.searchParams.set("ref", visitorId);
    
    window.location.href = url.toString();
  } catch (error) {
    console.error("Invalid checkout URL:", error);
  }
}, [state.email, state.result, state.offerFlow]);
```

### 2.2 Parametros Suportados pela Ticto

A Ticto aceita os seguintes parametros de URL:
- `email` - Pre-preenche o campo de email
- `name` - Pre-preenche o campo de nome (se capturado)
- `phone` - Pre-preenche o telefone (se capturado)
- Parametros UTM para rastreamento de origem

**Resultado**: O usuario nao precisa digitar o email novamente no checkout.

---

## Fase 3: Filtro de Calendario na Area Administrativa

### 3.1 Modificar Hook: `src/hooks/useLeadsTimeline.ts`

Atualizar para aceitar datas especificas:

```typescript
interface UseLeadsTimelineReturn {
  timeline: TimelineData[];
  isLoading: boolean;
  fetchTimeline: (options?: {
    days?: number;
    startDate?: Date;
    endDate?: Date;
  }) => Promise<void>;
}

export function useLeadsTimeline(): UseLeadsTimelineReturn {
  const fetchTimeline = useCallback(async (options?: {
    days?: number;
    startDate?: Date;
    endDate?: Date;
  }) => {
    setIsLoading(true);
    try {
      const headers = await getAuthHeaders();
      const params = new URLSearchParams({
        action: "timeline",
      });
      
      // Usar datas especificas ou fallback para dias
      if (options?.startDate && options?.endDate) {
        params.set("startDate", format(options.startDate, "yyyy-MM-dd"));
        params.set("endDate", format(options.endDate, "yyyy-MM-dd"));
      } else {
        params.set("days", String(options?.days || 30));
      }

      // ... resto da logica
    } catch (error) {
      // ...
    }
  }, []);
  
  return { timeline, isLoading, fetchTimeline };
}
```

### 3.2 Atualizar Edge Function: `supabase/functions/quiz-leads/index.ts`

Adicionar suporte a parametros de data:

```typescript
if (action === "timeline") {
  const startDateParam = url.searchParams.get("startDate");
  const endDateParam = url.searchParams.get("endDate");
  const daysParam = url.searchParams.get("days");
  
  let startDate: Date;
  let endDate: Date;
  
  if (startDateParam && endDateParam) {
    // Usar datas especificas
    startDate = new Date(startDateParam);
    endDate = new Date(endDateParam);
  } else {
    // Fallback para dias
    const days = parseInt(daysParam || "30");
    endDate = new Date();
    startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
  }
  
  // ... resto da query com startDate e endDate
}
```

### 3.3 Criar Componente: `src/components/admin/DateRangePicker.tsx`

Componente de calendario para selecao de intervalo de datas:

```typescript
import { useState } from "react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateRangePickerProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onDateChange: (start: Date | undefined, end: Date | undefined) => void;
}

export function DateRangePicker({ startDate, endDate, onDateChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Presets rapidos
  const presets = [
    { label: "7 dias", days: 7 },
    { label: "14 dias", days: 14 },
    { label: "30 dias", days: 30 },
    { label: "60 dias", days: 60 },
  ];
  
  return (
    <div className="flex items-center gap-2">
      {/* Presets */}
      <div className="hidden sm:flex gap-1">
        {presets.map((preset) => (
          <Button
            key={preset.days}
            variant="outline"
            size="sm"
            onClick={() => {
              const end = new Date();
              const start = subDays(end, preset.days);
              onDateChange(start, end);
            }}
            className="text-xs"
          >
            {preset.label}
          </Button>
        ))}
      </div>
      
      {/* Date Picker */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="w-[240px]">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {startDate && endDate ? (
              `${format(startDate, "dd/MM")} - ${format(endDate, "dd/MM/yyyy")}`
            ) : (
              "Selecionar periodo"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={{ from: startDate, to: endDate }}
            onSelect={(range) => {
              onDateChange(range?.from, range?.to);
              if (range?.from && range?.to) {
                setIsOpen(false);
              }
            }}
            locale={ptBR}
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
```

### 3.4 Integrar no Admin: `src/pages/Admin.tsx`

Substituir o Select atual pelo DateRangePicker:

```typescript
import { DateRangePicker } from "@/components/admin/DateRangePicker";

// Estado
const [dateRange, setDateRange] = useState<{
  startDate: Date | undefined;
  endDate: Date | undefined;
}>({
  startDate: subDays(new Date(), 30),
  endDate: new Date(),
});

// Handler
const handleDateChange = (start: Date | undefined, end: Date | undefined) => {
  setDateRange({ startDate: start, endDate: end });
  if (start && end) {
    fetchTimeline({ startDate: start, endDate: end });
  }
};

// No JSX (substituir o Select atual):
<DateRangePicker
  startDate={dateRange.startDate}
  endDate={dateRange.endDate}
  onDateChange={handleDateChange}
/>
```

### 3.5 Atualizar LeadsTimelineChart

Remover o Select interno e receber as datas como props:

```typescript
interface LeadsTimelineChartProps {
  timeline: TimelineData[];
  isLoading: boolean;
  // Remover: onPeriodChange e selectedPeriod
  startDate?: Date;
  endDate?: Date;
}
```

---

## Fase 4: Associar Pixel ao Visitor

### 4.1 Advanced Matching do Meta Pixel

Usar o `external_id` do Meta Pixel para associar eventos ao mesmo usuario:

```typescript
// Em useMetaPixel.ts
const initWithUser = useCallback((userData: {
  visitorId: string;
  email?: string;
}) => {
  if (typeof window !== "undefined" && window.fbq) {
    // Reinicializar com dados do usuario
    window.fbq("init", META_PIXEL_ID, {
      external_id: userData.visitorId,
      em: userData.email ? hashEmail(userData.email) : undefined,
    });
  }
}, []);

// Funcao auxiliar para hash SHA-256 (exigido pelo Meta)
async function hashEmail(email: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(email.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}
```

### 4.2 Fluxo de Tracking Completo

```text
1. Usuario entra no funil
   └─► setExternalId(visitor_id)
   └─► PageView

2. Usuario avanca pelas perguntas
   └─► PageView (cada pagina)

3. Usuario insere email
   └─► initWithUser({ visitorId, email })

4. Usuario ve resultado
   └─► PageView

5. Usuario clica no CTA
   └─► ChegouNoCheckout (custom)
   └─► InitiateCheckout
   └─► Redirect para checkout
```

---

## Resumo de Arquivos a Modificar/Criar

| Arquivo | Acao | Mudanca Principal |
|---------|------|-------------------|
| `index.html` | EDITAR | Adicionar script do Meta Pixel |
| `src/hooks/useMetaPixel.ts` | CRIAR | Hook para eventos do pixel |
| `src/components/quiz/Quiz.tsx` | EDITAR | Integrar tracking de PageView |
| `src/hooks/useQuiz.ts` | EDITAR | Eventos no checkout + parametros URL |
| `src/hooks/useLeadsTimeline.ts` | EDITAR | Suporte a datas customizadas |
| `supabase/functions/quiz-leads/index.ts` | EDITAR | Parametros startDate/endDate |
| `src/components/admin/DateRangePicker.tsx` | CRIAR | Componente de calendario |
| `src/components/admin/LeadsTimelineChart.tsx` | EDITAR | Remover Select interno |
| `src/pages/Admin.tsx` | EDITAR | Integrar DateRangePicker |

---

## Fluxo de Dados do Pixel

```text
┌─────────────────────────────────────────────────────────────────┐
│                        FUNIL DE QUIZ                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Landing]  ──PageView──►  Meta Pixel                          │
│      │                         │                                │
│      v                         │                                │
│  [Q1-Q6]  ───PageView───►     │                                │
│      │                         │                                │
│      v                         │                                │
│  [Email]  ───PageView───►     │   ◄── setExternalId(visitor)  │
│      │         │               │   ◄── initWithUser(email)     │
│      v         │               │                                │
│  [Q7-Q8]  ───PageView───►     │                                │
│      │                         │                                │
│      v                         │                                │
│  [Result] ──PageView────►     │                                │
│      │                         │                                │
│      v                         │                                │
│  [CTA] ────► ChegouNoCheckout ─┤                                │
│      │      InitiateCheckout ──┤                                │
│      │                         │                                │
│      v                         ▼                                │
│  [Checkout Ticto]         Facebook Ads                         │
│   ?email=xxx                  Manager                          │
│   ?profile=xxx                                                 │
│   ?ref=visitor_id                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Garantias

- **UX**: Zero alteracao visual
- **Performance**: Script async, eventos nao-bloqueantes
- **Compatibilidade**: Funciona em desktop e mobile
- **Rastreamento**: Funciona dentro e fora do Lovable (via link publico)
- **Consistencia**: Mesmo visitor_id em pixel, dashboard e leads
- **Seguranca**: Email hasheado para Advanced Matching

---

## Metricas Disponiveis Apos Implementacao

| No Meta Ads Manager |
|---------------------|
| PageView por pagina do funil |
| InitiateCheckout com valor estimado |
| ChegouNoCheckout (custom) com perfil e oferta |
| Audiencias de retargeting por etapa |
| Conversoes atribuidas por campanha |

| No Admin Dashboard |
|-------------------|
| Filtro por calendario com datas especificas |
| Comparacao de periodos personalizados |
| Metricas sincronizadas em tempo real |
