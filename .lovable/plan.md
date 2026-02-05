

# Plano: Remover Evento InitiateCheckout do Funil

## Problema Identificado

O funil está disparando o evento `InitiateCheckout` do Meta Pixel antes do redirecionamento para o checkout da Ticto. Isso causa:
- Duplicidade de eventos (funil + checkout da Ticto)
- Dados incorretos/antecipados sendo enviados ao Meta Ads
- Otimização de campanha comprometida

## Arquivos a Modificar

### 1. `src/hooks/useQuiz.ts`

**Remover o disparo do `trackInitiateCheckout`** na função `redirectToCheckout`:

```typescript
// Linha 45 - ANTES
const { trackInitiateCheckout, trackChegouCheckout } = useMetaPixel();

// Linha 45 - DEPOIS (remover trackInitiateCheckout)
const { trackChegouCheckout } = useMetaPixel();
```

```typescript
// Linhas 265-270 - REMOVER COMPLETAMENTE
// 2. InitiateCheckout padrão
trackInitiateCheckout({
  content_name: state.result || "Quiz Result",
  value: flow === 1 ? 47 : 97,
  currency: "BRL",
});
```

```typescript
// Linha 279 - ANTES
}, [state.email, state.result, state.offerFlow, trackInitiateCheckout, trackChegouCheckout]);

// DEPOIS (remover trackInitiateCheckout das dependências)
}, [state.email, state.result, state.offerFlow, trackChegouCheckout]);
```

---

### 2. `src/hooks/useMetaPixel.ts`

**Remover a função `trackInitiateCheckout`** que não será mais utilizada:

```typescript
// Linhas 29-42 - REMOVER COMPLETAMENTE
// InitiateCheckout - disparar no clique do CTA que leva ao checkout
const trackInitiateCheckout = useCallback((data?: {
  content_name?: string;
  value?: number;
  currency?: string;
}) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "InitiateCheckout", {
      content_name: data?.content_name || "Quiz Result",
      value: data?.value || 0,
      currency: data?.currency || "BRL",
    });
  }
}, []);
```

```typescript
// Linha 85-86 - ANTES
return {
  trackPageView,
  trackInitiateCheckout,
  trackChegouCheckout,
  ...
};

// DEPOIS (remover trackInitiateCheckout do return)
return {
  trackPageView,
  trackChegouCheckout,
  ...
};
```

---

## Resultado Final

| Evento | Onde Dispara | Status |
|--------|--------------|--------|
| `PageView` | Funil (cada etapa) | Mantido |
| `ChegouNoCheckout` | Funil (antes do redirect) | Mantido (evento customizado) |
| `InitiateCheckout` | Checkout Ticto | Exclusivo da Ticto |

---

## Garantias

- Layout, copy e fluxo visual 100% inalterados
- Apenas ajustes no rastreamento
- Evento `PageView` continua funcionando normalmente
- Evento customizado `ChegouNoCheckout` permanece (útil para análise interna)
- Checkout da Ticto dispara `InitiateCheckout` corretamente

---

## Validação Pós-Implementação

1. Instalar extensão Meta Pixel Helper no Chrome
2. Navegar pelo funil completo
3. Verificar que apenas `PageView` é disparado nas etapas
4. Confirmar que `InitiateCheckout` NÃO aparece no funil
5. Ir até o checkout da Ticto e confirmar que `InitiateCheckout` dispara lá

