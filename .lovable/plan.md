
# Plano: Otimizacao de Performance - Fase Final

## Estado Atual

O projeto ja possui otimizacoes solidas: code splitting, lazy loading, CSS critico inline, font preloading com swap, Meta Pixel deferido, chunks manuais, e Supabase lazy. As oportunidades restantes sao incrementais mas cumulativas.

---

## Alteracoes Identificadas

| Arquivo | Alteracao | Impacto |
|---------|-----------|---------|
| `src/App.css` | Remover arquivo inteiro (nao utilizado, Vite boilerplate) | Elimina CSS morto do bundle |
| `src/index.css` | Remover `will-change: transform` global em buttons | Reduz consumo de memoria GPU (applied a TODOS os buttons) |
| `src/index.css` | Remover `.dark {}` duplicado (identico ao `:root`) | ~40 linhas de CSS eliminadas |
| `src/components/quiz/QuizResult.tsx` | Remover `backdrop-blur-sm` dos cards (custo GPU alto em mobile, fundo ja e opaco/escuro) | Melhora fluidez de scroll e animacoes no resultado |
| `src/components/quiz/QuizLanding.tsx` | Remover divs decorativas com blur (2 `blur-3xl` no background, invisíveis sobre fundo preto) | Elimina 2 camadas GPU desnecessarias |
| `index.html` | Remover preconnect ao Supabase (SDK e lazy loaded, conexao nao e necessaria no carregamento inicial) | Libera 1 conexao TCP/TLS antecipada |
| `vite.config.ts` | Adicionar `build.target: 'es2020'` para output mais leve, `cssMinify: 'lightningcss'` para CSS menor | Bundle JS e CSS ligeiramente menores |
| `src/components/quiz/Quiz.tsx` | Lazy load AdminNavPanel (so carrega em ambiente interno) | Elimina ~3KB do bundle de producao |

---

## Detalhes Tecnicos

### 1. Remover `src/App.css`

Este arquivo e o boilerplate padrao do Vite (`.logo`, `.card`, `.read-the-docs`) e nao e usado por nenhum componente do funil. E importado implicitamente mas nao referenciado. Verificar se ha import em `main.tsx` - nao ha, apenas `index.css` e importado. O arquivo pode ser removido com seguranca.

### 2. `src/index.css` - Remover will-change global e .dark duplicado

```css
/* REMOVER - will-change em TODOS os buttons consome GPU desnecessariamente */
button {
  will-change: transform;
}

/* REMOVER - bloco .dark {} inteiro (linhas 60-97) - identico ao :root */
```

O bloco `.dark` e uma copia exata do `:root`. Como o site so tem um tema (escuro), o `:root` ja aplica os valores corretos. Remover o `.dark` elimina ~40 linhas de CSS processado.

### 3. `src/components/quiz/QuizResult.tsx` - Remover backdrop-blur

```tsx
// De:
className="bg-card/50 backdrop-blur-sm border..."
// Para:
className="bg-card border..."
```

`backdrop-blur-sm` forca composicao GPU em cada card. Como o fundo e preto solido, o blur nao tem efeito visual perceptivel. Trocar `bg-card/50` por `bg-card` (sem transparencia) elimina a necessidade de composicao.

### 4. `src/components/quiz/QuizLanding.tsx` - Remover blurs decorativos

```tsx
// REMOVER este bloco inteiro (linhas 18-21):
<div className="absolute inset-0 overflow-hidden pointer-events-none">
  <div className="absolute top-1/4 left-1/4 w-32 md:w-64 h-32 md:h-64 bg-primary/5 rounded-full blur-3xl" />
  <div className="absolute bottom-1/4 right-1/4 w-48 md:w-96 h-48 md:h-96 bg-secondary/5 rounded-full blur-3xl" />
</div>
```

Estes elementos tem `opacity 5%` sobre fundo preto - praticamente invisiveis. Cada `blur-3xl` cria uma camada de composicao GPU pesada. Remover nao altera o visual mas melhora significativamente a performance em dispositivos moveis.

### 5. `index.html` - Remover preconnect Supabase

```html
<!-- REMOVER - Supabase e lazy loaded, conexao antecipada desperdicada -->
<link rel="preconnect" href="https://enbhyeddogbocxgttkkd.supabase.co" crossorigin />
```

Como o SDK do Supabase so e carregado via `import()` dinamico quando o usuario submete email (depois de Q5), o preconnect antecipa uma conexao TCP/TLS que nao sera usada por varios minutos. Essa conexao TCP e descartada pelo browser apos ~10s, tornando-se desperdicio.

### 6. `vite.config.ts` - Build target e CSS minification

```typescript
build: {
  target: 'es2020',
  cssMinify: 'lightningcss',
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-supabase': ['@supabase/supabase-js'],
        'vendor-framer': ['framer-motion'],
        'vendor-react-query': ['@tanstack/react-query'],
        'vendor-router': ['react-router-dom'],
      }
    }
  }
}
```

`es2020` permite output mais compacto (optional chaining nativo, nullish coalescing). `lightningcss` e um minificador CSS mais eficiente que o padrao.

### 7. `src/components/quiz/Quiz.tsx` - Lazy load AdminNavPanel

```tsx
// De:
import { AdminNavPanel } from "./AdminNavPanel";

// Para:
const AdminNavPanel = lazy(() =>
  import("./AdminNavPanel").then(m => ({ default: m.AdminNavPanel }))
);
```

O AdminNavPanel so e renderizado em ambiente interno (`isInternal`). Em producao, nunca e montado, mas o codigo ainda e incluido no bundle. Com lazy load, o chunk so e baixado quando necessario.

---

## O Que NAO Sera Alterado

- Design visual (os blurs removidos sao invisiveis a olho nu)
- Copy, estrutura, layout
- Animacoes do framer-motion
- Eventos de rastreamento (Meta Pixel, funnel metrics)
- Logica condicional e navegacao
- Responsividade
- Integracao com Supabase

## Resultado Esperado

- Bundle CSS ~40 linhas menor (remocao de .dark duplicado + App.css)
- Menos camadas GPU em mobile (remocao de blur-3xl e backdrop-blur)
- Bundle JS de producao menor (~3KB menos sem AdminNavPanel inline)
- Conexao TCP/TLS liberada (remocao de preconnect nao utilizado)
- Output JS mais compacto com target es2020
- Transicoes e scroll mais fluidos na pagina de resultado
