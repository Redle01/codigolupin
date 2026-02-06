
# Plano: Ajustes Visuais, Meta Pixel e Mockup no Resultado

## Resumo das Alterações

1. **Remover numeração** das perguntas (manter apenas barra de progresso)
2. **Substituir ícone Sparkles** por seta (ArrowRight) no CTA da landing
3. **Adicionar evento InitiateCheckout** no Meta Pixel ao clicar no CTA do resultado
4. **Melhorar responsividade** do texto dos CTAs no mobile
5. **Adicionar mockup** nas páginas de resultado (acima do CTA)

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/quiz/QuizQuestion.tsx` | Remover numeração "X/Y" |
| `src/components/quiz/QuizLanding.tsx` | Trocar Sparkles por ArrowRight |
| `src/hooks/useMetaPixel.ts` | Adicionar função `trackInitiateCheckout` |
| `src/components/quiz/QuizResult.tsx` | Disparar InitiateCheckout + adicionar mockup + melhorar responsividade CTA |
| `public/images/mockup-checkout.png` | **NOVO** - Copiar imagem do mockup |

---

## Detalhes de Implementação

### 1. Remover Numeração do Quiz (`QuizQuestion.tsx`)

**Linha 51-53 - Remover:**
```tsx
<span className="text-sm md:text-sm text-muted-foreground">
  {questionNumber}/{totalQuestions}
</span>
```

A barra de progresso visual permanece intacta (linhas 57-71).

### 2. Substituir Ícone no CTA da Landing (`QuizLanding.tsx`)

**Alterações:**
- Remover import de `Sparkles`
- Adicionar import de `ArrowRight`
- Trocar ícone no botão (mover para a direita do texto)

**De:**
```tsx
import { Sparkles, Users } from "lucide-react";
// ...
<Sparkles className="w-5 h-5 md:w-5 md:h-5 mr-2" />
DESCOBRIR MEU BLOQUEIO AGORA
```

**Para:**
```tsx
import { ArrowRight, Users } from "lucide-react";
// ...
DESCOBRIR MEU BLOQUEIO AGORA
<ArrowRight className="w-5 h-5 md:w-5 md:h-5 ml-2" />
```

### 3. Adicionar Evento InitiateCheckout (`useMetaPixel.ts`)

**Adicionar nova função:**
```typescript
// InitiateCheckout - disparar ao clicar no CTA do resultado
const trackInitiateCheckout = useCallback((data?: {
  result_type?: string;
  offer_flow?: number;
}) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "InitiateCheckout", {
      content_name: data?.result_type,
      content_category: `flow_${data?.offer_flow}`,
    });
  }
}, []);
```

**Exportar a função:**
```typescript
return {
  trackPageView,
  trackChegouCheckout,
  trackInitiateCheckout,  // NOVO
  setExternalId,
  initWithUser,
};
```

### 4. Atualizar QuizResult (`QuizResult.tsx`)

#### 4.1 Disparar InitiateCheckout no Clique

**Adicionar import do hook e chamar no onClick:**
```tsx
import { useMetaPixel } from "@/hooks/useMetaPixel";

// Dentro do componente:
const { trackInitiateCheckout } = useMetaPixel();

// Handler para o CTA:
const handleCheckoutClick = () => {
  // Disparar InitiateCheckout antes do redirect
  trackInitiateCheckout({
    result_type: result.type,
    offer_flow: flow,
  });
  // Chamar função original de checkout
  onCheckout();
};
```

#### 4.2 Adicionar Mockup

**Copiar imagem para o projeto:**
- De: `user-uploads://Mockup_checkout.png`
- Para: `public/images/mockup-checkout.png`

**Adicionar seção do mockup (após Oferta Especial, antes do CTA):**
```tsx
{/* Mockup */}
<m.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.85, duration: 0.6 }}
  className="w-full mb-5 md:mb-8"
>
  <img
    src="/images/mockup-checkout.png"
    alt="O que você vai receber"
    className="w-full max-w-md mx-auto h-auto object-contain"
    loading="lazy"
  />
</m.div>
```

#### 4.3 Melhorar Responsividade do CTA

**Ajustar classes do botão para melhor exibição mobile:**

**De:**
```tsx
className="w-full h-14 md:h-16 bg-gradient-gold text-primary-foreground font-bold text-base md:text-lg rounded-xl shadow-gold-lg hover:shadow-gold transition-all duration-300 hover:scale-[1.02] group"
```

**Para:**
```tsx
className="w-full h-auto min-h-[3.5rem] md:min-h-[4rem] py-3 md:py-4 px-4 md:px-6 bg-gradient-gold text-primary-foreground font-bold text-sm sm:text-base md:text-lg rounded-xl shadow-gold-lg hover:shadow-gold transition-all duration-300 hover:scale-[1.02] group leading-tight"
```

- `h-auto` + `min-h-[3.5rem]` permite altura flexível
- `py-3 md:py-4` adiciona padding vertical adequado
- `text-sm sm:text-base md:text-lg` escala progressiva do texto
- `leading-tight` evita espaçamento excessivo entre linhas
- `px-4 md:px-6` mantém padding horizontal adequado

---

## Estrutura Final da Página de Resultado

```text
┌─────────────────────────────────────┐
│         [Ícone do Perfil]          │
│                                     │
│     Seu Tipo de Magnetismo          │
│     [TÍTULO DO RESULTADO]           │
│     X% dos homens...                │
├─────────────────────────────────────┤
│  📋 Seu Resultado                   │
│  [Descrição...]                     │
├─────────────────────────────────────┤
│  ✨ Seu Maior Potencial             │
│  [Descrição...]                     │
├─────────────────────────────────────┤
│  🎯 Próximo Passo                   │
│  [Descrição...]                     │
├─────────────────────────────────────┤
│  🔥 OFERTA ESPECIAL: 12x R$ 10,03   │
│  Bônus Inclusos:                    │
│  🎁 [Bônus 1]                       │
│  🎁 [Bônus 2]                       │
├─────────────────────────────────────┤
│         [MOCKUP IMAGE]              │  ← NOVO
│   (responsivo, max-w-md, centered)  │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐    │
│  │  [CTA RESPONSIVO] →         │    │  ← Dispara InitiateCheckout
│  └─────────────────────────────┘    │
│  🔒 Acesso imediato • Garantia 7d   │
└─────────────────────────────────────┘
```

---

## Fluxo de Eventos Meta Pixel

```text
[Usuário navega pelo funil]
        │
        ▼
   PageView (cada página)
        │
        ▼
[Chega na página de resultado]
        │
        ▼
   PageView (resultado)
        │
        ▼
[Clica no CTA do resultado]
        │
        ├─► InitiateCheckout (NOVO)
        │
        ├─► ChegouNoCheckout (existente)
        │
        ▼
   [Redirect para Ticto]
```

---

## O Que NÃO Será Alterado

- ✅ Copy (nenhuma palavra)
- ✅ Estrutura do funil
- ✅ Ordem das páginas
- ✅ Lógica condicional existente
- ✅ Design geral, cores ou tipografia
- ✅ Performance (mockup com lazy loading)
- ✅ Barra de progresso (mantida intacta)
- ✅ Eventos existentes do Meta Pixel

---

## Garantias

- Numeração removida, barra de progresso preservada
- Ícone de seta discreto no CTA da landing
- InitiateCheckout disparado corretamente no clique do resultado
- CTAs responsivos sem quebra estranha de linha
- Mockup visualmente integrado e 100% responsivo
- Não altera nenhum texto/copy existente
