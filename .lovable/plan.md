

# Remover landing page e iniciar direto na primeira pergunta

## Alteracoes

### 1. `src/hooks/useQuiz.ts`
- Mudar estado inicial de `currentStep: "landing"` para `currentStep: "questions"` na funcao `getInitialState()`
- Remover tipo `"landing"` do union type de `currentStep`
- No `goBack`, quando `currentQuestion === 0`, nao voltar para landing -- simplesmente nao fazer nada (ja esta na primeira pergunta)
- Remover funcao `startQuiz` (nao ha mais landing para iniciar)

### 2. `src/components/quiz/Quiz.tsx`
- Remover import de `QuizLanding`
- Remover `MemoizedQuizLanding`
- Remover o bloco que renderiza `QuizLanding` (linhas 170-175)
- Remover `startQuiz` da desestruturacao do `useQuiz()`
- Remover import de `quizConfig` (so era usado para `totalParticipants`)
- No tracking de page views, remover o case `"landing"`
- No preload progressivo, remover o case `"landing"` que pre-carregava QuizQuestion (agora QuizQuestion carrega direto)
- QuizQuestion deixa de ser lazy-loaded -- deve ser importado estaticamente pois e o componente inicial

### 3. `src/components/quiz/QuizLanding.tsx`
- Deletar o arquivo (nao sera mais utilizado)

### 4. `src/components/quiz/AdminNavPanel.tsx`
- Remover opcao "landing" do painel de navegacao admin (se existir)

## O que NAO muda
- As 8 perguntas, email capture, loading e resultado permanecem identicos
- Tracking continua funcionando (primeiro page view sera `question1`)
- Meta Pixel e metricas nao sao afetados
- Persistencia de estado em localStorage continua funcionando

