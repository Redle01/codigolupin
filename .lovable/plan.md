
# Plano: Ajustes Mobile na Landing Page

## Resumo Executivo

Este plano implementa melhorias de responsividade mobile na primeira página do funil, removendo a coroa e ajustando espaçamentos para uma experiência mais limpa e centralizada no mobile, sem afetar o desktop.

---

## Alterações a Realizar

### 1. Remover Ícone da Coroa

**Arquivo:** `src/components/quiz/QuizLanding.tsx`

| Ação | Linhas | Descrição |
|------|--------|-----------|
| Remover import `Crown` | 2 | Não será mais utilizado |
| Remover bloco da coroa | 31-38 | Remover completamente o ícone |

```tsx
// Antes (linha 2)
import { Crown, Sparkles, Users } from "lucide-react";

// Depois
import { Sparkles, Users } from "lucide-react";
```

```tsx
// Remover completamente (linhas 31-38)
<m.div
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
  className="inline-flex items-center justify-center w-14 h-14 md:w-18 md:h-18 mb-4 md:mb-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30"
>
  <Crown className="w-7 h-7 md:w-9 md:h-9 text-primary" />
</m.div>
```

---

### 2. Ajustes de Espaçamento Mobile

**Container principal (linha 14):**
```tsx
// Antes
className="min-h-screen flex flex-col items-center justify-start md:justify-center px-4 py-6 md:px-4 md:py-8 relative"

// Depois - Adiciona padding horizontal mais confortável no mobile
className="min-h-screen flex flex-col items-center justify-center px-5 py-8 md:px-4 md:py-8 relative"
```

Alterações:
- `justify-start md:justify-center` → `justify-center` (centraliza verticalmente em todas as telas)
- `px-4` → `px-5` (padding horizontal ligeiramente maior no mobile para respiração)
- `py-6` → `py-8` (padding vertical mais generoso no mobile)

---

### 3. Ajustes na Headline (linha 45)

```tsx
// Antes
className="text-xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-5 leading-tight"

// Depois - Aumenta tamanho mobile e melhora espaçamento
className="text-[22px] md:text-3xl lg:text-4xl font-bold mb-4 md:mb-5 leading-snug md:leading-tight px-2 md:px-0"
```

Alterações:
- `text-xl` → `text-[22px]` (tamanho ligeiramente maior para melhor legibilidade)
- `mb-3` → `mb-4` (mais espaço após headline no mobile)
- `leading-tight` → `leading-snug md:leading-tight` (espaçamento entre linhas mais confortável)
- Adiciona `px-2 md:px-0` (padding horizontal interno no mobile)

---

### 4. Ajustes na Subheadline (linha 58)

```tsx
// Antes
className="text-sm md:text-base lg:text-lg text-muted-foreground mb-6 md:mb-10 max-w-xl mx-auto leading-relaxed"

// Depois - Melhora legibilidade mobile
className="text-[15px] md:text-base lg:text-lg text-muted-foreground mb-8 md:mb-10 max-w-xl mx-auto leading-relaxed px-1 md:px-0"
```

Alterações:
- `text-sm` → `text-[15px]` (ligeiramente maior para conforto de leitura)
- `mb-6` → `mb-8` (mais espaço antes do CTA no mobile)
- Adiciona `px-1 md:px-0` (pequeno padding interno)

---

### 5. Ajustes no Botão CTA (linha 74)

```tsx
// Antes
className="bg-gradient-gold text-primary-foreground font-bold text-base md:text-lg px-6 md:px-10 py-5 md:py-6 rounded-xl shadow-gold-lg hover:shadow-gold transition-all duration-300 hover:scale-105"

// Depois - Largura máxima no mobile para melhor toque
className="bg-gradient-gold text-primary-foreground font-bold text-[15px] md:text-lg px-5 md:px-10 py-5 md:py-6 rounded-xl shadow-gold-lg hover:shadow-gold transition-all duration-300 hover:scale-105 w-full max-w-[320px] md:w-auto md:max-w-none"
```

Alterações:
- `text-base` → `text-[15px]` (tamanho otimizado para mobile)
- `px-6` → `px-5` (ajuste de padding)
- Adiciona `w-full max-w-[320px] md:w-auto md:max-w-none` (largura controlada no mobile)

---

### 6. Ajustes no Texto Auxiliar (linha 86)

```tsx
// Antes
className="text-xs md:text-sm text-muted-foreground mt-4 md:mt-5 italic"

// Depois
className="text-[13px] md:text-sm text-muted-foreground mt-5 md:mt-5 italic px-4 md:px-0"
```

Alterações:
- `text-xs` → `text-[13px]` (ligeiramente maior para legibilidade)
- `mt-4` → `mt-5` (espaçamento uniforme)
- Adiciona `px-4 md:px-0` (padding horizontal no mobile)

---

### 7. Ajustes no Social Proof (linha 96)

```tsx
// Antes
className="flex items-center justify-center gap-2 mt-4 md:mt-6 text-muted-foreground"

// Depois
className="flex items-center justify-center gap-2 mt-5 md:mt-6 text-muted-foreground"
```

Alteração:
- `mt-4` → `mt-5` (espaçamento mais uniforme no mobile)

---

## Estrutura Final Mobile

```text
┌────────────────────────────────────────────┐
│                   (8px)                    │
│                                            │
│   Por Que Mulheres Te Veem Apenas Como     │
│                 "Amigo"                    │
│  (Mesmo Você Sendo Um Bom Partido)?        │
│                                            │
│              (4px margin)                  │
│                                            │
│  Descubra o ÚNICO erro que está sabotando  │
│  suas chances com mulheres de qualidade... │
│                                            │
│              (8px margin)                  │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │   DESCOBRIR MEU ERRO FATAL AGORA     │  │
│  └──────────────────────────────────────┘  │
│                                            │
│              (5px margin)                  │
│                                            │
│   "Apenas 2 minutos podem mudar sua..."   │
│                                            │
│              (5px margin)                  │
│                                            │
│       👥 12.847 homens já descobriram      │
│                                            │
└────────────────────────────────────────────┘
```

---

## Garantias

- Copy inalterada
- Fonte inalterada (Archivo)
- Estrutura do funil preservada
- Ordem dos elementos mantida
- Design desktop sem alterações (todas mudanças com prefixo `md:`)
- Identidade visual premium preservada
- Performance mantida (menos um componente animado)
- CTA em destaque e centralizado

---

## Comparativo Visual

| Aspecto | Antes | Depois |
|---------|-------|--------|
| Coroa | Visível | Removida |
| Centralização vertical | `justify-start` no mobile | `justify-center` |
| Headline | `text-xl` | `text-[22px]` |
| Subheadline | `text-sm` | `text-[15px]` |
| Espaçamento pré-CTA | `mb-6` | `mb-8` |
| Botão CTA | Largura auto | `max-w-[320px]` no mobile |
| Padding horizontal | `px-4` | `px-5` |
