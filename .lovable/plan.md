

# Ajustar logica de metricas do funil

## Resumo das alteracoes

Adicionar metrica "Cliques no link", ajustar "Entradas", corrigir referencias desatualizadas no funil, e adicionar confirmacao ao resetar.

---

## 1. Nova metrica "Cliques no link" (tracking ultra-leve)

**Arquivo: `index.html`**

Adicionar um script inline minimo (menos de 15 linhas) no `<head>` que:
- Verifica se a origem nao e interna (localhost, lovable preview)
- Usa `navigator.sendBeacon` para enviar um evento `link_click` ao edge function `quiz-metrics`
- Executa apenas uma vez por sessao (via `sessionStorage`)
- Nao bloqueia nenhum recurso - `sendBeacon` e fire-and-forget

**Arquivo: `supabase/functions/quiz-metrics/index.ts`**

- Aceitar `page_key: "link_click"` no action `track` (ja funciona, pois aceita qualquer `page_key`)
- Adicionar `link_click` ao objeto `pageViews` no action `stats` (linha 195)
- Atualizar `stepOrder` na linha 285 para a ordem correta do funil (email apos Q8)

---

## 2. Exibir "Cliques no link" e "Entradas" no admin

**Arquivo: `src/hooks/useFunnelMetrics.ts`**

- Adicionar `link_click: number` ao tipo `FunnelMetrics["pageViews"]`
- Adicionar `link_click: 0` ao `defaultMetrics`

**Arquivo: `src/components/admin/FunnelMetricsInline.tsx`**

- Adicionar card "Cliques no Link" antes do card "Entradas" na grid de metricas rapidas (linha 196)
- Card com icone `MousePointerClick` e subtitulo "intencao de entrada"
- Manter card "Entradas" com subtitulo atualizado para "visualizaram a pagina"
- Adicionar `link_click` como primeiro item no `funnelSteps` array (antes de `landing`) com grupo `"pre-start"`
- Ajustar secao "Captura de Email" (linhas 290-299): trocar referencia de `question6` para `question8`

---

## 3. Confirmacao ao resetar dados

**Arquivo: `src/pages/Admin.tsx`**

- Envolver o botao "Resetar" (linha 298-305) com um `AlertDialog` do shadcn
- Modal perguntara: "Deseja realmente resetar todas as metricas do funil?"
- Descricao: "Esta acao ira zerar todos os dados de metricas. Os dados nao podem ser recuperados."
- Reset so ocorre apos clicar "Confirmar Reset"

---

## 4. Correcao da ordem do funil no edge function

**Arquivo: `supabase/functions/quiz-metrics/index.ts`**

- Linha 203: reordenar `pageViews` para incluir `link_click` e colocar `email` apos `question8`
- Linha 285-287: atualizar `stepOrder` para:

```text
link_click, landing, question1-8, email, result
```

---

## 5. Performance

- O script inline em `index.html` usa `navigator.sendBeacon` que e nao-bloqueante e nao afeta o carregamento
- Nenhum import adicional de JS no bundle principal
- O tracking de `link_click` usa `sessionStorage` para evitar duplicatas sem custo adicional
- Nenhuma alteracao no fluxo de renderizacao do React

---

## Validacao tecnica

- Sem conflitos: `link_click` e uma nova `page_key` que nao interfere com as existentes
- Sem duplicacoes: protegido por `sessionStorage` (1 por sessao) e pela verificacao de evento existente no edge function
- A tabela `quiz_funnel_events` aceita qualquer `page_key` como texto, sem necessidade de migracao
- O modal de confirmacao usa componentes `AlertDialog` ja instalados no projeto

