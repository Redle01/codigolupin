
# Plano: Atualização de Garantia e CTAs

## Resumo

Duas alterações pontuais:
1. Atualizar "7 dias" → "30 dias" na garantia
2. Otimizar os 4 CTAs das páginas de resultado com linguagem de decisão ativa

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/quiz/QuizResult.tsx` | Atualizar "7 dias" → "30 dias" |
| `src/lib/quizConfig.ts` | Atualizar 4 textos de CTA |

---

## Detalhes de Implementação

### 1. Atualização da Garantia (`QuizResult.tsx`)

**Linha 180 - De:**
```tsx
🔒 Acesso imediato após confirmação • Garantia de 7 dias
```

**Para:**
```tsx
🔒 Acesso imediato após confirmação • Garantia de 30 dias
```

---

### 2. CTAs Otimizados (`quizConfig.ts`)

Cada CTA será adaptado ao contexto emocional do perfil, com palavra de ação/comprometimento:

| Perfil | CTA Atual | Novo CTA |
|--------|-----------|----------|
| **Gentleman Invisível** | "DESPERTAR MEU MAGNETISMO AGORA" | "SIM, QUERO DESPERTAR MEU MAGNETISMO" |
| **Estrategista Paralisado** | "TRANSFORMAR ANÁLISE EM ATRAÇÃO" | "SIM, QUERO TRANSFORMAR ANÁLISE EM ATRAÇÃO" |
| **Diamante Bruto** | "REFINAR MEU DIAMANTE AGORA" | "SIM, QUERO REFINAR MEU DIAMANTE" |
| **Guerreiro Ferido** | "RECONSTRUIR MINHA CONFIANÇA" | "SIM, QUERO RECONSTRUIR MINHA CONFIANÇA" |

**Lógica de otimização:**
- Prefixo "SIM, QUERO" → Transforma clique passivo em decisão consciente
- Mantém a essência emocional de cada perfil
- Linguagem de primeira pessoa → Usuário assume ownership da decisão
- Removido "AGORA" para evitar redundância (seta → já indica ação imediata)

---

## Alterações no Código

### `src/lib/quizConfig.ts` (Linhas 148, 158, 168, 178)

```typescript
// Linha 148 - Gentleman
ctaText: "SIM, QUERO DESPERTAR MEU MAGNETISMO",

// Linha 158 - Estrategista  
ctaText: "SIM, QUERO TRANSFORMAR ANÁLISE EM ATRAÇÃO",

// Linha 168 - Diamante
ctaText: "SIM, QUERO REFINAR MEU DIAMANTE",

// Linha 178 - Guerreiro
ctaText: "SIM, QUERO RECONSTRUIR MINHA CONFIANÇA",
```

### `src/components/quiz/QuizResult.tsx` (Linha 180)

```tsx
🔒 Acesso imediato após confirmação • Garantia de 30 dias
```

---

## O Que NÃO Será Alterado

- ✅ Estrutura do funil
- ✅ Copy fora dos CTAs
- ✅ Valores, ofertas ou condições
- ✅ Eventos, integrações ou lógica condicional
- ✅ Design, tipografia ou responsividade
- ✅ Performance e velocidade do funil

---

## Resultado Esperado

- Garantia clara de **30 dias** em todo o funil
- CTAs com linguagem de **decisão ativa** ("SIM, QUERO...")
- Aumento de intenção de clique sem impacto na experiência
- Consistência total entre os 4 perfis de resultado
