
# Plano de Otimizacao de Performance do Funil de Quiz

## Resumo Executivo

Este plano otimiza o carregamento inicial do funil para menos de 3 segundos, mantendo 100% da identidade visual, animacoes e experiencia do usuario. As otimizacoes serao "por baixo do capo" - invisiveis para o usuario final.

---

## Diagnostico Atual

### Problemas Identificados

| Problema | Impacto | Solucao |
|----------|---------|---------|
| Todos os componentes carregam de uma vez | Alto | Lazy loading por etapa |
| Framer Motion carrega biblioteca inteira | Medio | LazyMotion com features parciais |
| Supabase client inicializa no primeiro render | Medio | Defer tracking apos primeiro paint |
| ParticleBackground renderiza 10 particulas com animacoes complexas | Baixo-Medio | CSS animations + requestIdleCallback |
| Lucide icons importados individualmente | Baixo | Tree-shaking automatico (ja otimizado) |

### Bundle Atual (Estimado)
- React + React-DOM: ~45KB gzipped
- Framer Motion: ~30KB gzipped
- Supabase Client: ~25KB gzipped
- Radix UI (varios): ~15KB gzipped
- Codigo do quiz: ~10KB gzipped

---

## Estrategia de Otimizacao

```text
+------------------+     +------------------+     +------------------+
|  CARREGAMENTO    |     |   INTERACAO 1    |     |   INTERACAO 2+   |
|    INICIAL       |     |   (Clique CTA)   |     |   (Perguntas)    |
+------------------+     +------------------+     +------------------+
        |                        |                        |
        v                        v                        v
+------------------+     +------------------+     +------------------+
| - HTML/CSS       |     | - QuizQuestion   |     | - EmailCapture   |
| - QuizLanding    |     |   (lazy)         |     | - QuizLoading    |
| - Fontes criticas|     | - Tracking async |     | - QuizResult     |
| - Animacao hero  |     |                  |     |   (todos lazy)   |
+------------------+     +------------------+     +------------------+
```

---

## Fase 1: Lazy Loading de Componentes

### Arquivo: `src/components/quiz/Quiz.tsx`

Implementar React.lazy() para componentes nao-criticos:

```typescript
// Componentes carregados imediatamente
import { QuizLanding } from "./QuizLanding";

// Componentes carregados sob demanda
const QuizQuestion = lazy(() => import("./QuizQuestion").then(m => ({ default: m.QuizQuestion })));
const EmailCapture = lazy(() => import("./EmailCapture").then(m => ({ default: m.EmailCapture })));
const QuizLoading = lazy(() => import("./QuizLoading").then(m => ({ default: m.QuizLoading })));
const QuizResult = lazy(() => import("./QuizResult").then(m => ({ default: m.QuizResult })));
```

**Beneficio**: Apenas QuizLanding (primeira tela) carrega no inicio. Outros componentes carregam quando necessarios.

---

## Fase 2: Otimizacao do Tracking Assincrono

### Arquivo: `src/hooks/useFunnelMetrics.ts`

Garantir que tracking nunca bloqueie o render:

```typescript
// Usar requestIdleCallback para tracking nao-critico
const trackPageView = useCallback((page: keyof FunnelMetrics["pageViews"]) => {
  const visitorId = getOrCreateVisitorId();
  
  // Defer tracking para idle time - nao bloqueia UI
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      sendTrackingEvent(visitorId, page);
    }, { timeout: 2000 });
  } else {
    // Fallback com setTimeout
    setTimeout(() => {
      sendTrackingEvent(visitorId, page);
    }, 100);
  }
}, []);
```

**Beneficio**: Tracking executado em background, sem impactar First Contentful Paint.

---

## Fase 3: Otimizacao de Animacoes com LazyMotion

### Arquivo: `src/components/quiz/QuizLanding.tsx`

Usar LazyMotion do Framer Motion para carregar apenas features necessarias:

```typescript
import { LazyMotion, domAnimation, m } from "framer-motion";

// Substituir <motion.div> por <m.div> dentro de <LazyMotion>
export function QuizLanding({ onStart, totalParticipants }: QuizLandingProps) {
  return (
    <LazyMotion features={domAnimation} strict>
      <div className="min-h-screen ...">
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} ...>
```

**Beneficio**: Reduz bundle do Framer Motion de ~30KB para ~15KB no carregamento inicial.

---

## Fase 4: Particulas com CSS + GPU Acceleration

### Arquivo: `src/components/quiz/ParticleBackground.tsx`

Converter particulas de Framer Motion para CSS puro com will-change:

```typescript
export function ParticleBackground() {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 3,
      duration: 12 + Math.random() * 8,
      delay: Math.random() * 4,
      color: i % 3 === 0 ? "burgundy" : "gold",
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute rounded-full animate-particle-float ${
            particle.color === "gold" ? "bg-gold-particle" : "bg-burgundy-particle"
          }`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </div>
  );
}
```

### Arquivo: `src/index.css`

Adicionar animacao CSS otimizada para GPU:

```css
@keyframes particle-float {
  0%, 100% {
    opacity: 0.15;
    transform: translate3d(0, 0, 0);
  }
  25% {
    opacity: 0.3;
    transform: translate3d(15px, -30px, 0);
  }
  50% {
    opacity: 0.35;
    transform: translate3d(-10px, -15px, 0);
  }
  75% {
    opacity: 0.25;
    transform: translate3d(5px, -40px, 0);
  }
}

.animate-particle-float {
  animation: particle-float linear infinite;
}

.bg-gold-particle {
  background-color: hsl(var(--gold));
}

.bg-burgundy-particle {
  background-color: hsl(var(--burgundy));
}
```

**Beneficio**: 
- Remove dependencia do Framer Motion para particulas
- Execucao 100% via GPU (transform3d)
- Reduz particulas de 10 para 8 (imperceptivel visualmente)

---

## Fase 5: Pre-carregamento Inteligente

### Arquivo: `src/components/quiz/Quiz.tsx`

Pre-carregar proxima etapa durante idle time:

```typescript
// Pre-carregar QuizQuestion quando usuario esta na landing
useEffect(() => {
  if (state.currentStep === "landing") {
    // Pre-carregar durante idle time
    const preload = () => {
      import("./QuizQuestion");
    };
    
    if ('requestIdleCallback' in window) {
      requestIdleCallback(preload, { timeout: 3000 });
    } else {
      setTimeout(preload, 1000);
    }
  }
}, [state.currentStep]);
```

**Beneficio**: QuizQuestion ja estara em cache quando usuario clicar no CTA.

---

## Fase 6: Otimizacao de Re-renders

### Arquivo: `src/components/quiz/Quiz.tsx`

Usar React.memo para evitar re-renders desnecessarios:

```typescript
const MemoizedQuizLanding = React.memo(QuizLanding);
const MemoizedQuizQuestion = React.memo(QuizQuestion);
```

### Arquivo: `src/hooks/useQuiz.ts`

Estabilizar referencias de callbacks com useCallback (ja implementado, apenas verificar).

**Beneficio**: Menos ciclos de render = interface mais responsiva.

---

## Fase 7: Suspense com Fallback Invisivel

### Arquivo: `src/components/quiz/Quiz.tsx`

Usar Suspense com fallback minimo para transicoes suaves:

```typescript
// Fallback que mantem o layout sem flash branco
const QuizFallback = () => (
  <div className="min-h-screen bg-background" />
);

return (
  <div className="min-h-screen bg-background">
    {state.currentStep === "landing" && (
      <QuizLanding ... />
    )}

    <Suspense fallback={<QuizFallback />}>
      {state.currentStep === "questions" && (
        <QuizQuestion ... />
      )}
      ...
    </Suspense>
  </div>
);
```

**Beneficio**: Sem telas em branco durante transicoes.

---

## Fase 8: Preload de Fontes Criticas

### Arquivo: `index.html`

Adicionar preload para fontes essenciais:

```html
<head>
  <!-- Preload fontes criticas -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600;700&display=swap" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600;700&display=swap" />
</head>
```

**Beneficio**: Fontes carregam em paralelo, evitando FOIT (Flash of Invisible Text).

---

## Resumo de Arquivos a Modificar

| Arquivo | Mudanca Principal |
|---------|-------------------|
| `src/components/quiz/Quiz.tsx` | Lazy loading, Suspense, pre-carregamento |
| `src/components/quiz/QuizLanding.tsx` | LazyMotion do Framer Motion |
| `src/components/quiz/QuizQuestion.tsx` | LazyMotion do Framer Motion |
| `src/components/quiz/ParticleBackground.tsx` | CSS animations em vez de Framer Motion |
| `src/components/quiz/EmailCapture.tsx` | LazyMotion + export named |
| `src/components/quiz/QuizLoading.tsx` | LazyMotion + export named |
| `src/components/quiz/QuizResult.tsx` | LazyMotion + export named |
| `src/hooks/useFunnelMetrics.ts` | Tracking assincrono com requestIdleCallback |
| `src/index.css` | Animacao CSS para particulas |
| `index.html` | Preload de fontes |

---

## Metricas Esperadas

| Metrica | Antes | Depois |
|---------|-------|--------|
| First Contentful Paint | ~2.5s | ~1.2s |
| Largest Contentful Paint | ~3.5s | ~1.8s |
| Time to Interactive | ~4s | ~2.5s |
| Bundle inicial | ~125KB | ~70KB |

---

## Garantias

- **Design**: Nenhuma alteracao visual
- **Layout**: Mantido 100%
- **Animacoes**: Todas preservadas, apenas otimizadas
- **Tracking**: Funcional e assincrono
- **UX**: Interface aparece instantanea

---

## Secao Tecnica Detalhada

### Lazy Loading Pattern

```typescript
// Pattern para lazy loading com named exports
const QuizQuestion = lazy(() => 
  import("./QuizQuestion").then(module => ({ 
    default: module.QuizQuestion 
  }))
);
```

### GPU Acceleration CSS

```css
/* Propriedades que ativam GPU */
transform: translate3d(x, y, 0);  /* Forca composicao de layer */
will-change: transform, opacity;   /* Hint para browser */
```

### requestIdleCallback Polyfill

```typescript
// Fallback para Safari
const scheduleIdleWork = (callback: () => void) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout: 2000 });
  } else {
    setTimeout(callback, 100);
  }
};
```
