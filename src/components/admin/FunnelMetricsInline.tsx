import { motion } from "framer-motion";
import { 
  Users, 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Crown, 
  Mail, 
  ChevronRight, 
  ArrowDown,
  BarChart3
} from "lucide-react";
import { FunnelMetrics as FunnelMetricsType } from "@/hooks/useFunnelMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface FlowCounts {
  flow1: number;
  flow2: number;
  unknown: number;
}

interface FunnelMetricsInlineProps {
  metrics: FunnelMetricsType;
  getDropoffRate: (from: keyof FunnelMetricsType["pageViews"], to: keyof FunnelMetricsType["pageViews"]) => number;
  getConversionRate: (from: keyof FunnelMetricsType["pageViews"], to: keyof FunnelMetricsType["pageViews"]) => number;
  flowCounts?: FlowCounts;
}

interface FunnelStep {
  key: keyof FunnelMetricsType["pageViews"];
  label: string;
  shortLabel: string;
  group: "start" | "questions" | "email" | "post-email" | "result";
}

const funnelSteps: FunnelStep[] = [
  { key: "landing", label: "Início", shortLabel: "Início", group: "start" },
  { key: "question1", label: "Pergunta 1", shortLabel: "Q1", group: "questions" },
  { key: "question2", label: "Pergunta 2", shortLabel: "Q2", group: "questions" },
  { key: "question3", label: "Pergunta 3", shortLabel: "Q3", group: "questions" },
  { key: "question4", label: "Pergunta 4", shortLabel: "Q4", group: "questions" },
  { key: "question5", label: "Pergunta 5", shortLabel: "Q5", group: "questions" },
  { key: "question6", label: "Pergunta 6", shortLabel: "Q6", group: "questions" },
  { key: "question7", label: "Pergunta 7", shortLabel: "Q7", group: "questions" },
  { key: "question8", label: "Pergunta 8", shortLabel: "Q8", group: "questions" },
  { key: "email", label: "Captura Email", shortLabel: "Email", group: "email" },
  { key: "result", label: "Resultado", shortLabel: "Resultado", group: "result" },
];

function getHealthColor(rate: number): string {
  if (rate >= 90) return "text-green-500";
  if (rate >= 70) return "text-amber-500";
  return "text-destructive";
}

function getHealthBg(rate: number): string {
  if (rate >= 90) return "bg-green-500/10 border-green-500/20";
  if (rate >= 70) return "bg-amber-500/10 border-amber-500/20";
  return "bg-destructive/10 border-destructive/20";
}

interface FunnelStepCardProps {
  step: FunnelStep;
  views: number;
  conversionRate: number;
  dropoffRate?: number;
  isBiggestDropoff: boolean;
  showArrow: boolean;
  isHighlight?: boolean;
  isResult?: boolean;
  size?: "default" | "large";
  index: number;
}

function FunnelStepCard({ 
  step, 
  views, 
  conversionRate, 
  dropoffRate = 0,
  isBiggestDropoff,
  showArrow,
  isHighlight,
  isResult,
  size = "default",
  index
}: FunnelStepCardProps) {
  const healthColor = getHealthColor(conversionRate);
  const healthBg = getHealthBg(conversionRate);
  
  return (
    <div className="flex items-center">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        className={cn(
          "relative flex flex-col rounded-xl border p-3 lg:p-4 transition-all flex-shrink-0",
          size === "large" ? "min-w-[120px] lg:min-w-[160px]" : "min-w-[70px] lg:min-w-[90px]",
          isBiggestDropoff && "ring-2 ring-destructive ring-offset-2 ring-offset-background",
          isHighlight && "border-primary bg-primary/10",
          isResult && "border-green-500/30 bg-green-500/10",
          !isHighlight && !isResult && healthBg
        )}
      >
        {/* Label */}
        <span className={cn(
          "text-xs font-medium mb-2",
          isHighlight ? "text-primary" : isResult ? "text-green-500" : "text-muted-foreground"
        )}>
          {step.shortLabel}
        </span>
        
        {/* Numero Principal */}
        <span className={cn(
          "font-bold tracking-tight",
          size === "large" ? "text-2xl lg:text-3xl" : "text-lg lg:text-xl",
          isHighlight ? "text-primary" : isResult ? "text-green-500" : "text-foreground"
        )}>
          {views.toLocaleString("pt-BR")}
        </span>
        
        {/* Taxa de Conversao */}
        {conversionRate < 100 && (
          <div className="flex items-center gap-1 mt-2">
            <ArrowDown className={cn("h-3 w-3", healthColor)} />
            <span className={cn("text-sm font-semibold", healthColor)}>
              {conversionRate}%
            </span>
          </div>
        )}
        
        {/* Indicador de Gargalo */}
        {isBiggestDropoff && (
          <div className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-[10px] px-2 py-0.5 rounded-full font-medium">
            Gargalo
          </div>
        )}
      </motion.div>
      
      {/* Seta de Conexao */}
      {showArrow && (
        <div className="flex flex-col items-center mx-0.5 lg:mx-1 min-w-[24px] lg:min-w-[32px]">
          <ChevronRight className={cn(
            "h-4 w-4",
            dropoffRate > 20 ? "text-destructive" : "text-muted-foreground/50"
          )} />
          {dropoffRate > 0 && (
            <span className={cn(
              "text-[10px] font-medium",
              dropoffRate > 20 ? "text-destructive" : "text-muted-foreground"
            )}>
              -{dropoffRate}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function FunnelMetricsInline({ metrics, getDropoffRate, getConversionRate, flowCounts }: FunnelMetricsInlineProps) {
  const maxViews = Math.max(...Object.values(metrics.pageViews), 1);
  const overallConversion = getConversionRate("landing", "result");
  const emailConversion = getConversionRate("landing", "email");
  const totalFlowLeads = (flowCounts?.flow1 || 0) + (flowCounts?.flow2 || 0);

  // Find the biggest dropoff point
  let biggestDropoff = { from: "", to: "", rate: 0, fromKey: "" as keyof FunnelMetricsType["pageViews"], toKey: "" as keyof FunnelMetricsType["pageViews"] };
  funnelSteps.forEach((step, index) => {
    const nextStep = funnelSteps[index + 1];
    if (nextStep) {
      const dropoff = getDropoffRate(step.key, nextStep.key);
      if (dropoff > biggestDropoff.rate) {
        biggestDropoff = { 
          from: step.shortLabel, 
          to: nextStep.shortLabel, 
          rate: dropoff,
          fromKey: step.key,
          toKey: nextStep.key
        };
      }
    }
  });

  // Group steps
  const preEmailSteps = funnelSteps.filter(s => s.group === "start" || s.group === "questions");
  const emailStep = funnelSteps.find(s => s.group === "email")!;
  const postEmailSteps = funnelSteps.filter(s => s.group === "post-email" || s.group === "result");

  return (
    <div className="space-y-6">
      {/* Quick Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
        {/* Entrada no Funil */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Entradas</span>
              <Users className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold tracking-tight">{metrics.totalVisits.toLocaleString("pt-BR")}</p>
            <p className="text-xs text-muted-foreground mt-1">{metrics.uniqueVisitors.toLocaleString("pt-BR")} únicos</p>
          </CardContent>
        </Card>
        
        {/* Taxa de Captura de Email */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Captura Email</span>
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold tracking-tight text-primary">{emailConversion}%</p>
              <span className={cn("text-xs font-medium", emailConversion >= 50 ? "text-green-500" : "text-amber-500")}>
                {emailConversion >= 50 ? "Saudável" : "Otimizar"}
              </span>
            </div>
            <Progress value={emailConversion} className="mt-3 h-1.5" />
          </CardContent>
        </Card>
        
        {/* Conversao Final */}
        <Card className="relative overflow-hidden border-green-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent" />
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Conversão Final</span>
              <Target className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold tracking-tight text-green-500">{overallConversion}%</p>
            <p className="text-xs text-muted-foreground mt-1">{metrics.pageViews.result.toLocaleString("pt-BR")} chegaram</p>
          </CardContent>
        </Card>
        
        {/* Maior Gargalo */}
        <Card className="relative overflow-hidden border-destructive/30 bg-destructive/5">
          <CardContent className="p-5 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-destructive">Maior Gargalo</span>
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <p className="text-lg font-bold text-destructive">{biggestDropoff.from} → {biggestDropoff.to}</p>
            <p className="text-2xl font-bold text-destructive">-{biggestDropoff.rate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Flow Visualization */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Fluxo do Funil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pre-Email Journey */}
          <div className="relative">
            <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
              Jornada Pré-Email
            </h4>
            <div className="flex items-stretch gap-0.5 lg:gap-1 overflow-x-auto pb-2 scroll-smooth">
              {preEmailSteps.map((step, i) => (
                <FunnelStepCard 
                  key={step.key}
                  step={step}
                  views={metrics.pageViews[step.key]}
                  conversionRate={i > 0 ? getConversionRate(preEmailSteps[i-1].key, step.key) : 100}
                  dropoffRate={preEmailSteps[i+1] ? getDropoffRate(step.key, preEmailSteps[i+1].key) : undefined}
                  isBiggestDropoff={step.key === biggestDropoff.fromKey}
                  showArrow={i < preEmailSteps.length - 1}
                  index={i}
                />
              ))}
            </div>
          </div>
          
          {/* Email Capture - Critical Point */}
          <div className="relative border-y border-primary/20 py-4 bg-primary/5 -mx-6 px-6">
            <h4 className="text-xs font-medium text-primary mb-3 uppercase tracking-wider flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Captura de Email (Ponto Crítico)
            </h4>
            <div className="flex items-center gap-4">
              <FunnelStepCard 
                step={emailStep}
                views={metrics.pageViews.email}
                conversionRate={getConversionRate("question6", "email")}
                dropoffRate={getDropoffRate("email", "question7")}
                isBiggestDropoff={emailStep.key === biggestDropoff.fromKey}
                showArrow={true}
                isHighlight={true}
                size="large"
                index={0}
              />
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-primary">{getConversionRate("question6", "email")}%</span> dos que chegaram na Q6
              </div>
            </div>
          </div>
          
          {/* Post-Email Journey */}
          <div className="relative">
            <h4 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
              Jornada Pós-Email
            </h4>
            <div className="flex items-stretch gap-0.5 lg:gap-1 overflow-x-auto pb-2 scroll-smooth">
              {postEmailSteps.map((step, i) => (
                <FunnelStepCard 
                  key={step.key}
                  step={step}
                  views={metrics.pageViews[step.key]}
                  conversionRate={getConversionRate(i === 0 ? "email" : postEmailSteps[i-1].key, step.key)}
                  dropoffRate={postEmailSteps[i+1] ? getDropoffRate(step.key, postEmailSteps[i+1].key) : undefined}
                  isBiggestDropoff={step.key === biggestDropoff.fromKey}
                  showArrow={i < postEmailSteps.length - 1}
                  isResult={step.key === "result"}
                  index={i}
                />
              ))}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Início: {metrics.pageViews.landing.toLocaleString("pt-BR")}</span>
              <span className="text-green-500 font-medium">Resultado: {metrics.pageViews.result.toLocaleString("pt-BR")}</span>
            </div>
            <div className="relative h-6 bg-muted/30 rounded-full overflow-hidden">
              {[...funnelSteps].reverse().map((step, i) => {
                const width = maxViews > 0 ? (metrics.pageViews[step.key] / maxViews) * 100 : 0;
                return (
                  <motion.div
                    key={step.key}
                    initial={{ width: 0 }}
                    animate={{ width: `${width}%` }}
                    transition={{ duration: 0.5, delay: i * 0.03 }}
                    className={cn(
                      "absolute left-0 top-0 h-full",
                      step.key === "result" 
                        ? "bg-green-500" 
                        : step.key === "email" 
                          ? "bg-primary" 
                          : "bg-primary/60"
                    )}
                    style={{ zIndex: i + 1 }}
                  />
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Comparison Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Resumo por Etapa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <table className="w-full text-sm min-w-[500px]">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Etapa</th>
                  <th className="text-right p-3 font-medium">Visitantes</th>
                  <th className="text-right p-3 font-medium">Taxa Avanço</th>
                  <th className="text-right p-3 font-medium">Abandono</th>
                  <th className="text-center p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {funnelSteps.map((step, i) => {
                  const views = metrics.pageViews[step.key];
                  const nextStep = funnelSteps[i + 1];
                  const advanceRate = nextStep ? getConversionRate(step.key, nextStep.key) : 100;
                  const dropoff = nextStep ? getDropoffRate(step.key, nextStep.key) : 0;
                  
                  return (
                    <tr key={step.key} className={cn(
                      step.key === biggestDropoff.fromKey && "bg-destructive/5"
                    )}>
                      <td className="p-3 font-medium">{step.label}</td>
                      <td className="p-3 text-right font-mono">{views.toLocaleString("pt-BR")}</td>
                      <td className={cn("p-3 text-right font-semibold", nextStep ? getHealthColor(advanceRate) : "text-muted-foreground")}>
                        {nextStep ? `${advanceRate}%` : "-"}
                      </td>
                      <td className={cn(
                        "p-3 text-right",
                        dropoff > 20 ? "text-destructive font-semibold" : "text-muted-foreground"
                      )}>
                        {dropoff > 0 ? `-${dropoff}%` : "-"}
                      </td>
                      <td className="p-3 text-center">
                        {step.key === biggestDropoff.fromKey ? (
                          <span className="inline-flex items-center gap-1 text-destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-xs font-medium">Otimizar</span>
                          </span>
                        ) : !nextStep ? (
                          <span className="inline-flex items-center gap-1 text-green-500">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-xs font-medium">Final</span>
                          </span>
                        ) : advanceRate >= 90 ? (
                          <span className="inline-flex items-center gap-1 text-green-500">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-xs font-medium">Ótimo</span>
                          </span>
                        ) : advanceRate >= 70 ? (
                          <span className="text-xs font-medium text-amber-500">Bom</span>
                        ) : (
                          <span className="text-xs font-medium text-muted-foreground">Revisar</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Offer Flow Distribution */}
      {flowCounts && totalFlowLeads > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              Distribuição por Oferta (baseado na Q7)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-lg bg-primary/10 border border-primary/20"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <p className="text-xs text-muted-foreground font-medium">Oferta 1 (A/B)</p>
                </div>
                <p className="text-2xl font-bold text-primary">{flowCounts.flow1}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalFlowLeads > 0 ? Math.round((flowCounts.flow1 / totalFlowLeads) * 100) : 0}% dos leads
                </p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="p-4 rounded-lg bg-secondary/50 border border-secondary"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-4 h-4 text-secondary-foreground" />
                  <p className="text-xs text-muted-foreground font-medium">Oferta 2 (C/D)</p>
                </div>
                <p className="text-2xl font-bold text-secondary-foreground">{flowCounts.flow2}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalFlowLeads > 0 ? Math.round((flowCounts.flow2 / totalFlowLeads) * 100) : 0}% dos leads
                </p>
              </motion.div>
            </div>
            {flowCounts.unknown > 0 && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                {flowCounts.unknown} lead(s) ainda sem classificação de oferta
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Last Updated */}
      <p className="text-[10px] text-muted-foreground text-center">
        Atualizado em: {new Date(metrics.lastUpdated).toLocaleString("pt-BR")}
      </p>
    </div>
  );
}
