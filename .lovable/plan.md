

# Plano: Sincronizacao em Tempo Real e Reorganizacao do Painel Administrativo

## Resumo Executivo

Este plano implementa um sistema de dados administrativos sincronizados em tempo real, com visualizacao centralizada das metricas do funil e rastreamento avancado de visitantes. Todas as melhorias sao "por baixo do capo" - sem alterar o design existente.

---

## Diagnostico Atual

### Problemas Identificados

| Problema | Impacto | Solucao |
|----------|---------|---------|
| Dados nao sincronizam em tempo real | Alto | Supabase Realtime subscription |
| Metricas do funil em aba separada | Medio | Integrar na dashboard principal |
| Limite fixo de 10 leads por pagina | Medio | Seletor de quantidade por pagina |
| Atualizacao manual necessaria | Baixo | Auto-refresh automatico |
| Dados de stats e funnel vem de fontes diferentes | Medio | Unificar fonte de dados |

### Arquitetura Atual
```text
Dashboard Tab ──────► useLeads (stats) ──────► quiz-leads API
                            ↓
Leads Tab ──────────► useLeads (list) ──────► quiz-leads API
                            ↓
Funnel Tab ─────────► useFunnelMetrics ─────► quiz-metrics API
```

**Problema**: Tres fontes de dados independentes podem divergir.

---

## Estrategia de Solucao

```text
+------------------+     +------------------+     +------------------+
|    REALTIME      |     |   DASHBOARD      |     |  LEADS TABLE     |
|   SUBSCRIPTION   |     |   UNIFICADA      |     |   MELHORADA      |
+------------------+     +------------------+     +------------------+
        |                        |                        |
        v                        v                        v
+------------------+     +------------------+     +------------------+
| - quiz_leads     |     | - Stats cards    |     | - Seletor 10/25/ |
| - funnel_events  |     | - Funnel inline  |     |   50/100 por pag |
| - Auto-refresh   |     | - Timeline chart |     | - Filtros rapidos|
+------------------+     +------------------+     +------------------+
```

---

## Fase 1: Sincronizacao em Tempo Real com Supabase Realtime

### Migracao SQL: Habilitar Realtime

```sql
-- Habilitar realtime para as tabelas de leads e eventos
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_funnel_events;
```

### Novo Hook: `useRealtimeAdmin.ts`

Criar um hook centralizado que escuta mudancas em tempo real:

```typescript
// src/hooks/useRealtimeAdmin.ts
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UseRealtimeAdminProps {
  onLeadInserted?: () => void;
  onFunnelEventInserted?: () => void;
  enabled?: boolean;
}

export function useRealtimeAdmin({
  onLeadInserted,
  onFunnelEventInserted,
  enabled = true,
}: UseRealtimeAdminProps) {
  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel("admin-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "quiz_leads",
        },
        () => {
          onLeadInserted?.();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "quiz_funnel_events",
        },
        () => {
          onFunnelEventInserted?.();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, onLeadInserted, onFunnelEventInserted]);
}
```

**Beneficio**: Quando um visitante entra no funil ou um email e capturado, os dados atualizam instantaneamente.

---

## Fase 2: Reorganizacao da Dashboard - Metricas Integradas

### Arquivo: `src/pages/Admin.tsx`

Remover a aba "Funil" e integrar as metricas diretamente na dashboard:

**Antes (3 abas)**:
- Dashboard | Leads | Funil

**Depois (2 abas)**:
- Dashboard (com metricas do funil integradas) | Leads

### Nova Estrutura da Dashboard:

```typescript
<TabsContent value="dashboard" className="space-y-6">
  {/* Cabecalho */}
  <div className="flex justify-between items-center">
    <h2>Dashboard</h2>
    <div className="flex items-center gap-2">
      <span className="text-green-500 animate-pulse">● Ao vivo</span>
      <Button onClick={handleRefreshAll}>Atualizar</Button>
    </div>
  </div>

  {/* Cards de resumo (existentes) */}
  <AdminDashboard stats={stats} />

  {/* NOVO: Metricas do funil inline */}
  <Card>
    <CardHeader>
      <CardTitle>Fluxo do Funil</CardTitle>
    </CardHeader>
    <CardContent>
      <FunnelMetricsInline metrics={metrics} />
    </CardContent>
  </Card>

  {/* Graficos de timeline (existentes) */}
  <LeadsTimelineChart ... />
</TabsContent>
```

### Novo Componente: `FunnelMetricsInline.tsx`

Versao compacta das metricas do funil para exibicao inline na dashboard:

```typescript
// src/components/admin/FunnelMetricsInline.tsx
export function FunnelMetricsInline({ metrics, getDropoffRate }: Props) {
  return (
    <div className="space-y-4">
      {/* Barra de progresso visual do funil */}
      <div className="flex items-center gap-2">
        {funnelSteps.map((step, index) => {
          const views = metrics.pageViews[step.key];
          return (
            <div key={step.key} className="flex items-center">
              <div className="text-center">
                <span className="text-lg">{step.icon}</span>
                <p className="text-sm font-medium">{views}</p>
              </div>
              {index < funnelSteps.length - 1 && (
                <ArrowRight className="text-muted-foreground mx-1" />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Maior ponto de abandono */}
      {biggestDropoff && (
        <Alert variant="destructive">
          Maior abandono: {biggestDropoff.from} → {biggestDropoff.to} ({biggestDropoff.rate}%)
        </Alert>
      )}
    </div>
  );
}
```

---

## Fase 3: Rastreamento Avancado de Visitantes

### Modificar Edge Function: `quiz-metrics/index.ts`

Adicionar uma nova action `visitors` que retorna dados detalhados de cada visitante:

```typescript
if (action === "visitors") {
  // Verificar admin
  const { isAdmin } = await verifyAdmin(req, supabaseUrl, supabaseAnonKey);
  if (!isAdmin) return unauthorized();

  // Buscar todos os eventos agrupados por visitor_id
  const { data: events } = await supabaseAdmin
    .from("quiz_funnel_events")
    .select("visitor_id, page_key, created_at")
    .order("created_at", { ascending: true });

  // Buscar leads para associar emails
  const { data: leads } = await supabaseAdmin
    .from("quiz_leads")
    .select("visitor_id, email, result_type");

  // Mapear progresso de cada visitante
  const visitors = processVisitorData(events, leads);

  return Response.json({
    visitors,
    totalVisitors: Object.keys(visitors).length,
    completedFunnel: visitors.filter(v => v.reachedStep === "result").length,
    abandonedAtEmail: visitors.filter(v => v.reachedStep === "email" && !v.hasEmail).length,
  });
}
```

### Interface de Dados do Visitante:

```typescript
interface VisitorProgress {
  visitorId: string;
  email?: string;
  reachedStep: string;
  stepsCompleted: string[];
  abandonedAt?: string;
  startedAt: string;
  lastSeenAt: string;
  profileType?: string;
}
```

**Beneficio**: O admin pode ver exatamente onde cada visitante parou no funil.

---

## Fase 4: Seletor de Quantidade por Pagina na Tabela de Leads

### Arquivo: `src/hooks/useLeads.ts`

Modificar para aceitar limit dinamico:

```typescript
export function useLeads(): UseLeadsReturn {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10); // Agora dinamico

  const fetchLeads = useCallback(async (options?: { 
    page?: number; 
    search?: string; 
    resultType?: string;
    limit?: number; // NOVO
  }) => {
    const effectiveLimit = options?.limit || limit;
    // ... resto da logica
  }, [page, limit]);

  return {
    // ...
    limit,
    setLimit, // NOVO: expor setter
  };
}
```

### Arquivo: `src/components/admin/LeadsTable.tsx`

Adicionar seletor de quantidade:

```typescript
const LIMIT_OPTIONS = [
  { value: 10, label: "10 por pagina" },
  { value: 25, label: "25 por pagina" },
  { value: 50, label: "50 por pagina" },
  { value: 100, label: "100 por pagina" },
];

// No JSX:
<div className="flex gap-2 items-center">
  <Select value={String(limit)} onValueChange={(v) => handleLimitChange(Number(v))}>
    <SelectTrigger className="w-[140px]">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {LIMIT_OPTIONS.map((opt) => (
        <SelectItem key={opt.value} value={String(opt.value)}>
          {opt.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
```

---

## Fase 5: Indicador de Sincronizacao em Tempo Real

### Arquivo: `src/pages/Admin.tsx`

Adicionar indicador visual de status da conexao:

```typescript
const [isConnected, setIsConnected] = useState(false);
const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

// No cabecalho:
<div className="flex items-center gap-2">
  {isConnected ? (
    <span className="flex items-center gap-1 text-green-500 text-sm">
      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      Ao vivo
    </span>
  ) : (
    <span className="flex items-center gap-1 text-muted-foreground text-sm">
      <span className="w-2 h-2 bg-muted rounded-full" />
      Offline
    </span>
  )}
  {lastUpdate && (
    <span className="text-xs text-muted-foreground">
      Atualizado: {formatDistanceToNow(lastUpdate, { locale: ptBR, addSuffix: true })}
    </span>
  )}
</div>
```

---

## Fase 6: Melhoria dos Filtros

### Arquivo: `src/components/admin/LeadsTable.tsx`

Adicionar filtros rapidos e busca instantanea:

```typescript
// Debounced search - atualiza conforme digita
const debouncedSearch = useMemo(
  () => debounce((value: string) => {
    fetchLeads({ page: 1, search: value, resultType });
  }, 300),
  [fetchLeads, resultType]
);

// Filtros rapidos
<div className="flex gap-2 flex-wrap">
  <Button
    variant={resultType === "all" ? "default" : "outline"}
    size="sm"
    onClick={() => handleFilterChange("all")}
  >
    Todos
  </Button>
  {PROFILE_OPTIONS.slice(1).map((opt) => (
    <Button
      key={opt.value}
      variant={resultType === opt.value ? "default" : "outline"}
      size="sm"
      onClick={() => handleFilterChange(opt.value)}
    >
      {opt.label}
    </Button>
  ))}
</div>
```

---

## Resumo de Arquivos a Modificar

| Arquivo | Mudanca Principal |
|---------|-------------------|
| Migracao SQL | Habilitar Realtime para quiz_leads e quiz_funnel_events |
| `src/hooks/useRealtimeAdmin.ts` | NOVO: Hook para subscricoes em tempo real |
| `src/hooks/useLeads.ts` | Limit dinamico + setLimit |
| `src/hooks/useFunnelMetrics.ts` | Sincronizar com Realtime |
| `src/pages/Admin.tsx` | Remover aba Funil, integrar metricas, adicionar Realtime |
| `src/components/admin/FunnelMetricsInline.tsx` | NOVO: Versao compacta do funil |
| `src/components/admin/LeadsTable.tsx` | Seletor de quantidade + filtros rapidos |
| `supabase/functions/quiz-metrics/index.ts` | Adicionar action `visitors` |

---

## Fluxo de Sincronizacao Final

```text
                     ┌──────────────────────────┐
                     │    SUPABASE REALTIME     │
                     └───────────┬──────────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
          v                      v                      v
  ┌───────────────┐    ┌─────────────────┐    ┌─────────────────┐
  │  quiz_leads   │    │ quiz_funnel_    │    │   Admin.tsx     │
  │  (INSERT)     │    │ events (INSERT) │    │  Subscription   │
  └───────────────┘    └─────────────────┘    └─────────────────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                                 v
                     ┌──────────────────────────┐
                     │   REFRESH AUTOMATICO     │
                     │  - fetchStats()          │
                     │  - refreshMetrics()      │
                     │  - fetchLeads()          │
                     │  - fetchTimeline()       │
                     └──────────────────────────┘
```

---

## Metricas Esperadas

| Metrica | Antes | Depois |
|---------|-------|--------|
| Tempo para ver novo lead | 5s+ (auto-refresh) | < 1s (Realtime) |
| Abas para navegar | 3 | 2 |
| Limite de leads por pagina | 10 fixo | 10/25/50/100 |
| Consistencia de dados | Manual | Automatica |
| Visibilidade de abandonos | Agregada | Por visitante |

---

## Garantias

- **Design**: Nenhuma alteracao visual significativa
- **Metricas existentes**: Todas preservadas
- **Performance**: Realtime adiciona < 1KB de overhead
- **Rastreamento**: Funciona dentro e fora do Lovable
- **Dados**: Sempre sincronizados e confiaveise

---

## Secao Tecnica: Supabase Realtime

### Como funciona:

```typescript
// O Supabase Realtime usa WebSocket para notificar mudancas
const channel = supabase
  .channel("nome-do-canal")
  .on("postgres_changes", {
    event: "INSERT",      // INSERT, UPDATE, DELETE, ou *
    schema: "public",
    table: "quiz_leads",
  }, (payload) => {
    // payload.new contem o novo registro
    console.log("Novo lead:", payload.new);
  })
  .subscribe();
```

### Requisitos:
1. Tabela deve estar na publicacao `supabase_realtime`
2. RLS deve permitir acesso (ou usar service role no backend)
3. Cliente deve estar conectado via WebSocket

