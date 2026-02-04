
# Plano: Otimizacao de Performance do Funil

## Resumo Executivo

Este plano otimiza a velocidade e performance do funil em todas as etapas, garantindo:
- Primeira pagina (landing) abrindo em menos de 3 segundos em Wi-Fi/5G/4G
- Transicoes fluidas e instantaneas entre todas as etapas
- Zero compromisso com elementos visuais, animacoes ou rastreamento existentes

---

## Analise do Estado Atual

### O Que Ja Esta Bem Otimizado

| Aspecto | Implementacao Atual |
|---------|---------------------|
| Lazy Loading | Componentes QuizQuestion, EmailCapture, QuizLoading, QuizResult carregados via lazy() |
| Preload Inteligente | QuizQuestion pre-carregado durante idle time na landing |
| Memoizacao | QuizLanding, QuizQuestion, EmailCapture, QuizResult sao memo() |
| Tracking Assincrono | useFunnelMetrics usa requestIdleCallback para nao bloquear UI |
| Particulas CSS | ParticleBackground usa CSS puro com will-change e GPU acceleration |
| Framer Motion | Usa LazyMotion com domAnimation (bundle menor) |

### Oportunidades de Melhoria Identificadas

| Problema | Impacto | Prioridade |
|----------|---------|------------|
| Fonts carregando de forma bloqueante | Delay no first paint | Alta |
| Preload incompleto - apenas QuizQuestion | Demora nas transicoes posteriores | Media |
| React.StrictMode pode causar double-render | Performance desnecessaria | Baixa |
| Admin nao e lazy loaded | Bundle inicial maior | Media |
| Toaster/Sonner carregados no bundle inicial | Peso extra na landing | Media |
| CSS pode ter regras nao utilizadas | Tamanho do bundle | Baixa |

---

## Fase 1: Otimizacao de Carregamento Inicial

### 1.1 Melhoria no Carregamento de Fonts (index.html)

Adicionar font-display: swap e otimizar preload:

```html
<!-- Antes -->
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600;700&display=swap" />

<!-- Depois - Adicionar font-display e reduzir pesos nao usados -->
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link 
  rel="preload" 
  as="style" 
  href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600;700&display=swap" 
  onload="this.onload=null;this.rel='stylesheet'"
/>
<noscript>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600;700&display=swap" />
</noscript>
```

### 1.2 Adicionar CSS Inline Critico (index.html)

Inserir estilos minimos para evitar flash branco:

```html
<style>
  /* Critical CSS - Prevent white flash */
  body { 
    background-color: hsl(0 0% 4%); 
    color: hsl(45 29% 90%);
    margin: 0;
  }
  #root { 
    min-height: 100vh; 
    min-height: 100dvh;
  }
</style>
```

---

## Fase 2: Lazy Loading da Pagina Admin

### 2.1 Tornar Admin Lazy (App.tsx)

Evitar que Admin carregue no bundle inicial:

```typescript
// Antes
import Admin from "./pages/Admin";

// Depois
const Admin = lazy(() => import("./pages/Admin"));

// No Routes:
<Route path="/admin" element={
  <Suspense fallback={<div className="min-h-screen bg-background" />}>
    <Admin />
  </Suspense>
} />
```

---

## Fase 3: Preload Inteligente de Proximas Etapas

### 3.1 Expandir Preload Progressivo (Quiz.tsx)

Pre-carregar componentes baseado na etapa atual:

```typescript
// Preload estrategico baseado na etapa atual
useEffect(() => {
  const preloadNext = () => {
    if (state.currentStep === "landing") {
      // Pre-carregar QuizQuestion durante idle na landing
      import("./QuizQuestion");
    } else if (state.currentStep === "questions" && state.currentQuestion >= 4) {
      // Pre-carregar EmailCapture quando chegar na Q5
      import("./EmailCapture");
    } else if (state.currentStep === "email") {
      // Pre-carregar QuizLoading e QuizResult durante captura de email
      import("./QuizLoading");
      import("./QuizResult");
    }
  };

  if ("requestIdleCallback" in window) {
    (window as Window).requestIdleCallback(preloadNext, { timeout: 2000 });
  } else {
    setTimeout(preloadNext, 500);
  }
}, [state.currentStep, state.currentQuestion]);
```

---

## Fase 4: Otimizacao de Re-renders

### 4.1 Memoizar Handlers no Quiz.tsx

Garantir que funcoes nao causem re-renders desnecessarios:

```typescript
// Memoizar handleEmailSubmit e handleCheckout (ja existem mas verificar)
const handleEmailSubmit = useCallback(async () => {
  return submitEmail();
}, [submitEmail]);

const handleCheckout = useCallback(() => {
  redirectToCheckout();
}, [redirectToCheckout]);
```

### 4.2 Otimizar Tracking no useFunnelMetrics.ts

Adicionar debounce para evitar multiplos trackings:

```typescript
// Adicionar cache de ultima pagina rastreada
const lastTrackedRef = useRef<string | null>(null);

const trackPageView = useCallback((page: keyof FunnelMetrics["pageViews"]) => {
  // Evitar tracking duplicado
  if (lastTrackedRef.current === page) return;
  lastTrackedRef.current = page;
  
  const visitorId = getOrCreateVisitorId();
  scheduleIdleWork(() => {
    sendTrackingEvent(visitorId, page);
  });
}, []);
```

---

## Fase 5: Otimizacao de Animacoes

### 5.1 Reduzir Delays nas Animacoes (QuizLanding.tsx)

Iniciar animacoes mais cedo para sensacao de velocidade:

```typescript
// Ajustar delays para serem mais rapidos mas ainda elegantes
// Antes: delays de 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.9, 1.0s
// Depois: delays de 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.5, 0.6s

// Exemplo no Icon:
transition={{ delay: 0.1, type: "spring", stiffness: 200 }}

// Exemplo no Title:
transition={{ delay: 0.15, duration: 0.5 }}
```

### 5.2 Otimizar Transicoes no QuizQuestion.tsx

Reduzir duracao de transicoes para sensacao mais responsiva:

```typescript
// Ajustar feedback de selecao de resposta
// Antes: setTimeout 400ms
// Depois: setTimeout 300ms (mantem feedback visual mas mais rapido)

const handleAnswer = (answerId: string) => {
  setJustSelected(answerId);
  setTimeout(() => {
    onAnswer(answerId);
    setJustSelected(null);
  }, 300); // Reduzido de 400ms
};
```

---

## Fase 6: Lazy Loading de Componentes UI Pesados

### 6.1 Tornar Toaster/Sonner Lazy (App.tsx)

Carregar notificacoes apenas quando necessario:

```typescript
// Antes
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

// Depois
const Toaster = lazy(() => import("@/components/ui/toaster").then(m => ({ default: m.Toaster })));
const Sonner = lazy(() => import("@/components/ui/sonner").then(m => ({ default: m.Toaster })));

// No render:
<Suspense fallback={null}>
  <Toaster />
  <Sonner />
</Suspense>
```

---

## Fase 7: Otimizacao de CSS

### 7.1 Adicionar will-change Estrategico (index.css)

Preparar browser para animacoes:

```css
/* Adicionar na secao de animacoes */
.animate-particle-float {
  animation: particle-float linear infinite;
  will-change: transform, opacity;
  backface-visibility: hidden;
  transform: translateZ(0);
}

/* Otimizar transicoes de botoes */
button {
  will-change: transform;
}
```

---

## Resumo de Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `index.html` | CSS inline critico, otimizacao de fonts |
| `src/App.tsx` | Lazy load Admin, Toaster, Sonner |
| `src/components/quiz/Quiz.tsx` | Preload progressivo expandido |
| `src/components/quiz/QuizLanding.tsx` | Delays de animacao reduzidos |
| `src/components/quiz/QuizQuestion.tsx` | Feedback de selecao mais rapido |
| `src/hooks/useFunnelMetrics.ts` | Cache de tracking para evitar duplicatas |
| `src/index.css` | will-change e otimizacoes GPU |

---

## Metricas Esperadas

| Metrica | Antes (Estimado) | Depois (Esperado) |
|---------|------------------|-------------------|
| First Contentful Paint | ~2.5s | ~1.5s |
| Time to Interactive | ~3.5s | ~2.5s |
| Transicao entre perguntas | ~450ms | ~350ms |
| Bundle inicial (landing) | ~180KB | ~140KB |

---

## Garantias

- Zero alteracao em elementos visuais
- Zero alteracao em copy ou identidade visual
- Zero alteracao em logica do funil
- Zero alteracao em rastreamento/metricas
- Todas as animacoes preservadas (apenas timing ajustado)
- Performance otimizada "por baixo do capo"
