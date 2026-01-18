import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Line, LineChart } from "recharts";
import { TrendingUp, Users } from "lucide-react";
import { TimelineData } from "@/hooks/useLeadsTimeline";

interface LeadsTimelineChartProps {
  timeline: TimelineData[];
  isLoading: boolean;
  onPeriodChange: (days: number) => void;
  selectedPeriod: number;
}

const chartConfig = {
  leads: {
    label: "Leads",
    color: "hsl(43 70% 55%)",
  },
  visitors: {
    label: "Visitantes",
    color: "hsl(350 55% 45%)",
  },
  conversionRate: {
    label: "Conversão %",
    color: "hsl(160 60% 45%)",
  },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function LeadsTimelineChart({ timeline, isLoading, onPeriodChange, selectedPeriod }: LeadsTimelineChartProps) {
  const formattedData = timeline.map((item) => ({
    ...item,
    formattedDate: formatDate(item.date),
  }));

  // Calculate totals for the period
  const totalLeads = timeline.reduce((sum, day) => sum + day.leads, 0);
  const totalVisitors = timeline.reduce((sum, day) => sum + day.visitors, 0);
  const avgConversion = totalVisitors > 0 ? Math.round((totalLeads / totalVisitors) * 100) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Leads Growth Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Crescimento de Leads</CardTitle>
          </div>
          <Select
            value={String(selectedPeriod)}
            onValueChange={(value) => onPeriodChange(parseInt(value))}
          >
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="14">Últimos 14 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="60">Últimos 60 dias</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold">{totalLeads}</span>
            <span className="text-xs text-muted-foreground">leads no período</span>
          </div>
          {isLoading ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Carregando...
            </div>
          ) : formattedData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="leadsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(43 70% 55%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(43 70% 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="formattedDate"
                  tickLine={false}
                  axisLine={false}
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  allowDecimals={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="leads"
                  stroke="hsl(43 70% 55%)"
                  strokeWidth={2}
                  fill="url(#leadsGradient)"
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Sem dados para o período
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conversion Rate Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-sm font-medium">Evolução da Conversão</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold">{avgConversion}%</span>
            <span className="text-xs text-muted-foreground">conversão média</span>
          </div>
          {isLoading ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Carregando...
            </div>
          ) : formattedData.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <LineChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(350 55% 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(350 55% 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="formattedDate"
                  tickLine={false}
                  axisLine={false}
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  className="text-xs"
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  unit="%"
                  domain={[0, 100]}
                />
                <ChartTooltip 
                  content={<ChartTooltipContent />} 
                  formatter={(value) => [`${value}%`, "Conversão"]}
                />
                <Line
                  type="monotone"
                  dataKey="conversionRate"
                  stroke="hsl(160 60% 45%)"
                  strokeWidth={2}
                  dot={{ fill: "hsl(160 60% 45%)", strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
                <Line
                  type="monotone"
                  dataKey="visitors"
                  stroke="hsl(350 55% 45%)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Sem dados para o período
            </div>
          )}
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-[hsl(160_60%_45%)]" />
              <span>Conversão (%)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-[hsl(350_55%_45%)] opacity-70" style={{ borderStyle: "dashed" }} />
              <span>Visitantes</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
