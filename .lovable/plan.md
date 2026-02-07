
# Plano: Nova Paleta de Cores - Vermelho Profundo e Preto

## Analise das Imagens de Referencia

As imagens mostram uma identidade visual dominada por:
- **Fundo**: Preto profundo com toques de vermelho escuro
- **Cor primaria**: Vermelho profundo/crimson (tons de vinho a vermelho vivo)
- **Acentos**: Variantes de vermelho (claro para highlights, escuro para profundidade)
- **Contraste**: Texto claro (branco/creme) sobre fundos escuros
- **Ausencia de dourado**: A paleta atual usa dourado como primaria - sera substituida por vermelho

---

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/index.css` | Atualizar todas as CSS variables e utility classes |
| `tailwind.config.ts` | Renomear tokens de cor (gold -> red) |
| `index.html` | Atualizar CSS critico inline |
| `src/components/quiz/QuizLanding.tsx` | Atualizar classes de cor |
| `src/components/quiz/QuizQuestion.tsx` | Atualizar cores do ripple/selection |
| `src/components/quiz/QuizResult.tsx` | Atualizar classes de cor |
| `src/components/quiz/EmailCapture.tsx` | Atualizar classes de cor |
| `src/components/quiz/QuizLoading.tsx` | Atualizar classes de cor |

---

## Nova Paleta (HSL)

| Token | Valor Atual (Gold) | Novo Valor (Red) | Descricao |
|-------|--------------------|--------------------|-----------|
| `--primary` | `43 74% 53%` | `0 80% 42%` | Vermelho profundo principal |
| `--primary-foreground` | `0 0% 4%` | `0 0% 95%` | Texto claro sobre vermelho |
| `--accent` | `43 74% 53%` | `0 80% 42%` | Mesmo que primary |
| `--accent-foreground` | `0 0% 4%` | `0 0% 95%` | Texto claro |
| `--ring` | `43 74% 53%` | `0 80% 42%` | Focus ring vermelho |
| `--gold` | `43 74% 53%` | `0 80% 42%` | Renomear para --lupin-red |
| `--gold-light` | `43 74% 65%` | `0 75% 55%` | Vermelho mais claro |
| `--gold-dark` | `43 74% 40%` | `0 85% 28%` | Vermelho escuro/vinho |
| `--secondary` | `348 56% 33%` | `350 60% 25%` | Borgonha mais escuro |
| `--burgundy` | `348 56% 33%` | `350 60% 25%` | Borgonha escuro |
| `--burgundy-light` | `348 56% 45%` | `350 55% 38%` | Borgonha medio |

---

## Detalhes de Implementacao

### 1. `src/index.css` - CSS Variables

Atualizar os valores de todas as variaveis de cor no `:root` e `.dark`:

```css
--primary: 0 80% 42%;
--primary-foreground: 0 0% 95%;
--accent: 0 80% 42%;
--accent-foreground: 0 0% 95%;
--ring: 0 80% 42%;
--secondary: 350 60% 25%;
--secondary-foreground: 45 29% 90%;

/* Custom Quiz Colors - renomeados semanticamente */
--gold: 0 80% 42%;
--gold-light: 0 75% 55%;
--gold-dark: 0 85% 28%;
--burgundy: 350 60% 25%;
--burgundy-light: 350 55% 38%;
```

### 2. `src/index.css` - Utility Classes

Atualizar os gradientes e sombras:

```css
.text-gradient-gold {
  /* De dourado para vermelho degradado */
  @apply bg-gradient-to-r from-[hsl(0_75%_55%)] via-[hsl(0_80%_42%)] to-[hsl(0_85%_28%)] bg-clip-text text-transparent;
}

.bg-gradient-gold {
  @apply bg-gradient-to-r from-[hsl(0_85%_28%)] via-[hsl(0_80%_42%)] to-[hsl(0_75%_55%)];
}

.shadow-gold {
  box-shadow: 0 4px 30px -5px hsl(0 80% 42% / 0.3);
}

.shadow-gold-lg {
  box-shadow: 0 10px 50px -10px hsl(0 80% 42% / 0.4);
}

.bg-gradient-lupin-progress {
  background: linear-gradient(
    90deg,
    hsl(350 60% 25%) 0%,
    hsl(355 55% 35%) 20%,
    hsl(0 75% 42%) 50%,
    hsl(0 80% 50%) 100%
  );
}

.shadow-lupin-glow {
  box-shadow: 
    0 0 8px hsl(0 80% 50% / 0.5),
    0 0 20px hsl(350 60% 25% / 0.3);
}
```

### 3. `tailwind.config.ts`

Manter os nomes dos tokens para compatibilidade mas os valores virao do CSS. Nenhuma mudanca estrutural necessaria pois os tokens (`gold`, `burgundy`, etc.) ja referenciam variaveis CSS.

### 4. `index.html` - CSS Critico

Atualizar as cores inline para evitar flash:

```css
body { 
  background-color: hsl(0 0% 4%); /* mantem preto */
  color: hsl(45 29% 90%); /* mantem creme */
}
```

O background e foreground nao mudam, apenas as cores de acento.

### 5. Componentes - Shimmer Effects

Atualizar as referencias hardcoded de cor nos componentes:

**QuizQuestion.tsx (linha 63, 104):**
- Shimmer: `via-[hsl(43_70%_75%)/0.35]` -> `via-[hsl(0_70%_70%)/0.35]`
- Selection ripple: `hsl(43 74% 53% / ...)` -> `hsl(0 80% 42% / ...)`

**QuizLoading.tsx (linha 80, 130):**
- Shimmer: `via-[hsl(43_70%_75%)/0.4]` -> `via-[hsl(0_70%_70%)/0.4]`
- Glow effect classe `bg-gradient-gold` e `shadow-gold-lg` ja serao atualizados via CSS

### 6. Sidebar Variables

Atualizar tambem as variaveis de sidebar:
```css
--sidebar-primary: 0 80% 42%;
--sidebar-primary-foreground: 0 0% 95%;
--sidebar-ring: 0 80% 42%;
```

---

## O Que NAO Sera Alterado

- Copy (nenhuma palavra)
- Estrutura do funil e layout
- Animacoes e transicoes
- Eventos de rastreamento
- Logica condicional
- Responsividade
- Performance

## Resultado Esperado

- Paleta totalmente vermelha/crimson/preta substituindo o dourado
- Coerencia visual com a identidade das imagens de referencia
- Gradientes, sombras e brilhos em tons de vermelho
- Sensacao premium, elegante e imersiva mantida
- Nenhuma regressao funcional
