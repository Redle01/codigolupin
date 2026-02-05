

# Plano: Adicionar Filtro de Calendário às Métricas do Funil

## Resumo

Implementar um seletor de datas estilo calendário na seção "Métricas do Funil" do admin, permitindo análise temporal por dia específico ou intervalo de datas. As métricas exibidas no fluxo visual do funil serão filtradas em tempo real.

---

## Arquivos a Modificar

| Arquivo | Tipo de Alteração |
|---------|-------------------|
| `supabase/functions/quiz-metrics/index.ts` | Adicionar suporte a filtro de datas no action "stats" |
| `src/hooks/useFunnelMetrics.ts` | Adicionar parâmetros de data ao `refreshMetrics` |
| `src/pages/Admin.tsx` | Mover DateRangePicker para o Card de Métricas do Funil |
| `src/components/admin/FunnelMetricsInline.tsx` | Exibir período selecionado (opcional) |

---

## Detalhes de Implementação

### 1. Edge Function: Suporte a Filtro de Datas (`quiz-metrics`)

Modificar o action `stats` para aceitar parâmetros opcionais `startDate` e `endDate`:

```typescript
// Adicionar ao interface
interface StatsRequest {
  action: "stats";
  startDate?: string;  // formato ISO: "2025-02-01T00:00:00.000Z"
  endDate?: string;    // formato ISO: "2025-02-05T23:59:59.999Z"
}

// No handler do action "stats"
if (action === "stats") {
  const { startDate, endDate } = body as StatsRequest;
  
  // Build query with optional date filter
  let query = supabaseAdmin
    .from("quiz_funnel_events")
    .select("visitor_id, page_key, created_at")
    .order("created_at", { ascending: true });
    
  // Apply date filters if provided
  if (startDate) {
    query = query.gte("created_at", startDate);
  }
  if (endDate) {
    query = query.lte("created_at", endDate);
  }
  
  const { data: events, error } = await query;
  // ... resto do processamento
}
```

### 2. Hook useFunnelMetrics: Aceitar Datas

```typescript
interface RefreshOptions {
  startDate?: Date;
  endDate?: Date;
}

const refreshMetrics = useCallback(async (options?: RefreshOptions) => {
  setIsLoading(true);
  
  try {
    const supabase = await getSupabase();
    const { data: { session } } = await supabase.auth.getSession();
    
    // Build request body with optional date filters
    const requestBody: Record<string, unknown> = { action: "stats" };
    
    if (options?.startDate) {
      requestBody.startDate = options.startDate.toISOString();
    }
    if (options?.endDate) {
      // Ajustar para fim do dia
      const endOfDay = new Date(options.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      requestBody.endDate = endOfDay.toISOString();
    }
    
    const { data, error } = await supabase.functions.invoke("quiz-metrics", {
      body: requestBody,
      headers: session?.access_token ? {
        Authorization: `Bearer ${session.access_token}`
      } : undefined,
    });
    // ...
  }
}, []);
```

### 3. Admin.tsx: Integrar Calendário com Métricas do Funil

Mover o `DateRangePicker` para dentro do Card de "Métricas do Funil" e fazer com que ele controle ambas as visualizações (funil e timeline):

```tsx
// Atualizar handleDateChange
const handleDateChange = useCallback((start: Date | undefined, end: Date | undefined) => {
  setDateRange({ startDate: start, endDate: end });
  if (start && end) {
    // Atualizar ambas as visualizações
    refreshMetrics({ startDate: start, endDate: end });
    fetchTimeline({ startDate: start, endDate: end });
  }
}, [refreshMetrics, fetchTimeline]);

// No Card de Métricas do Funil
<Card>
  <CardHeader className="pb-2">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <CardTitle className="text-lg">Métricas do Funil</CardTitle>
      <div className="flex items-center gap-2">
        <DateRangePicker
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onDateChange={handleDateChange}
        />
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => resetMetrics()}
          className="text-destructive hover:text-destructive"
        >
          Resetar
        </Button>
      </div>
    </div>
  </CardHeader>
  <CardContent>
    <FunnelMetricsInline 
      metrics={metrics}
      getDropoffRate={getDropoffRate}
      getConversionRate={getConversionRate}
      flowCounts={stats?.flowCounts}
    />
  </CardContent>
</Card>
```

### 4. Atualização Inicial com Datas

```typescript
// useEffect inicial - passar datas ao carregar
useEffect(() => {
  if (user && isAdmin) {
    refreshMetrics({ startDate: dateRange.startDate, endDate: dateRange.endDate });
    fetchStats();
    fetchTimeline({ startDate: dateRange.startDate, endDate: dateRange.endDate });
    fetchVisitors();
  }
}, [user, isAdmin, refreshMetrics, fetchStats, fetchTimeline, fetchVisitors, dateRange.startDate, dateRange.endDate]);

// handleRefreshAll - incluir datas
const handleRefreshAll = useCallback(() => {
  setIsRefreshing(true);
  Promise.all([
    refreshMetrics({ startDate: dateRange.startDate, endDate: dateRange.endDate }),
    fetchStats(),
    fetchTimeline({ startDate: dateRange.startDate, endDate: dateRange.endDate }),
    fetchVisitors(),
  ]).finally(() => {
    setTimeout(() => setIsRefreshing(false), 500);
  });
}, [refreshMetrics, fetchStats, fetchTimeline, fetchVisitors, dateRange]);
```

---

## Fluxo de Dados

```text
┌─────────────────────────────────────────────────────────────────┐
│                    DateRangePicker                               │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────┐ │
│  │ 7 dias  │  │ 14 dias │  │ 30 dias │  │ 60 dias │  │ 📅 ... │ │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └────────┘ │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
┌────────────────────────────────┴────────────────────────────────┐
│                    handleDateChange()                            │
│                                                                  │
│   1. refreshMetrics({ startDate, endDate })  ──────────────────▶│
│   2. fetchTimeline({ startDate, endDate })   ──────────────────▶│
└──────────────────────────────────────────────────────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
┌────────────────────────────┐   ┌────────────────────────────┐
│     quiz-metrics (stats)   │   │   quiz-leads (timeline)    │
│    (Edge Function)         │   │    (Edge Function)         │
│                            │   │                            │
│  Filtra quiz_funnel_events │   │  Filtra por created_at     │
│  por created_at            │   │                            │
└────────────────────────────┘   └────────────────────────────┘
                 │                               │
                 ▼                               ▼
┌────────────────────────────┐   ┌────────────────────────────┐
│   FunnelMetricsInline      │   │   LeadsTimelineChart       │
│                            │   │                            │
│  • Visitantes por página   │   │  • Gráfico temporal        │
│  • Conversões por etapa    │   │                            │
│  • Drop-offs               │   │                            │
│  • Gargalos                │   │                            │
└────────────────────────────┘   └────────────────────────────┘
```

---

## Layout Visual Final

```text
┌──────────────────────────────────────────────────────────────────────────┐
│  Métricas do Funil                                                       │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │  [7 dias] [14 dias] [30 dias] [60 dias]  [📅 01/02 - 05/02/2025]  │  │
│  │                                                          [Resetar] │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │   Entradas   │ │Captura Email │ │Conversão Fin │ │ Maior Gargalo│    │
│  │     1,234    │ │     45%      │ │     38%      │ │   Q3 → Q4    │    │
│  │   890 únicos │ │              │ │  456 chegaram│ │   -25%       │    │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘    │
│                                                                          │
│  Jornada Pré-Email                                                       │
│  ┌──────┐ → ┌──────┐ → ┌──────┐ → ┌──────┐ → ┌──────┐ → ┌──────┐ → ... │
│  │Início│   │  Q1  │   │  Q2  │   │  Q3  │   │  Q4  │   │  Q5  │       │
│  │ 1234 │   │ 1100 │   │ 980  │   │ 850  │   │ 750  │   │ 680  │       │
│  └──────┘   └──────┘   └──────┘   └──────┘   └──────┘   └──────┘       │
│                                                                          │
│  Captura de Email (Ponto Crítico)                                        │
│  ┌────────────┐                                                          │
│  │   Email    │  45% dos que chegaram na Q6                              │
│  │    560     │                                                          │
│  └────────────┘                                                          │
│                                                                          │
│  Jornada Pós-Email                                                       │
│  ┌──────┐ → ┌──────┐ → ┌──────────┐                                     │
│  │  Q7  │   │  Q8  │   │ Resultado │                                     │
│  │ 520  │   │ 490  │   │    456    │                                     │
│  └──────┘   └──────┘   └──────────┘                                     │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Garantias

- Layout estrutural do funil 100% preservado
- Performance mantida (filtro aplicado no banco de dados)
- Compatível com desktop e mobile (DateRangePicker já é responsivo)
- Consistência visual com o resto da dashboard
- Filtro intuitivo com presets rápidos (7, 14, 30, 60 dias)
- Atualização em tempo real ao selecionar período
- Mesmo calendário já existente, apenas integrado ao funil

---

## Fluxo de Uso

1. Admin acessa o dashboard
2. Por padrão, últimos 30 dias estão selecionados
3. Admin pode:
   - Clicar em preset rápido (7, 14, 30, 60 dias)
   - Abrir calendário e selecionar intervalo específico
   - Clicar em dia único para ver dados daquele dia
4. Ao selecionar, métricas do funil e timeline atualizam simultaneamente
5. Todos os números refletem exatamente o período selecionado

