
# Plano: Auditoria e Correção do Sistema de Métricas

## Resumo Executivo

A auditoria identificou **1 problema confirmado** (duplicação de leads) e **1 comportamento legítimo** (picos de visitantes). Este plano corrige a duplicação de leads sem alterar o funcionamento normal do funil.

---

## Problema 1: Duplicação de Leads - CONFIRMADO

### Diagnóstico Técnico

**Fluxo Atual (com bug):**

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ Usuário submete email                                                    │
│     ↓                                                                    │
│ submitEmail() → quiz-submit-email → INSERT lead (sem result_type)       │
│     ↓                                                                    │
│ Usuário responde Q7, Q8                                                  │
│     ↓                                                                    │
│ Quiz calcula resultado                                                   │
│     ↓                                                                    │
│ useEffect detecta state.result → updateResultType()                     │
│     ↓                                                                    │
│ updateResultType() → quiz-submit-email → INSERT lead (com result_type)  │
│     ↓                                                                    │
│ RESULTADO: 2 leads no banco para 1 usuário                              │
└─────────────────────────────────────────────────────────────────────────┘
```

**Evidência no Banco de Dados:**

| ID | Email | Visitor ID | Result Type | Offer Flow | Created At |
|----|-------|------------|-------------|------------|------------|
| 54ea... | teste@gmail.com | v_1768509576309_6jgrijv | NULL | NULL | 01:48:04 |
| 6ef4... | teste@gmail.com | v_1768509576309_6jgrijv | estrategista | 2 | 01:48:09 |

**Causa Raiz:**
- O `updateResultType()` chama o mesmo endpoint `quiz-submit-email` que sempre faz INSERT
- Deveria fazer UPDATE no lead existente, não INSERT de um novo

### Solução

Modificar o `quiz-submit-email` edge function para usar **UPSERT** baseado em `visitor_id`:

```typescript
// Antes (linha 105-116 de quiz-submit-email/index.ts)
const { data, error } = await supabase
  .from("quiz_leads")
  .insert({
    email,
    visitor_id: visitor_id || null,
    result_type: result_type || null,
    answers: answers || null,
    offer_flow: offer_flow || null,
  })
  .select()
  .single();

// Depois - UPSERT baseado em visitor_id
// Se visitor_id existe, tenta encontrar lead existente primeiro
if (visitor_id) {
  const { data: existingLead } = await supabase
    .from("quiz_leads")
    .select("id")
    .eq("visitor_id", visitor_id)
    .maybeSingle();

  if (existingLead) {
    // UPDATE - lead já existe, apenas atualizar campos
    const { data, error } = await supabase
      .from("quiz_leads")
      .update({
        result_type: result_type || undefined,
        offer_flow: offer_flow || undefined,
        // Manter answers se já existir ou usar novo
        answers: answers || undefined,
      })
      .eq("id", existingLead.id)
      .select()
      .single();
    
    // ... return response
  }
}

// INSERT - novo lead
const { data, error } = await supabase
  .from("quiz_leads")
  .insert({ ... })
```

### Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/quiz-submit-email/index.ts` | Implementar lógica de UPSERT baseada em visitor_id |

---

## Problema 2: Picos de Visitantes Únicos - NÃO CONFIRMADO

### Diagnóstico Técnico

**Sistema Atual (correto):**

O edge function `quiz-metrics` já possui deduplicação (linhas 100-121):

```typescript
// Verifica se visitante já visitou esta página
const { data: existingEvent } = await supabaseAdmin
  .from("quiz_funnel_events")
  .select("id")
  .eq("visitor_id", visitor_id)
  .eq("page_key", page_key)
  .maybeSingle();

// Só insere se não existe
if (!existingEvent) {
  await supabaseAdmin
    .from("quiz_funnel_events")
    .insert({ visitor_id, page_key });
}
```

**Evidência no Banco de Dados:**

| Visitor ID | Eventos Únicos | Duplicatas |
|------------|----------------|------------|
| v_1768509576309_6jgrijv | 11 páginas | 0 |

**Conclusão:**
- O sistema de tracking de visitantes está funcionando corretamente
- Não há duplicatas de eventos por visitante/página
- Picos podem ser:
  1. Tráfego real (vários usuários acessando simultaneamente)
  2. Delay na atualização do painel (dados chegam em batch)
  3. Atualização de cache do admin panel

### Ação

**Nenhuma alteração necessária** - o sistema está funcionando conforme esperado.

---

## Implementação Detalhada

### Modificação: quiz-submit-email/index.ts

```typescript
// Após as validações e rate limiting (linha ~104)

// Check for existing lead with same visitor_id
let existingLeadId: string | null = null;
if (visitor_id) {
  const { data: existingLead } = await supabase
    .from("quiz_leads")
    .select("id")
    .eq("visitor_id", visitor_id)
    .maybeSingle();
  
  if (existingLead) {
    existingLeadId = existingLead.id;
  }
}

if (existingLeadId) {
  // UPDATE existing lead - merge data
  const updateData: Record<string, unknown> = {};
  
  // Only update fields that have values
  if (result_type) updateData.result_type = result_type;
  if (offer_flow) updateData.offer_flow = offer_flow;
  if (answers && Object.keys(answers).length > 0) updateData.answers = answers;
  
  const { data, error } = await supabase
    .from("quiz_leads")
    .update(updateData)
    .eq("id", existingLeadId)
    .select()
    .single();

  if (error) {
    console.error("Error updating lead:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update lead" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  console.log("Lead updated successfully:", data.id);
  return new Response(
    JSON.stringify({ success: true, id: data.id, updated: true }),
    { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}

// INSERT new lead (código existente)
const { data, error } = await supabase
  .from("quiz_leads")
  .insert({
    email,
    visitor_id: visitor_id || null,
    result_type: result_type || null,
    answers: answers || null,
    offer_flow: offer_flow || null,
  })
  .select()
  .single();

// ... resto do código existente
```

---

## Limpeza de Dados Duplicados (Opcional)

Para corrigir os dados já duplicados, uma query SQL pode ser executada manualmente:

```sql
-- Identificar duplicatas
SELECT visitor_id, email, COUNT(*) as count
FROM quiz_leads 
WHERE visitor_id IS NOT NULL
GROUP BY visitor_id, email 
HAVING COUNT(*) > 1;

-- Manter apenas o registro mais completo (com result_type)
-- e deletar os outros
WITH duplicates AS (
  SELECT id, visitor_id,
    ROW_NUMBER() OVER (
      PARTITION BY visitor_id 
      ORDER BY 
        CASE WHEN result_type IS NOT NULL THEN 0 ELSE 1 END,
        created_at DESC
    ) as rn
  FROM quiz_leads
  WHERE visitor_id IS NOT NULL
)
DELETE FROM quiz_leads 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);
```

**Nota:** Esta query deve ser executada manualmente pelo administrador após verificação.

---

## Resumo de Mudanças

| Item | Status | Ação |
|------|--------|------|
| Duplicação de Leads | CONFIRMADO | Implementar UPSERT no quiz-submit-email |
| Picos de Visitantes | NÃO CONFIRMADO | Nenhuma alteração |
| Tracking de Eventos | OK | Já possui deduplicação |
| Rastreamento | PRESERVADO | Zero alterações |

---

## Garantias

- Zero alteração no funcionamento do funil
- Zero alteração no tracking e métricas existentes
- Zero alteração na interface do usuário
- Apenas correção da lógica de persistência no backend
- Dados existentes podem ser limpos opcionalmente

---

## Resultado Esperado

Após a implementação:
- 1 usuário = 1 lead (mesmo completando todo o funil)
- O lead é atualizado com result_type quando o quiz termina (não duplicado)
- Métricas precisas e confiáveis
- Rate limiting continua funcionando corretamente
