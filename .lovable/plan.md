
# Plano: Rastreamento Avancado e Bifurcacao Condicional do Funil

## Resumo Executivo

Este plano implementa rastreamento completo de todos os visitantes desde a primeira pagina, adiciona bifurcacao condicional invisivel baseada na Questao 7, e melhora a visualizacao do fluxo no painel administrativo. Todas as mudancas sao no backend - o usuario final ve o mesmo funil de sempre.

---

## Requisitos Identificados

| Requisito | Status Atual | Solucao |
|-----------|--------------|---------|
| Contagem de TODOS os visitantes | Apenas quem chega na landing | Ja implementado - tracking ocorre na landing |
| Rastreamento de abandono por etapa | Implementado mas pode melhorar visualizacao | Novo componente de visitantes individuais |
| Questao 7 condicional (A/B vs C/D) | Checkout unico | Logica de bifurcacao baseada em resposta |
| Checkout por fluxo (Oferta 1 ou 2) | URL fixa | URLs dinamicas baseadas em `offer_flow` |
| Metricas separadas por oferta | Nao existe | Novo campo `offer_flow` + metricas segmentadas |

---

## Arquitetura da Bifurcacao

```text
                    PERGUNTA 7
                         |
          +--------------+--------------+
          |                             |
     Resposta A/B                  Resposta C/D
          |                             |
          v                             v
   offer_flow = 1                offer_flow = 2
          |                             |
          v                             v
  https://checkout.ticto.app    https://checkout.ticto.app
       /OAD8936CD                   /O6DE7A453
          |                             |
          +--------------+--------------+
                         |
                    MESMA UX
              (usuario nao percebe)
```

---

## Fase 1: Novo Campo no Banco de Dados

### Migracao SQL

Adicionar campo `offer_flow` na tabela `quiz_leads` para identificar qual oferta o lead recebera:

```sql
-- Adicionar coluna offer_flow para identificar o fluxo de oferta
ALTER TABLE public.quiz_leads 
ADD COLUMN IF NOT EXISTS offer_flow integer DEFAULT NULL;

-- Criar indice para consultas por fluxo
CREATE INDEX IF NOT EXISTS idx_quiz_leads_offer_flow 
ON public.quiz_leads(offer_flow);

-- Comentario para documentacao
COMMENT ON COLUMN public.quiz_leads.offer_flow IS 
'1 = Oferta 1 (respostas A/B na Q7), 2 = Oferta 2 (respostas C/D na Q7)';
```

**Valores**:
- `offer_flow = 1`: Respostas A ou B na Questao 7 -> Checkout OAD8936CD
- `offer_flow = 2`: Respostas C ou D na Questao 7 -> Checkout O6DE7A453
- `NULL`: Lead ainda nao respondeu Q7

---

## Fase 2: Logica de Bifurcacao no Frontend

### Arquivo: `src/lib/quizConfig.ts`

Adicionar configuracao de URLs de checkout por fluxo:

```typescript
export const quizConfig = {
  // URLs de checkout por fluxo condicional
  checkoutUrls: {
    flow1: "https://checkout.ticto.app/OAD8936CD", // Respostas A/B na Q7
    flow2: "https://checkout.ticto.app/O6DE7A453", // Respostas C/D na Q7
  },
  
  // Mapeamento de respostas da Q7 para fluxos
  question7FlowMapping: {
    a: 1, // Resposta A -> Fluxo 1
    b: 1, // Resposta B -> Fluxo 1
    c: 2, // Resposta C -> Fluxo 2
    d: 2, // Resposta D -> Fluxo 2
  },
  
  // Outras configuracoes existentes...
  webhookUrl: "",
  totalParticipants: 12847,
};
```

### Arquivo: `src/hooks/useQuiz.ts`

Modificar para:
1. Calcular `offerFlow` baseado na resposta da Q7
2. Enviar `offer_flow` ao submeter email e resultado
3. Redirecionar para o checkout correto

**Mudancas principais**:

```typescript
// Novo no estado
export interface QuizState {
  // ... campos existentes
  offerFlow: 1 | 2 | null; // NOVO: fluxo de oferta
}

// Funcao para determinar o fluxo
function getOfferFlow(answers: Record<number, string>): 1 | 2 | null {
  const question7Answer = answers[6]; // Q7 esta no indice 6
  if (!question7Answer) return null;
  
  // A/B = fluxo 1, C/D = fluxo 2
  return ['a', 'b'].includes(question7Answer) ? 1 : 2;
}

// Modificar answerQuestion para calcular offerFlow apos Q7
const answerQuestion = useCallback((questionId: number, answerId: string) => {
  setState((prev) => {
    const newAnswers = { ...prev.answers, [questionId]: answerId };
    const nextQuestion = prev.currentQuestion + 1;
    
    // Calcular offerFlow apos responder Q7 (indice 6)
    let offerFlow = prev.offerFlow;
    if (questionId === 6) { // Q7 respondida
      offerFlow = getOfferFlow(newAnswers);
    }
    
    // ... resto da logica existente
    
    return { ...prev, answers: newAnswers, offerFlow, /* ... */ };
  });
}, []);

// Modificar redirectToCheckout para usar URL dinamica
const redirectToCheckout = useCallback(() => {
  const flow = state.offerFlow || 1; // Default para fluxo 1
  const checkoutUrl = flow === 1 
    ? quizConfig.checkoutUrls.flow1 
    : quizConfig.checkoutUrls.flow2;
  
  // ... resto da validacao e redirect
}, [state.email, state.result, state.offerFlow]);
```

---

## Fase 3: Atualizar Edge Function de Submissao

### Arquivo: `supabase/functions/quiz-submit-email/index.ts`

Adicionar suporte ao campo `offer_flow`:

```typescript
interface SubmitEmailRequest {
  email: string;
  visitor_id: string;
  result_type?: string;
  answers?: Record<string, string>;
  offer_flow?: number; // NOVO
}

// No insert:
const { data, error } = await supabase
  .from("quiz_leads")
  .insert({
    email,
    visitor_id: visitor_id || null,
    result_type: result_type || null,
    answers: answers || null,
    offer_flow: offer_flow || null, // NOVO
  })
  .select()
  .single();
```

---

## Fase 4: Metricas Segmentadas por Oferta

### Arquivo: `supabase/functions/quiz-leads/index.ts`

Adicionar estatisticas por fluxo de oferta na action `stats`:

```typescript
if (action === "stats") {
  const { data: leads, error: leadsError } = await serviceClient
    .from("quiz_leads")
    .select("result_type, offer_flow");

  // ... codigo existente ...

  // NOVO: Contagem por fluxo de oferta
  const flowCounts = { 
    flow1: 0, 
    flow2: 0, 
    unknown: 0 
  };
  leads?.forEach((lead) => {
    if (lead.offer_flow === 1) flowCounts.flow1++;
    else if (lead.offer_flow === 2) flowCounts.flow2++;
    else flowCounts.unknown++;
  });

  return new Response(
    JSON.stringify({
      totalLeads,
      uniqueVisitors,
      conversionRate,
      mostCommonProfile,
      resultCounts,
      flowCounts, // NOVO
    }),
    // ...
  );
}
```

### Arquivo: `supabase/functions/quiz-metrics/index.ts`

Adicionar metricas de funil por fluxo na action `visitors`:

```typescript
// Ao processar visitantes, incluir offerFlow
visitorProgress[visitor_id].offerFlow = leadInfo?.offer_flow || null;

// Novas estatisticas
const flow1Completions = visitors.filter(v => v.offerFlow === 1 && v.reachedStep === "result").length;
const flow2Completions = visitors.filter(v => v.offerFlow === 2 && v.reachedStep === "result").length;
```

---

## Fase 5: Visualizacao de Visitantes Individuais

### Novo Componente: `src/components/admin/VisitorProgressTable.tsx`

Tabela que mostra cada visitante com seu progresso no funil:

```typescript
interface Visitor {
  visitorId: string;
  email?: string;
  reachedStep: string;
  abandonedAt?: string;
  startedAt: string;
  lastSeenAt: string;
  profileType?: string;
  offerFlow?: number;
}

export function VisitorProgressTable({ visitors }: { visitors: Visitor[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Visitante</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Ultima Etapa</TableHead>
          <TableHead>Abandonou em</TableHead>
          <TableHead>Fluxo</TableHead>
          <TableHead>Perfil</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {visitors.map((v) => (
          <TableRow key={v.visitorId}>
            <TableCell className="font-mono text-xs">
              {v.visitorId.slice(0, 12)}...
            </TableCell>
            <TableCell>{v.email || "-"}</TableCell>
            <TableCell>
              <Badge variant={v.reachedStep === "result" ? "success" : "secondary"}>
                {v.reachedStep}
              </Badge>
            </TableCell>
            <TableCell>
              {v.abandonedAt && (
                <Badge variant="destructive">{v.abandonedAt}</Badge>
              )}
            </TableCell>
            <TableCell>
              {v.offerFlow ? `Oferta ${v.offerFlow}` : "-"}
            </TableCell>
            <TableCell>{v.profileType || "-"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

---

## Fase 6: Dashboard com Metricas por Fluxo

### Arquivo: `src/components/admin/FunnelMetricsInline.tsx`

Adicionar secao de metricas por oferta:

```typescript
{/* NOVO: Metricas por Fluxo de Oferta */}
<Card className="mt-4">
  <CardHeader className="pb-2">
    <CardTitle className="text-sm font-medium">Distribuicao por Oferta</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="grid grid-cols-2 gap-4">
      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <p className="text-xs text-muted-foreground">Oferta 1 (A/B)</p>
        <p className="text-xl font-bold text-blue-500">{flowCounts?.flow1 || 0}</p>
      </div>
      <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
        <p className="text-xs text-muted-foreground">Oferta 2 (C/D)</p>
        <p className="text-xl font-bold text-purple-500">{flowCounts?.flow2 || 0}</p>
      </div>
    </div>
  </CardContent>
</Card>
```

---

## Fase 7: Hook para Buscar Visitantes

### Novo Arquivo: `src/hooks/useVisitors.ts`

```typescript
export function useVisitors() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchVisitors = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("quiz-metrics", {
        body: { action: "visitors" },
        headers: session?.access_token ? {
          Authorization: `Bearer ${session.access_token}`
        } : undefined,
      });

      if (error) throw error;
      
      setVisitors(data.visitors || []);
      setStats({
        totalVisitors: data.totalVisitors,
        completedFunnel: data.completedFunnel,
        reachedEmail: data.reachedEmail,
        abandonedAtEmail: data.abandonedAtEmail,
      });
    } catch (error) {
      console.error("Error fetching visitors:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { visitors, stats, isLoading, fetchVisitors };
}
```

---

## Fase 8: Atualizar LeadsTable com Coluna de Fluxo

### Arquivo: `src/components/admin/LeadsTable.tsx`

Adicionar coluna "Oferta" na tabela de leads:

```typescript
<TableHead>Oferta</TableHead>
// ...
<TableCell>
  {lead.offer_flow ? (
    <Badge variant={lead.offer_flow === 1 ? "default" : "secondary"}>
      Oferta {lead.offer_flow}
    </Badge>
  ) : "-"}
</TableCell>
```

---

## Fase 9: Atualizar Interface de Tipos

### Arquivo: `src/hooks/useLeads.ts`

```typescript
export interface Lead {
  id: string;
  email: string;
  result_type: string | null;
  created_at: string;
  answers: Record<string, any> | null;
  visitor_id: string | null;
  offer_flow: number | null; // NOVO
}

export interface LeadStats {
  // ... campos existentes
  flowCounts: { flow1: number; flow2: number; unknown: number }; // NOVO
}
```

---

## Resumo de Arquivos a Modificar/Criar

| Arquivo | Acao | Mudanca Principal |
|---------|------|-------------------|
| Migracao SQL | CRIAR | Campo `offer_flow` na tabela |
| `src/lib/quizConfig.ts` | EDITAR | URLs de checkout por fluxo |
| `src/hooks/useQuiz.ts` | EDITAR | Logica de bifurcacao + redirect dinamico |
| `supabase/functions/quiz-submit-email/index.ts` | EDITAR | Salvar `offer_flow` |
| `supabase/functions/quiz-leads/index.ts` | EDITAR | Retornar `offer_flow` e `flowCounts` |
| `supabase/functions/quiz-metrics/index.ts` | EDITAR | Incluir `offerFlow` nos visitantes |
| `src/hooks/useVisitors.ts` | CRIAR | Hook para buscar visitantes individuais |
| `src/hooks/useLeads.ts` | EDITAR | Adicionar tipos para `offer_flow` |
| `src/components/admin/VisitorProgressTable.tsx` | CRIAR | Tabela de visitantes individuais |
| `src/components/admin/FunnelMetricsInline.tsx` | EDITAR | Metricas por fluxo de oferta |
| `src/components/admin/LeadsTable.tsx` | EDITAR | Coluna de oferta |
| `src/pages/Admin.tsx` | EDITAR | Integrar nova secao de visitantes |

---

## Fluxo de Dados Completo

```text
USUARIO NO FUNIL                           BACKEND
      |                                        |
      v                                        |
  [Landing] ─────────────────────────────► track(landing)
      |                                        |
  [Q1-Q6] ───────────────────────────────► track(question1-6)
      |                                        |
  [Email] ───────────────────────────────► submit_email()
      |                                        |
  [Q7] ──────────────────────────────────► track(question7)
      |                                        |
      +── Resposta A/B ──► offerFlow = 1       |
      |                                        |
      +── Resposta C/D ──► offerFlow = 2       |
      |                                        |
  [Q8] ──────────────────────────────────► track(question8)
      |                                        |
  [Result] ──────────────────────────────► update_lead(offer_flow)
      |                                        |
  [CTA Click]                                  |
      |                                        |
      +── Flow 1 ──► OAD8936CD                 |
      +── Flow 2 ──► O6DE7A453                 |
```

---

## Experiencia do Usuario

**ANTES (usuario)**: Ve o quiz normalmente, responde Q7, ve resultado, clica CTA

**DEPOIS (usuario)**: Ve o quiz normalmente, responde Q7, ve resultado, clica CTA

**ZERO mudanca visivel** - toda a complexidade esta no backend.

---

## Metricas Disponiveis Apos Implementacao

| Metrica | Descricao |
|---------|-----------|
| Total de visitantes | Todos que entraram no funil |
| Visitantes unicos | Contagem por visitor_id |
| Abandono por etapa | Onde cada visitante parou |
| Taxa de conversao geral | % que completou ate resultado |
| Leads por oferta | Quantos foram para Oferta 1 vs 2 |
| Conversao por oferta | Taxa de sucesso de cada fluxo |
| Jornada individual | Paginas visitadas por cada pessoa |

---

## Garantias

- **UX**: Nenhuma alteracao visivel para o usuario
- **Design**: Layout e copy intocados
- **Metricas existentes**: Todas preservadas
- **Performance**: Nenhum impacto (apenas 1 campo extra)
- **Rastreamento**: Funciona dentro e fora do Lovable
- **Tempo real**: Dados sincronizados via Realtime

---

## Secao Tecnica: Logica de Bifurcacao

A Questao 7 (indice 6 no array, id 7) possui 4 opcoes:

| Opcao | Texto | Fluxo |
|-------|-------|-------|
| A | "Ate R$ 30 - o minimo possivel" | 1 |
| B | "Entre R$ 30 e R$ 50 - algo acessivel" | 1 |
| C | "Entre R$ 50 e R$ 100 - se realmente funcionar" | 2 |
| D | "Mais de R$ 100 - resultado vale qualquer investimento" | 2 |

**Logica**:
- Respostas A e B indicam faixa de preco mais baixa -> Oferta 1 (produto mais acessivel)
- Respostas C e D indicam disposicao maior -> Oferta 2 (produto premium)

O redirecionamento acontece automaticamente no clique do CTA final, baseado no `offerFlow` calculado no momento da resposta da Q7.
