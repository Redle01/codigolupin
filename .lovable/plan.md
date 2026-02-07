
# Plano: Otimização de Performance do Funil

## Diagnóstico Atual

O projeto ja possui boas otimizações (code splitting, lazy loading, CSS critico inline, font preloading). Vou focar nas oportunidades remanescentes que podem reduzir ainda mais o tempo de carregamento.

---

## Otimizações Identificadas

### 1. Remover TooltipProvider do caminho critico (`App.tsx`)

O `TooltipProvider` importa `@radix-ui/react-tooltip` sincronamente no bundle principal, mas nao e usado na landing page do quiz. Envolve-lo em lazy load ou remove-lo do wrapper global.

**Arquivo:** `src/App.tsx`

**Alteracao:** Remover `TooltipProvider` do wrapper global (nao e usado no funil) ou torna-lo lazy. Como o funil nao usa tooltips, remover o wrapper e seguro.

### 2. Lazy load de react-router-dom e QueryClient (`App.tsx` / `main.tsx`)

O `react-router-dom` e `@tanstack/react-query` sao carregados sincronamente mas o quiz nao precisa de React Query. Porem, como react-query ja esta em chunk separado e o router e essencial, o ganho seria marginal. Manter como esta.

### 3. Otimizar carregamento da fonte Archivo (`index.html`)

A fonte ja usa `preload` com `onload` swap, o que e bom. Adicionar `font-display: swap` inline e garantir que o fallback de sistema seja rapido.

**Arquivo:** `index.html`

**Alteracao:** Adicionar fallback de fonte do sistema no CSS critico inline para evitar FOIT (Flash of Invisible Text).

### 4. Defer do Meta Pixel mais agressivo (`index.html`)

O Meta Pixel ja usa `window.addEventListener('load')`, mas o script ainda registra o listener no `<head>`. Mover para o final do `<body>` ou usar `requestIdleCallback`.

**Arquivo:** `index.html`

**Alteracao:** Usar `requestIdleCallback` com fallback para `setTimeout` em vez de `load` event, para adiar ainda mais.

### 5. Preload da rota critica - QuizLanding (`Quiz.tsx`)

O `QuizLanding` ja e importado sincronamente (bom). Os componentes lazy (QuizQuestion, EmailCapture, etc.) ja usam preload progressivo. Nenhuma alteracao necessaria aqui.

### 6. Otimizar imagem do mockup (`QuizResult.tsx`)

A imagem `mockup-checkout.png` ja usa `loading="lazy"`, o que e correto pois so aparece na pagina de resultado. Nenhuma alteracao necessaria.

### 7. Adicionar manual chunks para react-router-dom (`vite.config.ts`)

Separar `react-router-dom` em seu proprio chunk para melhor cache e paralelismo de download.

**Arquivo:** `vite.config.ts`

**Alteracao:** Adicionar `'vendor-router': ['react-router-dom']` aos manualChunks.

### 8. Remover import sincrono de `NotFound` (`App.tsx`)

A pagina `NotFound` e importada sincronamente mas raramente acessada. Tornar lazy.

**Arquivo:** `src/App.tsx`

**Alteracao:** Lazy load de `NotFound`.

---

## Resumo de Alteracoes

| Arquivo | Alteracao | Impacto |
|---------|-----------|---------|
| `src/App.tsx` | Remover TooltipProvider, lazy load NotFound | Reduz bundle principal (~15-20KB) |
| `vite.config.ts` | Adicionar chunk para react-router-dom | Melhor cache/paralelismo |
| `index.html` | Otimizar Meta Pixel com requestIdleCallback, melhorar font fallback | Reduz bloqueio no load event |

---

## Detalhes Tecnicos

### `src/App.tsx`

```tsx
import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";

const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Toaster = lazy(() => 
  import("@/components/ui/toaster").then(m => ({ default: m.Toaster }))
);
const Sonner = lazy(() => 
  import("@/components/ui/sonner").then(m => ({ default: m.Toaster }))
);

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-screen bg-background" />
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Suspense fallback={null}>
      <Toaster />
      <Sonner />
    </Suspense>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route 
          path="/admin" 
          element={
            <Suspense fallback={<RouteFallback />}>
              <Admin />
            </Suspense>
          } 
        />
        <Route path="*" element={
          <Suspense fallback={<RouteFallback />}>
            <NotFound />
          </Suspense>
        } />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);
```

Remove `TooltipProvider` (nao usado no funil) e lazy load `NotFound`.

### `vite.config.ts`

```typescript
manualChunks: {
  'vendor-supabase': ['@supabase/supabase-js'],
  'vendor-framer': ['framer-motion'],
  'vendor-react-query': ['@tanstack/react-query'],
  'vendor-router': ['react-router-dom'],
}
```

### `index.html` - Meta Pixel

```javascript
// De: window.addEventListener('load', function() { ... });
// Para:
(function() {
  function initPixel() {
    !function(f,b,e,v,n,t,s)
    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window, document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '1585747689119987');
  }
  if ('requestIdleCallback' in window) {
    requestIdleCallback(initPixel, { timeout: 3000 });
  } else {
    setTimeout(initPixel, 2000);
  }
})();
```

### `index.html` - Font fallback

Atualizar o CSS critico inline:

```css
body { 
  background-color: hsl(0 0% 4%); 
  color: hsl(45 29% 90%);
  margin: 0;
  font-family: 'Archivo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

---

## O Que NAO Sera Alterado

- Design visual, copy, estrutura do funil
- Animacoes (framer-motion continua em chunk separado)
- Eventos de rastreamento (Meta Pixel continua funcionando, apenas adiado)
- Responsividade
- Logica condicional e navegacao do quiz

## Resultado Esperado

- Bundle principal menor (~15-20KB a menos sem TooltipProvider)
- Melhor paralelismo de download com chunk separado do router
- Meta Pixel nao compete com recursos criticos
- Font fallback imediato sem flash de texto invisivel
