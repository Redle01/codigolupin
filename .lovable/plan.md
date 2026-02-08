

# Mover captura de e-mail para depois da questao 8

## Resumo

Atualmente a captura de e-mail ocorre apos a questao 6. A alteracao move essa etapa para imediatamente apos a questao 8 (ultima pergunta), antes da tela de loading/resultado.

## Arquivo: `src/hooks/useQuiz.ts`

### 1. Remover desvio para e-mail apos a questao 6

A condicao na linha 107 que redireciona para `"email"` apos `nextQuestion === 6` sera removida.

### 2. Inserir desvio para e-mail apos a questao 8

Quando todas as perguntas forem respondidas (`nextQuestion >= quizQuestions.length`), em vez de ir direto para `"loading"`, o fluxo ira para `"email"`. O resultado sera pre-calculado e armazenado no estado nesse momento.

### 3. Ajustar `continueAfterEmail`

Atualmente retorna para `questions` no indice 6. Sera alterado para ir direto para `"loading"`, ja que todas as perguntas ja foram respondidas.

### 4. Ajustar `goBack` na tela de e-mail

Permitir que o botao voltar na tela de e-mail retorne a ultima pergunta (questao 8, indice 7).

## Arquivo: `src/components/quiz/Quiz.tsx`

### 5. Ajustar tracking de paginas

Nenhuma alteracao necessaria -- o tracking ja lida com o step `"email"` independentemente da posicao no fluxo.

## Fluxo resultante

```text
Landing -> Q1 -> Q2 -> Q3 -> Q4 -> Q5 -> Q6 -> Q7 -> Q8 -> Email -> Loading -> Resultado
```

Todos os eventos, integracao com Meta Pixel, submissao de leads e redirecionamento de checkout permanecem inalterados.

