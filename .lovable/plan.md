
# Otimizacao maxima de performance da primeira pagina

## Resumo

O projeto ja esta bem otimizado. As mudancas abaixo atacam os gargalos restantes no caminho critico de renderizacao da landing page, focando em reduzir o bundle inicial e adiar tudo que nao e visivel acima da dobra.

## 1. Remover framer-motion da landing page

**Arquivo: `src/components/quiz/QuizLanding.tsx`**

Substituir `LazyMotion`/`m.div`/`m.h1`/`m.p` por CSS animations puras. O framer-motion (`domAnimation`) adiciona ~15KB ao bundle critico apenas para fade-in simples.

Criar animacoes CSS no `index.css`:
- `@keyframes fadeInUp` (opacity 0->1, translateY 20px->0)
- `@keyframes fadeIn` (opacity 0->1)
- `@keyframes scaleIn` (opacity 0->1, scale 0.9->1)

Aplicar via classes com `animation-delay` crescente (0.15s, 0.2s, 0.5s, 0.6s, 0.7s) para manter o efeito sequencial atual.

Remover imports de `framer-motion` do QuizLanding. Isso elimina framer-motion completamente do bundle inicial (sera carregado lazy apenas quando QuizQuestion/EmailCapture/QuizResult precisarem).

## 2. Substituir Button por elemento nativo na landing

**Arquivo: `src/components/quiz/QuizLanding.tsx`**

Trocar `<Button>` do shadcn por `<button>` nativo com as mesmas classes Tailwind. Isso elimina `@radix-ui/react-slot` e `class-variance-authority` do bundle critico da landing (esses modulos serao carregados lazy com os outros componentes).

## 3. Substituir icone Lucide por SVG inline

**Arquivo: `src/components/quiz/QuizLanding.tsx`**

Trocar `<ArrowRight>` do lucide-react por SVG inline (~50 bytes). Lucide carrega o modulo inteiro de icones no bundle mesmo para 1 icone.

## 4. Adiar hooks de tracking na landing

**Arquivo: `src/components/quiz/Quiz.tsx`**

Lazy-load `useFunnelMetrics` e `useMetaPixel` - esses hooks nao sao necessarios para renderizar a landing. Envolver a inicializacao do tracking em `useEffect` com `requestIdleCallback` para que o primeiro paint nao seja bloqueado por logica de tracking.

Concretamente: extrair a logica de tracking para um componente `QuizTracking` lazy-loaded que monta apos a landing renderizar, ou adiar a chamada dos hooks com um flag `isReady` que so ativa apos o primeiro paint via `useEffect`.

## 5. Adiar React Query e Router no bundle

**Arquivo: `src/App.tsx`**

Nao ha mudanca possivel aqui sem quebrar a arquitetura - Router e QueryClient sao necessarios na raiz. Porem, o `vite.config.ts` ja os separa em chunks manuais, entao o Vite faz tree-shaking e parallel loading adequado.

## 6. Preload da fonte Archivo com `font-display: swap`

**Arquivo: `index.html`**

A fonte Archivo ja usa preload com `onload` hack. Adicionar `&display=swap` na URL do Google Fonts (se nao estiver) para garantir que o texto aparece imediatamente com fallback do sistema enquanto a fonte carrega.

Verificar: a URL atual ja inclui `display=swap` - confirmar e manter.

## Impacto estimado

```text
Antes (bundle critico):
- framer-motion domAnimation: ~15KB
- lucide-react (ArrowRight): ~5KB
- @radix-ui/react-slot: ~2KB
- class-variance-authority: ~3KB
- Total removido do critico: ~25KB

Depois:
- CSS animations inline: ~0.5KB
- SVG inline: ~0.05KB
- Total adicionado: ~0.55KB

Reducao liquida no bundle critico: ~24KB
```

## Detalhes tecnicos

### CSS Animations (adicionar ao `src/index.css`)

```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out forwards;
  opacity: 0;
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
  opacity: 0;
}

.animate-scale-in {
  animation: scaleIn 0.35s ease-out forwards;
  opacity: 0;
}
```

### SVG inline para ArrowRight

```html
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-2 group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
```

### Deferred tracking pattern no Quiz.tsx

```typescript
const [trackingReady, setTrackingReady] = useState(false);

useEffect(() => {
  // Defer tracking initialization until after first paint
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => setTrackingReady(true), { timeout: 3000 });
  } else {
    setTimeout(() => setTrackingReady(true), 1000);
  }
}, []);
```

Os hooks de tracking so executam suas funcoes quando `trackingReady` for `true`.

## Arquivos alterados

1. `src/components/quiz/QuizLanding.tsx` - Remover framer-motion, Button, lucide; usar CSS puro
2. `src/index.css` - Adicionar keyframes de animacao
3. `src/components/quiz/Quiz.tsx` - Adiar inicializacao de tracking

## O que NAO muda

- Visual identico da landing page (mesmas animacoes, mesmos timings)
- Tracking continua funcionando (apenas adiado ~1-3s)
- Meta Pixel continua disparando PageView
- Restante do funil nao e afetado
- Nenhuma alteracao no banco de dados ou edge functions
