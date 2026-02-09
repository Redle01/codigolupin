
# Ajustar visual dos resultados: CTAs e precos verdes

## Alteracoes

### 1. `src/index.css` - Adicionar utilitarios verdes

Adicionar classes utilitarias para o gradiente verde dos CTAs e shadow verde:

```css
.bg-gradient-green {
  @apply bg-gradient-to-r from-[hsl(145_70%_30%)] via-[hsl(145_65%_38%)] to-[hsl(145_60%_45%)];
}

.shadow-green-lg {
  box-shadow: 0 10px 50px -10px hsl(145 65% 38% / 0.4);
}

.shadow-green {
  box-shadow: 0 4px 30px -5px hsl(145 65% 38% / 0.3);
}
```

### 2. `src/components/quiz/QuizResult.tsx` - CTA verde e preco reestruturado

**CTA (linha 150):**
- Trocar `bg-gradient-gold` por `bg-gradient-green`
- Trocar `shadow-gold-lg` por `shadow-green-lg`
- Trocar `hover:shadow-gold` por `hover:shadow-green`

**Preco (linhas 105-110):**
- Trocar cores de `text-primary` para `text-green-500` nos elementos de preco
- Reduzir visualmente `installments` (parcelas): texto menor e cor mais suave
- Aumentar destaque do valor principal (`amount`): texto `text-5xl md:text-6xl`
- Reduzir centavos: texto `text-base md:text-lg` e peso `font-semibold` (em vez de `font-bold`)
- Reduzir `currency` (R$): texto `text-base md:text-lg`

Estrutura resultante do bloco de preco:

```tsx
<div className="flex items-baseline justify-center gap-1 mb-4">
  <span className="text-muted-foreground text-xs md:text-sm">{pricing.installments}</span>
  <span className="text-green-500 text-base md:text-lg font-semibold">{pricing.currency}</span>
  <span className="text-green-500 text-5xl md:text-6xl font-bold leading-none">{pricing.amount}</span>
  <span className="text-green-500 text-base md:text-lg font-semibold self-start mt-1">{pricing.cents}</span>
</div>
```

### 3. Sem impacto em performance

- Apenas alteracoes de classes CSS Tailwind (zero JS adicional)
- Utilitarios CSS adicionais sao minimos (3 classes)
- Nenhum novo import ou dependencia
