

# Plano: Atualizar Bônus e Link do Checkout

## Resumo das Alterações

Duas modificações pontuais sem impacto no design ou estrutura:

1. **Remover** o bônus "As Confissões de Arsène Lupin" da lista de benefícios
2. **Atualizar** o link do checkout para o novo domínio Ticto

---

## Alteração 1: Remover Bônus

### Arquivo: `src/components/quiz/EmailCapture.tsx`

**Antes (linhas 88-94):**
```typescript
{[
  "Sua análise completa e personalizada",
  "Plano específico de transformação para seu tipo",
  "Bônus exclusivo: \"As Confissões de Arsène Lupin\" (R$97)",  // ← REMOVER
  "Bônus exclusivo: \"25 Frases de Impacto que Desarmam Qualquer Mulher\" (R$67)",
  "Bônus exclusivo: \"Dominando o Carnaval 2026\" (R$97) — Liberado por tempo limitado",
].map(...)}
```

**Depois:**
```typescript
{[
  "Sua análise completa e personalizada",
  "Plano específico de transformação para seu tipo",
  "Bônus exclusivo: \"25 Frases de Impacto que Desarmam Qualquer Mulher\" (R$67)",
  "Bônus exclusivo: \"Dominando o Carnaval 2026\" (R$97) — Liberado por tempo limitado",
].map(...)}
```

**Resultado**: Lista reduzida de 5 para 4 itens, sem espaços vazios ou quebras de layout.

---

## Alteração 2: Atualizar Link do Checkout

### Arquivo: `src/lib/quizConfig.ts`

**Antes (linha 4):**
```typescript
checkoutUrl: "https://pay.hotmart.com/YOUR_PRODUCT_ID",
```

**Depois:**
```typescript
checkoutUrl: "https://checkout.ticto.app/O6DE7A453",
```

---

### Arquivo: `src/hooks/useQuiz.ts`

Adicionar o novo domínio à allowlist de domínios permitidos.

**Antes (linhas 182-186):**
```typescript
const ALLOWED_CHECKOUT_DOMAINS = [
  'pay.hotmart.com',
  'app.hotmart.com',
  'checkout.hotmart.com',
];
```

**Depois:**
```typescript
const ALLOWED_CHECKOUT_DOMAINS = [
  'pay.hotmart.com',
  'app.hotmart.com',
  'checkout.hotmart.com',
  'checkout.ticto.app',
];
```

---

## Verificação de Segurança

| Item | Status |
|------|--------|
| Outros bônus mantidos | OK |
| Copy inalterado | OK |
| Design preservado | OK |
| Layout responsivo | OK |
| Hierarquia de CTAs | OK |
| Domínio HTTPS | OK |
| Rastreamento funcional | OK |

---

## Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/components/quiz/EmailCapture.tsx` | Remover linha do bônus "As Confissões..." |
| `src/lib/quizConfig.ts` | Atualizar URL do checkout |
| `src/hooks/useQuiz.ts` | Adicionar `checkout.ticto.app` à allowlist |

---

## Resultado Esperado

- Página de captura sem o bônus removido
- CTA final redirecionando para `https://checkout.ticto.app/O6DE7A453`
- Parâmetros `email` e `profile` anexados automaticamente à URL
- Zero impacto visual ou funcional no restante do funil

