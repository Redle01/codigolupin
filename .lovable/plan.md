
# Remover "Cliques no Link" do Fluxo do Funil

## Resumo

Manter o card "Cliques no Link" nas metricas rapidas (grid superior), mas remover essa etapa do fluxo visual do funil e da tabela de resumo por etapa.

## Arquivo: `src/components/admin/FunnelMetricsInline.tsx`

### 1. Remover `link_click` do array `funnelSteps` (linha 41)

Remover a linha:
```
{ key: "link_click", label: "Cliques no Link", shortLabel: "Link", group: "pre-start" }
```

O array comecara diretamente com `landing`.

### 2. Remover o grupo `"pre-start"` do filtro de `preEmailSteps` (linha 191)

Atualizar de:
```
s.group === "pre-start" || s.group === "start" || s.group === "questions"
```
Para:
```
s.group === "start" || s.group === "questions"
```

### 3. Manter inalterado

- O card "Cliques no Link" na grid de metricas rapidas (linhas 199-209) permanece intacto
- O calculo do `biggestDropoff` passa a ignorar `link_click` automaticamente
- A barra de progresso e a tabela de resumo tambem deixam de incluir `link_click`

### Resultado

- Metricas rapidas: Cliques no Link, Entradas, Captura Email, Conversao Final, Maior Gargalo (sem alteracao)
- Fluxo do funil: Inicio -> Q1-Q8 -> Email -> Resultado (sem `link_click`)
- Tabela de resumo: Inicio -> Q1-Q8 -> Email -> Resultado (sem `link_click`)
