
# Atualizar ordem do funil no Admin Nav Panel e Metricas

## Contexto

O fluxo atual do funil e: Landing -> Q1 -> Q2 -> Q3 -> Q4 -> Q5 -> Q6 -> Q7 -> Q8 -> Email -> Loading -> Resultado

Porem, dois lugares no codigo ainda refletem a ordem antiga (email apos Q6):

1. **Admin Nav Panel** (`src/components/quiz/AdminNavPanel.tsx`)
2. **Metricas do Funil** (`src/components/admin/FunnelMetricsInline.tsx`)

## Alteracoes

### 1. `src/components/quiz/AdminNavPanel.tsx` (linhas 16-28)

Reordenar o array `steps` para:

```
Landing -> Q1 -> Q2 -> Q3 -> Q4 -> Q5 -> Q6 -> Q7 -> Q8 -> Email -> Loading -> Result
```

Mover `{ id: "email", label: "Email" }` da posicao atual (entre Q6 e Q7) para depois de Q8.

### 2. `src/components/admin/FunnelMetricsInline.tsx` (linhas 39-51)

Reordenar o array `funnelSteps` para:

```
Inicio -> Q1 -> Q2 -> Q3 -> Q4 -> Q5 -> Q6 -> Q7 -> Q8 -> Email -> Resultado
```

- Mover Q7 e Q8 para o grupo `"questions"` (antes estavam em `"post-email"`)
- Mover Email para depois de Q8
- Ajustar os grupos: Q7 e Q8 passam de `"post-email"` para `"questions"`, e Email permanece como `"email"` mas na posicao correta

Isso garante que os cards visuais do funil, a barra de progresso e a tabela de resumo reflitam a ordem real do fluxo.
