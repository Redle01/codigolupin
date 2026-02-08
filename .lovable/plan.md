

# Remover "Seu Tipo de Magnetismo" e icone/coroa dos resultados

## Arquivo

`src/components/quiz/QuizResult.tsx`

## Alteracoes

1. **Remover o bloco do icone/coroa** (linhas 49-67): O `m.div` que contem o circulo com o icone (Crown/Brain/Gem/Shield) e o efeito Sparkles sera removido inteiramente.

2. **Remover a linha "Seu Tipo de Magnetismo"** (linha 75-77): O `<p>` com o texto "Seu Tipo de Magnetismo" sera removido.

3. **Remover imports nao utilizados**: `Crown`, `Brain`, `Gem`, `Shield`, `Sparkles` e o mapa `iconMap` serao removidos, ja que nao terao mais uso.

4. **Remover import de `ResultType`** da interface, caso deixe de ser necessario para o `iconMap`.

O titulo do resultado, percentual, e todo o restante da pagina permanecem inalterados.

