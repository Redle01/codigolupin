
# Plano: Alterar Headlines e Questões para Fonte Archivo

## Problema Identificado

Os seguintes elementos estão usando `font-serif-display` (Playfair Display) em vez de Archivo:

| Arquivo | Linha | Elemento | Classe Atual |
|---------|-------|----------|--------------|
| `QuizLanding.tsx` | 45 | Headline principal | `font-serif-display` |
| `QuizQuestion.tsx` | 85 | Pergunta do quiz (h2) | `font-serif-display` |

---

## Arquivos a Modificar

### 1. `src/components/quiz/QuizLanding.tsx` (linha 45)

```tsx
// Antes
className="font-serif-display text-xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-5 leading-tight"

// Depois
className="text-xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-5 leading-tight"
```

### 2. `src/components/quiz/QuizQuestion.tsx` (linha 85)

```tsx
// Antes
className="font-serif-display text-xl md:text-3xl font-bold text-center mb-6 md:mb-10 text-foreground leading-relaxed"

// Depois
className="text-xl md:text-3xl font-bold text-center mb-6 md:mb-10 text-foreground leading-relaxed"
```

---

## Resultado

Após a alteração:
- Headline da landing page usará **Archivo** (herdado do body)
- Todas as perguntas do quiz usarão **Archivo** (herdado do body)
- Hierarquia visual mantida (tamanhos e pesos preservados)
- Consistência tipográfica em todo o funil

---

## Garantias

- Zero alteração em layout
- Zero alteração em espaçamentos
- Zero alteração em responsividade
- Zero alteração em animações
- Zero alteração em tracking/integrações
- Performance inalterada
