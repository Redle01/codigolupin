

# Plano: Responsividade do Funil Admin + Risco Visual nos Bônus

## Resumo Executivo

Este plano implementa duas melhorias visuais:
1. **Área Admin**: Tornar o fluxo do funil completamente responsivo e legível em todas as resoluções
2. **Email Capture**: Adicionar risco elegante sobre os valores monetários dos bônus (R$67, R$97)

Zero alteração em lógica, dados ou identidade visual.

---

## Mudança 1: Responsividade do Funil Admin

### Problemas Identificados

| Problema | Arquivo | Linha |
|----------|---------|-------|
| Cards de etapas com `min-w-[90px]` fixo causam overflow | FunnelMetricsInline.tsx | 101 |
| Setas com `min-w-[32px]` ocupam espaço desnecessário | FunnelMetricsInline.tsx | 145 |
| Tabela de comparação não responsiva em mobile | FunnelMetricsInline.tsx | 368-427 |
| Textos e números podem ficar muito pequenos | FunnelMetricsInline.tsx | 117-123 |

### Solução Proposta

**1.1 Ajustar FunnelStepCard para ser mais flexível:**

```typescript
// Antes (linha 100-101)
className={cn(
  "relative flex flex-col rounded-xl border p-4 transition-all",
  size === "large" ? "min-w-[160px]" : "min-w-[90px]",
  ...
)}

// Depois - Usar flex-shrink e tamanhos menores em mobile
className={cn(
  "relative flex flex-col rounded-xl border p-3 lg:p-4 transition-all flex-shrink-0",
  size === "large" ? "min-w-[120px] lg:min-w-[160px]" : "min-w-[70px] lg:min-w-[90px]",
  ...
)}
```

**1.2 Ajustar setas de conexão:**

```typescript
// Antes (linha 145)
<div className="flex flex-col items-center mx-1 min-w-[32px]">

// Depois - Reduzir largura mínima
<div className="flex flex-col items-center mx-0.5 lg:mx-1 min-w-[24px] lg:min-w-[32px]">
```

**1.3 Tornar container do funil com scroll horizontal suave:**

```typescript
// Antes (linha 264)
<div className="flex items-stretch gap-1 overflow-x-auto pb-2">

// Depois - Adicionar scroll-smooth e indicador visual
<div className="flex items-stretch gap-0.5 lg:gap-1 overflow-x-auto pb-2 scroll-smooth scrollbar-thin">
```

**1.4 Ajustar tamanhos de texto responsivos:**

```typescript
// Antes (linha 117-123)
<span className={cn(
  "font-bold tracking-tight",
  size === "large" ? "text-3xl" : "text-xl",
  ...
)}>

// Depois - Tamanhos responsivos
<span className={cn(
  "font-bold tracking-tight",
  size === "large" ? "text-2xl lg:text-3xl" : "text-lg lg:text-xl",
  ...
)}>
```

**1.5 Tornar tabela de resumo responsiva:**

```typescript
// Adicionar scroll horizontal na tabela em mobile
<div className="rounded-lg border overflow-x-auto">
  <table className="w-full text-sm min-w-[500px]">
    ...
  </table>
</div>
```

**1.6 Ajustar grid de métricas rápidas:**

```typescript
// Antes (linha 196)
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

// Depois - Melhor adaptação em telas médias
<div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
```

---

## Mudança 2: Risco Visual nos Valores dos Bônus

### Localização

O componente `EmailCapture.tsx` exibe os bônus nas linhas 88-93:

```typescript
{[
  "Sua análise completa e personalizada",
  "Plano específico de transformação para seu tipo",
  "Bônus exclusivo: \"25 Frases de Impacto que Desarmam Qualquer Mulher\" (R$67)",
  "Bônus exclusivo: \"Dominando o Carnaval 2026\" (R$97) — Liberado por tempo limitado",
].map((benefit, index) => (
```

### Solução Proposta

Modificar o array para incluir marcação especial nos valores:

```typescript
// Definir os benefícios como objetos para melhor controle
const benefits = [
  { text: "Sua análise completa e personalizada" },
  { text: "Plano específico de transformação para seu tipo" },
  { 
    text: "Bônus exclusivo: \"25 Frases de Impacto que Desarmam Qualquer Mulher\"",
    value: "R$67"
  },
  { 
    text: "Bônus exclusivo: \"Dominando o Carnaval 2026\"",
    value: "R$97",
    suffix: "— Liberado por tempo limitado"
  },
];

// Renderizar com risco elegante no valor
{benefits.map((benefit, index) => (
  <m.li key={index} ...>
    <span className="text-primary font-bold text-base">✓</span>
    <span className="text-foreground text-sm leading-relaxed">
      {benefit.text}
      {benefit.value && (
        <>
          {" "}
          <span className="line-through text-muted-foreground/70 decoration-primary/40">
            ({benefit.value})
          </span>
        </>
      )}
      {benefit.suffix && ` ${benefit.suffix}`}
    </span>
  </m.li>
))}
```

### Estilo do Risco

O CSS `line-through` com `decoration-primary/40` cria:
- Risco suave e elegante
- Cor dourada/primária discreta
- Mantém legibilidade total do valor original
- Harmoniza com a identidade visual existente

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/components/admin/FunnelMetricsInline.tsx` | Ajustes de responsividade em cards, setas e tabela |
| `src/components/quiz/EmailCapture.tsx` | Adicionar risco visual nos valores dos bônus |

---

## Detalhes Técnicos

### FunnelMetricsInline.tsx - Mudanças Específicas

1. **Linha 100-106**: Reduzir padding e min-width com breakpoints responsivos
2. **Linha 117-123**: Ajustar tamanhos de fonte com classes responsivas
3. **Linha 145-158**: Reduzir espaçamento das setas
4. **Linha 196**: Ajustar grid para md:grid-cols-4
5. **Linha 264, 309**: Melhorar overflow com scroll suave
6. **Linha 367-368**: Adicionar overflow-x-auto e min-width na tabela

### EmailCapture.tsx - Mudanças Específicas

1. **Linhas 88-104**: Reestruturar array de benefícios para objetos
2. Aplicar classe `line-through text-muted-foreground/70 decoration-primary/40` nos valores
3. Manter toda a copy existente intacta

---

## Resultado Visual Esperado

### Admin - Funil Responsivo:
- Em desktop: Layout completo sem scroll horizontal
- Em tablet: Cards ligeiramente menores, scroll suave se necessário
- Em mobile: Scroll horizontal fluido, números legíveis, tabela com scroll

### Email Capture - Bônus com Risco:
```text
✓ Bônus exclusivo: "25 Frases de Impacto..." (R̶$̶6̶7̶)
✓ Bônus exclusivo: "Dominando o Carnaval 2026" (R̶$̶9̶7̶) — Liberado...
```

O risco será suave, na cor primária com opacidade reduzida, mantendo o valor completamente legível.

---

## Garantias

- **Zero alteração em lógica**: Apenas CSS e estrutura de rendering
- **Zero alteração em dados**: Métricas e valores permanecem iguais
- **Zero impacto em performance**: Classes CSS nativas
- **Identidade visual preservada**: Mesmas cores, fontes e estilos
- **Copy intacta**: Nenhum texto foi alterado

