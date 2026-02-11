
# Remover OfferFlow 1 e unificar funil em oferta unica

## Resumo

Eliminar toda a bifurcacao condicional baseada na Pergunta 7. Todos os usuarios passam pelo mesmo fluxo e veem a mesma oferta (atual OfferFlow 2). O campo `offer_flow` continua existindo no banco mas sempre sera gravado como `2` (ou `null` para leads antigos).

## Alteracoes por arquivo

### 1. `src/lib/quizConfig.ts`

- Remover `checkoutUrls.flow1` e `question7FlowMapping` -- manter apenas uma URL de checkout
- Simplificar `quizConfig` para ter `checkoutUrl` unico apontando para `https://checkout.ticto.app/O6DE7A453`
- Remover `bonusConfig.flow1` e `bonusConfig.pricing.flow1`
- Simplificar `bonusConfig` para exportar diretamente os valores do flow2 (sem necessidade de selecao por fluxo)

### 2. `src/hooks/useQuiz.ts`

- Remover `offerFlow` do `QuizState` (ou fixar como `null`)
- Remover a funcao `getOfferFlow()`
- Remover logica condicional no `answerQuestion` que calculava `offerFlow` apos Q7
- Simplificar `redirectToCheckout` para usar URL unica, sem selecao por fluxo
- Remover `offer_flow` do body enviado ao `quiz-submit-email`
- UTM campaign passa a ser fixo (`utm_campaign=quiz`) em vez de `flow1`/`flow2`
- Remover `offerFlow` da persistencia em localStorage

### 3. `src/components/quiz/QuizResult.tsx`

- Remover prop `offerFlow`
- Remover logica de selecao de bonus/pricing por fluxo
- Usar diretamente os valores unificados do `bonusConfig`
- Simplificar `handleCheckoutClick` removendo `offer_flow` dos dados do Meta Pixel

### 4. `src/components/quiz/Quiz.tsx`

- Remover passagem da prop `offerFlow` ao `QuizResult`

### 5. `src/hooks/useMetaPixel.ts`

- Remover campo `offer_flow` dos parametros de `trackInitiateCheckout` e `trackChegouCheckout`

### 6. `src/components/admin/FunnelMetricsInline.tsx`

- Remover a secao "Distribuicao por Oferta (baseado na Q7)" (linhas 444-491)
- Remover `FlowCounts` interface e prop `flowCounts`
- Remover calculo de `totalFlowLeads`
- Remover imports nao utilizados (`Target`, `Zap`, `Crown`)

### 7. `src/pages/Admin.tsx`

- Remover os 4 cards de "Leads Oferta 1", "Conversoes Oferta 1", "Leads Oferta 2", "Conversoes Oferta 2" (linhas 377-405)
- Remover referencia a `flowStats` do visitorStats

### 8. `src/hooks/useLeads.ts`

- Remover `flowCounts` do `LeadStats` interface

### 9. `src/hooks/useVisitors.ts`

- Remover `offerFlow` do `Visitor` interface
- Remover `flowStats` do `VisitorStats` interface
- Remover mapeamento de `flowStats` no `fetchVisitors`

### 10. `src/components/admin/LeadsTable.tsx`

- Remover coluna "Oferta" que exibe badge com `lead.offer_flow`

### 11. `src/components/admin/VisitorProgressTable.tsx`

- Remover coluna/badge que exibe `visitor.offerFlow`

### 12. Edge Functions (nao alteram -- mantidas compativeis)

As edge functions (`quiz-submit-email`, `quiz-leads`, `quiz-metrics`) continuam aceitando e armazenando `offer_flow` no banco. Isso garante que leads antigos com flow 1 ou 2 permanecem intactos. Novos leads simplesmente nao enviarao mais esse campo (sera `null`). Nenhuma alteracao nas edge functions e necessaria.

## O que NAO muda

- As 8 perguntas do quiz continuam identicas
- A Pergunta 7 permanece no funil (so perde a funcao de bifurcacao)
- O banco de dados nao precisa de migracao (coluna `offer_flow` continua existindo, nullable)
- Edge functions permanecem inalteradas
- Fluxo de captura de email e loading nao mudam
- Meta Pixel continua disparando PageView e InitiateCheckout (apenas sem o campo `offer_flow`)
