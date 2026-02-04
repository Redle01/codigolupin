
# Plano: Otimização Extrema de Performance do Funil

## Objetivo
Abrir a primeira página em **menos de 3 segundos** (meta: < 2s) em Wi-Fi, 4G e 5G, mantendo 100% do design, copy, estrutura, responsividade e funcionalidades.

---

## Análise do Estado Atual

### Pontos Positivos Já Implementados
- Lazy loading de componentes (QuizQuestion, EmailCapture, QuizLoading, QuizResult)
- LazyMotion com domAnimation (framer-motion otimizado)
- Tracking assíncrono via requestIdleCallback
- CSS crítico inline no index.html
- Preload não-bloqueante de fontes
- Memoização de componentes (memo)
- GPU acceleration para animações de partículas

### Oportunidades de Otimização Identificadas

| Categoria | Problema | Impacto |
|-----------|----------|---------|
| Fonts | Carrega 2 fontes (Archivo + Playfair Display) | ~50-80KB |
| Bundle | Muitos componentes UI não utilizados no funil | ~100KB+ |
| Scripts | Meta Pixel carrega síncronamente | Bloqueia render |
| Supabase | Client inicializa no bundle principal | ~30KB |
| Particles | 8 partículas com animação CSS contínua | CPU usage |
| Preload | Falta preconnect para Supabase | Latência |

---

## Otimizações a Implementar

### 1. Adiar Carregamento do Meta Pixel (index.html)

O Meta Pixel está carregando síncronamente e bloqueando o render inicial. Vamos adiar para após o carregamento da página.

**Arquivo:** `index.html`

```html
<!-- Antes: Meta Pixel síncrono -->
<script>
!function(f,b,e,v,n,t,s)
{...}
fbq('init', '1585747689119987');
</script>

<!-- Depois: Meta Pixel adiado para após window.load -->
<script>
window.addEventListener('load', function() {
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '1585747689119987');
});
</script>
```

**Benefício:** ~200-300ms de melhoria no First Contentful Paint (FCP)

---

### 2. Adicionar Preconnects Críticos (index.html)

Adicionar preconnects para domínios críticos que serão acessados logo após o carregamento.

**Adicionar após os preconnects de fontes:**

```html
<!-- Preconnect to Supabase for faster API calls -->
<link rel="preconnect" href="https://enbhyeddogbocxgttkkd.supabase.co" crossorigin />

<!-- DNS prefetch for Meta Pixel (loaded after page load) -->
<link rel="dns-prefetch" href="https://connect.facebook.net" />
```

**Benefício:** ~100-150ms de economia em conexões subsequentes

---

### 3. Remover Fonte Playfair Display (index.html)

A fonte Playfair Display não é mais utilizada no funil (removemos font-serif-display anteriormente). Remover do preload economiza ~40KB.

**Alterar o link de fontes de:**
```html
href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap"
```

**Para:**
```html
href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&display=swap"
```

**Benefício:** ~40KB menos de download, ~100-200ms de economia

---

### 4. Otimizar Renderização do ParticleBackground

Reduzir o número de partículas de 8 para 5 e simplificar animações para reduzir uso de CPU.

**Arquivo:** `src/components/quiz/ParticleBackground.tsx`

```tsx
// Antes: 8 partículas
Array.from({ length: 8 }, ...)

// Depois: 5 partículas (suficiente para efeito visual)
Array.from({ length: 5 }, ...)
```

Também adicionar `content-visibility: auto` para partículas fora da viewport.

**Benefício:** ~15% menos uso de CPU em dispositivos móveis

---

### 5. Otimizar Critical Rendering Path (index.html)

Expandir o CSS crítico inline para incluir estilos da landing page, eliminando FOUC (Flash of Unstyled Content).

**Adicionar ao bloco de CSS crítico:**

```html
<style>
  body { 
    background-color: hsl(0 0% 4%); 
    color: hsl(45 29% 90%);
    margin: 0;
    font-family: 'Archivo';
  }
  #root { 
    min-height: 100vh; 
    min-height: 100dvh;
  }
  /* Critical above-the-fold styles */
  .bg-background { background-color: hsl(0 0% 4%); }
  .min-h-screen { min-height: 100vh; min-height: 100dvh; }
  .flex { display: flex; }
  .flex-col { flex-direction: column; }
  .items-center { align-items: center; }
  .justify-center { justify-content: center; }
  .text-center { text-align: center; }
</style>
```

**Benefício:** Elimina flash branco, melhora LCP em ~50-100ms

---

### 6. Lazy Load do Supabase Client para Landing (vite.config.ts)

Configurar o Vite para separar o chunk do Supabase, permitindo que a landing page carregue sem o SDK completo.

**Arquivo:** `vite.config.ts`

```ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-supabase': ['@supabase/supabase-js'],
        'vendor-framer': ['framer-motion'],
        'vendor-react-query': ['@tanstack/react-query'],
      }
    }
  }
}
```

**Benefício:** Chunks menores, carregamento paralelo mais eficiente

---

### 7. Otimizar useQuiz para Lazy Supabase (src/hooks/useQuiz.ts)

O Supabase só precisa ser carregado quando o usuário submete o email (não na landing).

**Alterar import estático para dinâmico:**

```ts
// Antes
import { supabase } from "@/integrations/supabase/client";

// Depois - lazy import apenas quando necessário
const getSupabase = async () => {
  const { supabase } = await import("@/integrations/supabase/client");
  return supabase;
};

// No submitEmail:
const supabase = await getSupabase();
```

**Benefício:** ~30KB a menos no bundle inicial

---

### 8. Otimizar useFunnelMetrics para Tracking Lazy (src/hooks/useFunnelMetrics.ts)

Similar ao acima, lazy load do Supabase para tracking.

```ts
// Async tracking com lazy import
async function sendTrackingEvent(visitorId: string, page: string) {
  try {
    const { supabase } = await import("@/integrations/supabase/client");
    await supabase.functions.invoke("quiz-metrics", {...});
  } catch (error) {
    console.debug("Tracking error:", error);
  }
}
```

**Benefício:** Landing page carrega sem Supabase SDK

---

### 9. Remover CSS Não Utilizado (src/index.css)

Remover a classe `.font-serif-display` que não é mais utilizada no funil.

```css
/* Remover estas linhas (112-114) */
.font-serif-display {
  font-family: 'Playfair Display', Georgia, serif;
}
```

**Benefício:** CSS mais limpo, microsegundos de parsing

---

### 10. Adicionar Resource Hints para Próxima Etapa (src/components/quiz/Quiz.tsx)

Adicionar prefetch para chunks da próxima etapa baseado no comportamento do usuário.

```tsx
// No useEffect de preload, adicionar:
if (state.currentStep === "landing") {
  // Preload QuizQuestion e também prefetch do chunk
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = '/assets/quiz-question-[hash].js'; // Será resolvido pelo Vite
  document.head.appendChild(link);
}
```

**Alternativa mais robusta:** Usar import() que já faz prefetch automático no Vite.

---

## Resumo das Alterações por Arquivo

| Arquivo | Tipo de Alteração |
|---------|-------------------|
| `index.html` | Adiar Meta Pixel, adicionar preconnects, remover Playfair Display, expandir CSS crítico |
| `src/components/quiz/ParticleBackground.tsx` | Reduzir partículas de 8 para 5 |
| `src/hooks/useQuiz.ts` | Lazy import do Supabase |
| `src/hooks/useFunnelMetrics.ts` | Lazy import do Supabase |
| `src/index.css` | Remover .font-serif-display |
| `vite.config.ts` | Adicionar manualChunks para code splitting otimizado |

---

## Impacto Estimado de Performance

| Métrica | Antes (estimado) | Depois (estimado) |
|---------|------------------|-------------------|
| FCP (First Contentful Paint) | ~1.5s | ~0.8s |
| LCP (Largest Contentful Paint) | ~2.5s | ~1.5s |
| TTI (Time to Interactive) | ~3.0s | ~2.0s |
| Bundle inicial | ~180KB | ~120KB |
| Total transferido | ~280KB | ~200KB |

---

## Garantias

- Copy 100% inalterada
- Design 100% preservado
- Estrutura do funil mantida
- Responsividade intacta
- Todas as funcionalidades operacionais
- Rastreamento Meta Pixel funcionando (apenas adiado)
- Métricas do funil funcionando normalmente
- Transições e animações suaves
- Experiência do usuário idêntica

---

## Validação Pós-Implementação

1. Testar carregamento em Wi-Fi, 4G simulado e 5G
2. Verificar que Meta Pixel dispara PageView após load
3. Confirmar que tracking de métricas funciona
4. Testar navegação completa pelo funil
5. Validar que animações continuam fluidas
6. Confirmar checkout redirect funcionando
