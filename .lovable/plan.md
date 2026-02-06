

# Plano: Atualização Completa da Copy do Funil

## Resumo

Substituir 100% do conteúdo textual do funil pela nova copy fornecida, mantendo estrutura visual, layout, cores, fontes e lógica de navegação intactos.

---

## Arquivos a Modificar

| Arquivo | Tipo de Alteração |
|---------|-------------------|
| `src/lib/quizConfig.ts` | Atualizar perguntas, resultados e adicionar dados de bônus |
| `src/components/quiz/QuizLanding.tsx` | Atualizar headline, subtítulo, CTA e value proposition |
| `src/components/quiz/EmailCapture.tsx` | Atualizar título, descrição, benefícios e CTA |
| `src/components/quiz/QuizResult.tsx` | Adicionar seção de oferta e bônus com lógica condicional |
| `src/components/quiz/Quiz.tsx` | Passar `offerFlow` para QuizResult |

---

## Detalhes de Implementação

### 1. Atualização do `quizConfig.ts`

#### Perguntas Atualizadas (8 perguntas)

| # | Nova Pergunta |
|---|---------------|
| 1 | "Qual dessas situações te deixa mais frustrado com mulheres?" |
| 2 | "Qual frase você já ouviu demais de mulheres?" |
| 3 | "O que mais te incomoda em festas e eventos?" |
| 4 | "Se pudesse ter uma transformação completa, qual seria sua maior conquista?" |
| 5 | "Como você se vê hoje em termos de sucesso com mulheres?" |
| 6 | "Onde você se sente mais confiante atualmente?" |
| 7 | "Para resolver definitivamente sua vida romântica, quanto você investiria?" |
| 8 | "Se tivesse acesso hoje a um método comprovado, quando começaria?" |

#### Resultados Atualizados (4 perfis)

**Gentleman → "O Gentleman Invisível" (40%)**
- Subtítulo: "40%"
- Novo diagnóstico, potencial e próximo passo conforme copy
- CTA: "DESPERTAR MEU MAGNETISMO AGORA"

**Estrategista → "O Estrategista Paralisado" (30%)**
- Subtítulo atualizado
- CTA: "TRANSFORMAR ANÁLISE EM ATRAÇÃO"

**Diamante → "O Diamante Bruto" (20%)**
- Subtítulo atualizado
- CTA: "REFINAR MEU DIAMANTE AGORA"

**Guerreiro → "O Guerreiro Ferido" (10%)**
- Subtítulo atualizado
- CTA: "RECONSTRUIR MINHA CONFIANÇA"

#### Nova Estrutura de Dados para Bônus

```typescript
export interface ResultData {
  type: ResultType;
  title: string;
  subtitle: string;
  percentage: string;
  // Renomear campos para refletir nova estrutura:
  result: string;        // "Seu Resultado"
  potential: string;     // "Seu Maior Potencial"
  nextStep: string;      // "Próximo Passo"
  ctaText: string;
}

// Configuração de bônus (separada por fluxo)
export const bonusConfig = {
  flow1: {
    primary: '🎁 "12 Técnicas de Conversação que Hipnotizam Mulheres"',
    secondary: '🎁 "25 Frases que Desarmam Qualquer Mulher" (Valor: R$ 67)',
  },
  flow2: {
    primary: '🎁 "As Confissões de Arsène Lupin" (Valor: R$ 97)',
    secondary: '🎁 "25 Frases que Desarmam Qualquer Mulher" (Valor: R$ 67)',
  },
  pricing: "🔥 OFERTA ESPECIAL para seu perfil: 12x de R$ 10,03",
};
```

### 2. Atualização do `QuizLanding.tsx`

| Elemento | Conteúdo Atual | Novo Conteúdo |
|----------|----------------|---------------|
| Headline | "Por Que Mulheres Te Veem Apenas Como 'Amigo' (Mesmo Você Sendo Um Bom Partido)?" | "Por Que Algumas Mulheres Te Veem Apenas Como 'Amigo'?" |
| Subtítulo | Descubra o ÚNICO erro... Carnaval 2026 | "Descubra o ÚNICO bloqueio que está sabotando suas chances com mulheres de qualidade e como despertar o magnetismo que elas não conseguem resistir" |
| Value Prop (abaixo CTA) | "Apenas 2 minutos podem mudar..." | "Em menos de 2 minutos, você descobrirá exatamente por que mulheres sofisticadas te colocam na friendzone e qual é seu tipo específico de magnetismo masculino adormecido." |
| CTA | "DESCOBRIR MEU ERRO FATAL AGORA" | "DESCOBRIR MEU BLOQUEIO AGORA" |
| Social Proof | "X homens já descobriram seu erro" | Manter estrutura, ajustar texto se necessário |

### 3. Atualização do `EmailCapture.tsx`

| Elemento | Novo Conteúdo |
|----------|---------------|
| Título | "RECEBA SEU DIAGNÓSTICO + ACESSO EXCLUSIVO" |
| Value Proposition | "Descubra seu perfil e ganhe acesso exclusivo ao método que transformou homens em ímãs de atração feminina" |
| Placeholder | "Seu melhor email aqui..." (manter) |
| CTA | "DESCOBRIR MEU PERFIL AGORA" |
| Segurança | 🔒 "Seus dados estão seguros. Nunca compartilhamos seu email." (manter) |

**Lista de benefícios será simplificada** (remover bônus específicos desta tela, pois serão exibidos na página de resultado)

### 4. Atualização do `QuizResult.tsx`

Adicionar nova seção de **Oferta Especial** e **Bônus** com lógica condicional:

```tsx
interface QuizResultProps {
  result: ResultData;
  onCheckout: () => void;
  offerFlow: 1 | 2 | null;  // ADICIONAR
}

// Dentro do componente, após a seção de "Próximo Passo":
{/* Offer Section */}
<m.div className="...">
  <p className="text-primary font-bold">
    🔥 OFERTA ESPECIAL para seu perfil: 12x de R$ 10,03
  </p>
  
  <p className="text-muted-foreground mt-3">Bônus Inclusos:</p>
  <ul className="mt-2 space-y-2">
    <li>
      {offerFlow === 1 
        ? '🎁 "12 Técnicas de Conversação que Hipnotizam Mulheres"'
        : '🎁 "As Confissões de Arsène Lupin" (Valor: R$ 97)'
      }
    </li>
    <li>
      🎁 "25 Frases que Desarmam Qualquer Mulher" (Valor: R$ 67)
    </li>
  </ul>
</m.div>
```

### 5. Atualização do `Quiz.tsx`

Passar `offerFlow` para o componente `QuizResult`:

```tsx
{state.currentStep === "result" && state.result && (
  <QuizResult
    result={results[state.result]}
    onCheckout={handleCheckout}
    offerFlow={state.offerFlow}  // ADICIONAR
  />
)}
```

---

## Mapeamento Completo de Perguntas

### Pergunta 1
**Nova:** "Qual dessas situações te deixa mais frustrado com mulheres?"
| Opção | Texto |
|-------|-------|
| A | Ver caras "inferiores" conquistando mulheres que você nem consegue abordar |
| B | Ser sempre o "confidente" que escuta sobre outros homens |
| C | Mulheres te elogiarem como "homem ideal" mas nunca se interessarem sexualmente |
| D | Conseguir números e conversas, mas elas sempre "esfriam" mysteriosamente |

### Pergunta 2
**Nova:** "Qual frase você já ouviu demais de mulheres?"
| Opção | Texto |
|-------|-------|
| A | "Você é um amor, mas..." / "Você merece alguém especial" |
| B | "Você é perfeito demais para mim" / "Não quero te machucar" |
| C | "Somos muito diferentes" / "Você não me entende" |
| D | "Você é o homem ideal no papel" / "Não rola química" |

### Pergunta 3
**Nova:** "O que mais te incomoda em festas e eventos?"
| Opção | Texto |
|-------|-------|
| A | Ver homens "menos qualificados" saindo com as mulheres que você quer |
| B | Ficar sempre observando sem coragem de abordar |
| C | Não saber quando e como "partir para cima" sem parecer desesperado |
| D | Conversar bem mas nunca evoluir para algo romântico |

### Pergunta 4
**Nova:** "Se pudesse ter uma transformação completa, qual seria sua maior conquista?"
| Opção | Texto |
|-------|-------|
| A | Ser o homem mais desejado dos ambientes que frequento |
| B | Ter múltiplas opções românticas e poder escolher |
| C | Reconquistar minha ex com um magnetismo irresistível |
| D | Nunca mais passar por situações humilhantes de rejeição |

### Pergunta 5
**Nova:** "Como você se vê hoje em termos de sucesso com mulheres?"
| Opção | Texto |
|-------|-------|
| A | Tenho potencial, mas algo crucial está faltando |
| B | Sou um bom partido, mas mulheres não me veem romanticamente |
| C | Entendo teoria, mas travo na prática |
| D | Já tive sucessos, mas nada consistente ou duradouro |

### Pergunta 6
**Nova:** "Onde você se sente mais confiante atualmente?"
| Opção | Texto |
|-------|-------|
| A | Trabalho e ambientes profissionais |
| B | Entre amigos próximos e família |
| C | Conversas intelectuais e culturais |
| D | Atividades que domino completamente |

### Pergunta 7 (CONDICIONAL)
**Nova:** "Para resolver definitivamente sua vida romântica, quanto você investiria?"
| Opção | Texto | Fluxo |
|-------|-------|-------|
| A | Até R$ 50 - o mínimo possível | Flow 1 |
| B | Entre R$ 50 e R$ 100 - algo acessível | Flow 1 |
| C | Entre R$ 100 e R$ 150 - se realmente funcionar | Flow 2 |
| D | Mais de R$ 150 - resultado vale qualquer investimento | Flow 2 |

### Pergunta 8
**Nova:** "Se tivesse acesso hoje a um método comprovado, quando começaria?"
| Opção | Texto |
|-------|-------|
| A | Imediatamente - não aguento mais essa situação |
| B | Esta semana - só preciso me organizar |
| C | Este mês - quero me preparar mentalmente |
| D | Eventualmente - quando for "a hora certa" |

---

## Mapeamento Completo de Resultados

### O Gentleman Invisível (40%)

**Seu Resultado:**
"Você é o clássico 'Gentleman Invisível' - um homem de valor excepcional que mulheres respeitam profundamente, mas que não desperta o fogo da paixão que elas sentem secretamente por outros homens."

**Seu Maior Potencial:**
"Transformar sua elegância natural em magnetismo sexual irresistível. Você já tem 80% do que precisa - falta apenas despertar a aura de mistério e perigo controlado que faz mulheres fantasiarem sobre você."

**Próximo Passo:**
"O Código de Arsène Lupin foi criado especificamente para homens como você. Através da Técnica da Elegância Perigosa, você manterá toda sua sofisticação mas adicionará o elemento de imprevisibilidade que transforma 'respeito' em 'obsessão romântica'."

**CTA:** "DESPERTAR MEU MAGNETISMO AGORA"

---

### O Estrategista Paralisado (30%)

**Seu Resultado:**
"Você é o 'Estrategista Paralisado' - possui inteligência superior e entende teoricamente sedução, mas seu próprio intelecto virou sua prisão. Você analisa demais e quando chega a hora H, trava."

**Seu Maior Potencial:**
"Transformar seu intelecto de obstáculo em arma de sedução letal. Sua capacidade analítica pode se tornar seu maior trunfo para criar mistério e tensão sexual calculada."

**Próximo Passo:**
"O Código de Arsène Lupin vai te ensinar as 12 Técnicas de Conversação Hipnótica que transformam pensamentos demais em charme irresistível. Você aprenderá a canalizar sua inteligência para criar fascinação ao invés de análise paralela."

**CTA:** "TRANSFORMAR ANÁLISE EM ATRAÇÃO"

---

### O Diamante Bruto (20%)

**Seu Resultado:**
"Você é o 'Diamante Bruto' - possui carisma natural e já teve sucessos, mas falta consistência e sofisticação para atrair mulheres de alto valor. Às vezes funciona, às vezes não."

**Seu Maior Potencial:**
"Sistematizar seu sucesso natural e elevar seu nível para conquistar as mulheres mais sofisticadas e desejadas. Você tem o raw material - precisa apenas do refinamento aristocrático."

**Próximo Passo:**
"O Código de Arsène Lupin vai polir seu diamante através do Protocolo de Conquista Parisiense. Você aprenderá a escalar elegantemente e manter o mistério que transforma atração em obsessão."

**CTA:** "REFINAR MEU DIAMANTE AGORA"

---

### O Guerreiro Ferido (10%)

**Seu Resultado:**
"Você é o 'Guerreiro Ferido' - já foi confiante romanticamente, mas experiências dolorosas (traição, rejeição humilhante) abalaram sua autoestima masculina. Agora se protege através do isolamento."

**Seu Maior Potencial:**
"Reconstruir sua confiança e se tornar mais poderoso do que jamais foi. Suas feridas podem se transformar em força magnética se você souber como canalizar essa experiência."

**Próximo Passo:**
"O Código de Arsène Lupin vai reconstruir sua confiança através da Metamorfose do Gentleman Ladrão. Você não apenas recuperará sua confiança anterior - se tornará blindado contra rejeição."

**CTA:** "RECONSTRUIR MINHA CONFIANÇA"

---

## Estrutura da Seção de Oferta (Página de Resultado)

```text
┌──────────────────────────────────────────────────────────────┐
│  🔥 OFERTA ESPECIAL para seu perfil: 12x de R$ 10,03        │
│                                                              │
│  Bônus Inclusos:                                             │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🎁 [Bônus Condicional baseado em Q7]                   │  │
│  │    Flow 1 (A/B): "12 Técnicas de Conversação..."       │  │
│  │    Flow 2 (C/D): "As Confissões de Arsène Lupin"       │  │
│  ├────────────────────────────────────────────────────────┤  │
│  │ 🎁 "25 Frases que Desarmam Qualquer Mulher"            │  │
│  │    (Valor: R$ 67)                                      │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## Garantias

- ✅ Copy substituída literalmente, sem edições
- ✅ Estrutura visual/layout 100% preservada
- ✅ Cores, fontes e espaçamentos intactos
- ✅ Lógica de navegação inalterada
- ✅ Métricas e rastreamento não afetados
- ✅ Lógica condicional Q7 → Bônus implementada
- ✅ Ordem das páginas mantida
- ✅ Mesmo número de perguntas (8)
- ✅ Performance não impactada

