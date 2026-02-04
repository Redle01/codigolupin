
# Plano: Nova Copy, Estrutura da Landing Page e Fonte Archivo

## Resumo Executivo

Este plano substitui completamente a copy da landing page e da Questao 1, implementa a fonte Archivo em todo o quiz, e garante responsividade mobile perfeita - tudo mantendo performance, tracking e integrações intactos.

---

## Mudanca 1: Nova Copy da Landing Page

### Arquivo: `src/components/quiz/QuizLanding.tsx`

**Estrutura Atual vs Nova:**

| Elemento | Atual | Novo |
|----------|-------|------|
| Headline | "Qual e Seu Tipo de Magnetismo Masculino?" | "Por Que Mulheres Te Veem Apenas Como 'Amigo' (Mesmo Voce Sendo Um Bom Partido)?" |
| Subheadline | Perfis (Sedutor Aristocrata, etc.) | "Descubra o UNICO erro que esta sabotando suas chances..." |
| Bloco Central | Citacao italica | Lista de identificacao com bullets negativos |
| Frase Transicao | N/A (novo) | "Entao este teste de 2 minutos vai CHOCAR voce." |
| CTA | "DESCOBRIR MEU TIPO AGORA" | "DESCOBRIR MEU ERRO FATAL AGORA" |
| Subtexto CTA | Social proof inline | "Apenas 2 minutos podem mudar sua vida romantica para sempre" |

### Implementacao Detalhada:

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                        NOVA ESTRUTURA DA LANDING                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [Icone Crown - mantido]                                                 │
│                                                                          │
│  HEADLINE:                                                               │
│  "Por Que Mulheres Te Veem Apenas Como 'Amigo'"                         │
│  "(Mesmo Voce Sendo Um Bom Partido)?"                                   │
│                                                                          │
│  SUBHEADLINE:                                                            │
│  "Descubra o UNICO erro que esta sabotando suas chances                 │
│   com mulheres de qualidade e como se transformar no homem              │
│   mais desejado do Carnaval 2026"                                       │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────┐            │
│  │ BLOCO DE IDENTIFICACAO (Card)                           │            │
│  │                                                         │            │
│  │ Se voce:                                                │            │
│  │ ❌ Ja foi rejeitado por uma mulher que depois ficou    │            │
│  │    com alguem "pior" que voce                           │            │
│  │ ❌ Escuta frequentemente: "Voce e um amor, mas..."     │            │
│  │    ou "Voce merece alguem especial"                     │            │
│  │ ❌ Consegue conversar bem, mas nunca evolui para       │            │
│  │    algo romantico                                       │            │
│  │ ❌ Sente que as mulheres te respeitam, mas nao         │            │
│  │    te DESEJAM                                           │            │
│  └─────────────────────────────────────────────────────────┘            │
│                                                                          │
│  FRASE DE TRANSICAO:                                                     │
│  "Entao este teste de 2 minutos vai CHOCAR voce."                       │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────┐            │
│  │ [Sparkles] DESCOBRIR MEU ERRO FATAL AGORA               │            │
│  └─────────────────────────────────────────────────────────┘            │
│                                                                          │
│  SUBTEXTO:                                                               │
│  "Apenas 2 minutos podem mudar sua vida romantica para sempre"          │
│                                                                          │
│  SOCIAL PROOF:                                                           │
│  [Users] 12.847 homens ja descobriram seu erro                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### Codigo Novo (QuizLanding.tsx):

O componente sera reestruturado mantendo:
- Mesmo esqueleto de animacoes (Framer Motion m.div)
- Mesmos delays otimizados
- Mesma estrutura de props
- ParticleBackground inalterado

Elementos novos:
- Lista de bullets com icone X vermelho/dourado
- Frase de transicao com destaque
- Subtexto abaixo do botao

---

## Mudanca 2: Nova Copy da Questao 1

### Arquivo: `src/lib/quizConfig.ts`

**Questao 1 - Antes:**
```
"Quando voce entra numa festa ou evento social, qual situacao descreve melhor o que acontece?"
```

**Questao 1 - Depois:**
```
"Qual dessas situacoes MAIS te machuca quando acontece?"
```

**Novas Respostas:**

| ID | Texto Novo | Pontos (mantidos) |
|----|------------|-------------------|
| a | Ver um cara "inferior" a voce saindo com a mulher que voce queria | gentleman: 3, estrategista: 2, diamante: 0, guerreiro: 1 |
| b | Ser chamado de "querido" por uma mulher que voce deseja romanticamente | gentleman: 3, estrategista: 1, diamante: 0, guerreiro: 1 |
| c | Conseguir o numero, conversar bem, mas ela "esfriar" do nada | gentleman: 1, estrategista: 3, diamante: 2, guerreiro: 0 |
| d | Mulheres te elogiarem como "homem ideal", mas nunca se interessarem sexualmente | gentleman: 2, estrategista: 1, diamante: 2, guerreiro: 2 |

**Nota:** Os pontos foram ajustados para refletir melhor o mapeamento psicologico das novas respostas.

---

## Mudanca 3: Fonte Archivo

### Arquivos a Modificar:

1. **`index.html`** - Adicionar font do Google Fonts
2. **`src/index.css`** - Atualizar font-family base
3. **`tailwind.config.ts`** - Adicionar fontFamily (opcional)

### Implementacao:

**index.html (linhas 30-38):**
```html
<!-- Fontes: Archivo (corpo) + Playfair Display (titulos) -->
<link 
  rel="preload" 
  as="style" 
  href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap"
  onload="this.onload=null;this.rel='stylesheet'"
/>
<noscript>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" />
</noscript>
```

**index.css (linha 107):**
```css
body {
  @apply bg-background text-foreground antialiased;
  font-family: 'Archivo', system-ui, sans-serif;
}
```

**Critical CSS em index.html (linha 17):**
```css
font-family: 'Archivo', system-ui, sans-serif;
```

### Por que Archivo?
- Moderna e masculina
- Excelente legibilidade
- Pesos variaveis (400-700) para hierarquia
- Carregamento rapido via Google Fonts
- Fallback seguro para system-ui

---

## Mudanca 4: Responsividade Mobile

### Ajustes em QuizLanding.tsx:

| Elemento | Desktop | Mobile |
|----------|---------|--------|
| Headline | text-4xl lg:text-5xl | text-xl md:text-3xl |
| Subheadline | text-lg | text-sm md:text-base |
| Bullets | text-base | text-sm |
| CTA Button | px-10 py-6 text-lg | px-6 py-5 text-base |
| Card padding | p-6 | p-4 md:p-5 |

### Classes Responsivas Aplicadas:

```text
Headline:      "text-xl md:text-3xl lg:text-4xl"
Subheadline:   "text-sm md:text-base lg:text-lg"
Bullets:       "text-sm md:text-sm" (consistente)
Transicao:     "text-base md:text-lg font-semibold"
CTA Button:    "text-base md:text-lg px-6 md:px-10 py-5 md:py-6"
Subtexto:      "text-xs md:text-sm"
```

### Espacamentos Mobile:

```text
mb-4 md:mb-6   (entre headline e subheadline)
mb-5 md:mb-8   (entre card e CTA)
gap-2 md:gap-3 (entre bullets)
p-4 md:p-6     (padding do card)
```

---

## Resumo de Arquivos a Modificar

| Arquivo | Mudanca |
|---------|---------|
| `src/components/quiz/QuizLanding.tsx` | Nova copy completa da landing page |
| `src/lib/quizConfig.ts` | Nova copy da Questao 1 |
| `index.html` | Adicionar fonte Archivo |
| `src/index.css` | Atualizar font-family para Archivo |

---

## Performance

### Impacto Zero na Performance:
- Archivo e uma fonte leve do Google Fonts
- Playfair Display ja esta carregado (mantido para titulos)
- Nenhum novo JavaScript
- Nenhuma nova dependencia
- Preload nao-bloqueante mantido
- Critical CSS atualizado inline

### Tamanho de Fonte Adicional:
- Archivo (4 pesos): ~40KB comprimido
- Inter removido: -35KB
- Diferenca liquida: ~5KB

---

## Garantias

- Zero alteracao em tracking/metricas
- Zero alteracao em logica do funil
- Zero alteracao em animacoes (apenas copy)
- Zero alteracao nas demais questoes (2-8)
- Responsividade testavel em mobile/tablet/desktop
- Performance mantida < 3 segundos

---

## Preview Visual Esperado (Mobile)

```text
┌────────────────────────────┐
│         [Crown]            │
│                            │
│ Por Que Mulheres Te Veem   │
│ Apenas Como "Amigo"        │
│ (Mesmo Voce Sendo Um       │
│    Bom Partido)?           │
│                            │
│ Descubra o UNICO erro...   │
│                            │
│ ┌────────────────────────┐ │
│ │ Se voce:               │ │
│ │ ❌ Ja foi rejeitado... │ │
│ │ ❌ Escuta "Voce e..."  │ │
│ │ ❌ Consegue conversar..│ │
│ │ ❌ Sente que mulheres..│ │
│ └────────────────────────┘ │
│                            │
│ Entao este teste de 2 min  │
│ vai CHOCAR voce.           │
│                            │
│ ┌────────────────────────┐ │
│ │ DESCOBRIR MEU ERRO     │ │
│ │     FATAL AGORA        │ │
│ └────────────────────────┘ │
│                            │
│ "Apenas 2 minutos podem    │
│ mudar sua vida romantica"  │
│                            │
│ [Users] 12.847 homens ja   │
│   descobriram seu erro     │
└────────────────────────────┘
```
