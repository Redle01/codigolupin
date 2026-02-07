
# Plano: Correcoes e Otimizacoes nas Paginas de Resultado e Questoes

## Resumo das Alteracoes

8 modificacoes agrupadas em 3 arquivos principais, mais a copia do novo mockup.

---

## Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/lib/quizConfig.ts` | Corrigir typo Q1, atualizar valores Q7, bonus sem "Valor", pricing condicional |
| `src/components/quiz/QuizResult.tsx` | Novo mockup .webp, CTA responsivo, layout oferta com hierarquia visual, pricing condicional |
| `public/images/mockup-checkout.webp` | Copiar novo mockup do upload |

---

## 1. Correcao ortografica - Q1 opcao D (quizConfig.ts, linha 50)

```
"mysteriosamente" -> "misteriosamente"
```

## 2. Valores monetarios da Q7 (quizConfig.ts, linhas 107-110)

Ajustar para faixa R$ 50-100:

```typescript
{ id: "a", text: "Até R$ 50 - o mínimo possível", ... }
{ id: "b", text: "Entre R$ 50 e R$ 70 - algo acessível", ... }
{ id: "c", text: "Entre R$ 70 e R$ 100 - se realmente funcionar", ... }
{ id: "d", text: "Mais de R$ 100 - resultado vale qualquer investimento", ... }
```

## 3. Remover "Valor:" dos bonus e aplicar risco visual (quizConfig.ts)

De:
```typescript
flow1: {
  primary: '🎁 "12 Técnicas de Conversação que Hipnotizam Mulheres"',
  secondary: '🎁 "25 Frases que Desarmam Qualquer Mulher" (Valor: R$ 67)',
},
flow2: {
  primary: '🎁 "As Confissões de Arsène Lupin" (Valor: R$ 97)',
  secondary: '🎁 "25 Frases que Desarmam Qualquer Mulher" (Valor: R$ 67)',
},
```

Para: Remover "(Valor: R$ XX)" dos textos e mover os precos para campos separados para renderizar com `<s>` (risco visual) no componente.

Nova estrutura:
```typescript
flow1: {
  primary: '🎁 "12 Técnicas de Conversação que Hipnotizam Mulheres"',
  primaryPrice: null,
  secondary: '🎁 "25 Frases que Desarmam Qualquer Mulher"',
  secondaryPrice: 'R$ 67',
},
flow2: {
  primary: '🎁 "As Confissões de Arsène Lupin"',
  primaryPrice: 'R$ 97',
  secondary: '🎁 "25 Frases que Desarmam Qualquer Mulher"',
  secondaryPrice: 'R$ 67',
},
```

## 4. Pricing condicional por fluxo (quizConfig.ts)

Alterar `pricing` de string unica para objeto por fluxo:

```typescript
pricing: {
  flow1: { emoji: "🔥", label: "OFERTA ESPECIAL para seu perfil:", installments: "9x", currency: "R$", amount: "6", cents: ",18" },
  flow2: { emoji: "🔥", label: "OFERTA ESPECIAL para seu perfil:", installments: "12x", currency: "R$", amount: "10", cents: ",03" },
},
```

## 5. Layout da oferta especial com hierarquia visual (QuizResult.tsx)

Renderizar o pricing conforme a imagem de referencia:
- "12x" ou "9x" em tamanho menor
- "R$" em tamanho medio
- Valor principal (ex: "10") em tamanho grande e bold
- Centavos (",03") em tamanho menor, posicionados como superscript

```tsx
<div className="flex items-center justify-center gap-1">
  <span className="text-muted-foreground text-sm md:text-base">{pricing.installments}</span>
  <span className="text-primary text-lg md:text-xl font-bold">{pricing.currency}</span>
  <span className="text-primary text-4xl md:text-5xl font-bold leading-none">{pricing.amount}</span>
  <span className="text-primary text-lg md:text-xl font-bold self-start mt-1">{pricing.cents}</span>
</div>
```

## 6. Bonus com risco visual nos precos (QuizResult.tsx)

Renderizar os precos dos bonus com `<s>` (strikethrough):

```tsx
<li className="text-foreground text-sm md:text-base">
  {bonuses.primary}
  {bonuses.primaryPrice && <s className="text-muted-foreground ml-1">{bonuses.primaryPrice}</s>}
</li>
```

## 7. CTA responsivo no mobile (QuizResult.tsx)

Atualizar o botao CTA para permitir quebra de linha:

```tsx
<Button
  className="w-full h-auto min-h-[3.5rem] md:min-h-[4rem] py-3 md:py-4 px-4 md:px-6 bg-gradient-gold text-primary-foreground font-bold text-xs sm:text-sm md:text-lg rounded-xl shadow-gold-lg hover:shadow-gold transition-all duration-300 hover:scale-[1.02] group leading-tight whitespace-normal text-center"
>
```

Alteracoes:
- `whitespace-normal` (permite quebra de linha)
- `text-center` (centraliza texto quebrado)
- `text-xs sm:text-sm` (reduz ligeiramente no mobile extremo)

## 8. Novo mockup .webp (arquivo + QuizResult.tsx)

- Copiar `user-uploads://Mockup_webp.webp` para `public/images/mockup-checkout.webp`
- Atualizar referencia no componente de `.png` para `.webp`
- Manter `loading="lazy"`

---

## O Que NAO Sera Alterado

- Estrutura do funil e navegacao
- Copy fora dos pontos especificados
- Animacoes e transicoes
- Eventos de rastreamento (Meta Pixel)
- Logica de pontuacao e perfis
- Design geral e responsividade (exceto CTA mobile)
- Performance

---

## Resultado Esperado

- Typo corrigido na Q1
- CTAs visiveis e legíveis em todos os dispositivos mobile
- Mockup mais leve em .webp
- Bonus sem "Valor:", com risco visual nos precos
- Oferta especial com hierarquia visual clara (valor grande, parcelas pequenas)
- Pricing condicional: flow 1 = "9x de R$ 6,18", flow 2 = "12x de R$ 10,03"
- Valores da Q7 ajustados para faixa R$ 50-100
