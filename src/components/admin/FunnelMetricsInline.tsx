import { motion } from "framer-motion";
import { ArrowRight, AlertTriangle, Users, Target, TrendingDown, CheckCircle2 } from "lucide-react";
import { FunnelMetrics as FunnelMetricsType } from "@/hooks/useFunnelMetrics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FunnelMetricsInlineProps {
  metrics: FunnelMetricsType;
  getDropoffRate: (from: keyof FunnelMetricsType["pageViews"], to: keyof FunnelMetricsType["pageViews"]) => number;
  getConversionRate: (from: keyof FunnelMetricsType["pageViews"], to: keyof FunnelMetricsType["pageViews"]) => number;
}

const funnelSteps: { key: keyof FunnelMetricsType["pageViews"]; label: string; icon: string }[] = [
  { key: "landing", label: "Início", icon: "🏠" },
  { key: "question1", label: "Q1", icon: "1️⃣" },
  { key: "question2", label: "Q2", icon: "2️⃣" },
  { key: "question3", label: "Q3", icon: "3️⃣" },
  { key: "question4", label: "Q4", icon: "4️⃣" },
  { key: "question5", label: "Q5", icon: "5️⃣" },
  { key: "question6", label: "Q6", icon: "6️⃣" },
  { key: "email", label: "Email", icon: "📧" },
  { key: "question7", label: "Q7", icon: "7️⃣" },
  { key: "question8", label: "Q8", icon: "8️⃣" },
  { key: "result", label: "Resultado", icon: "🏆" },
];

export function FunnelMetricsInline({ metrics, getDropoffRate, getConversionRate }: FunnelMetricsInlineProps) {
  const maxViews = Math.max(...Object.values(metrics.pageViews), 1);
  const overallConversion = getConversionRate("landing", "result");
  const emailConversion = getConversionRate("landing", "email");

  // Find the biggest dropoff point
  let biggestDropoff = { from: "", to: "", rate: 0, fromKey: "", toKey: "" };
  funnelSteps.forEach((step, index) => {
    const nextStep = funnelSteps[index + 1];
    if (nextStep) {
      const dropoff = getDropoffRate(step.key, nextStep.key);
      if (dropoff > biggestDropoff.rate) {
        biggestDropoff = { 
          from: step.label, 
          to: nextStep.label, 
          rate: dropoff,
          fromKey: step.key,
          toKey: nextStep.key
        };
      }
    }
  });

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Users className="w-3.5 h-3.5" />
              Visitas
            </div>
            <p className="text-2xl font-bold">{metrics.totalVisits}</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Users className="w-3.5 h-3.5" />
              Únicos
            </div>
            <p className="text-2xl font-bold">{metrics.uniqueVisitors}</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Target className="w-3.5 h-3.5" />
              Emails
            </div>
            <p className="text-2xl font-bold text-primary">{emailConversion}%</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Conversão
            </div>
            <p className="text-2xl font-bold text-green-500">{overallConversion}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Funnel Flow */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Fluxo do Funil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {funnelSteps.map((step, index) => {
              const views = metrics.pageViews[step.key];
              const barHeight = maxViews > 0 ? Math.max((views / maxViews) * 100, 10) : 10;
              const nextStep = funnelSteps[index + 1];
              const dropoff = nextStep ? getDropoffRate(step.key, nextStep.key) : 0;
              const isHighDropoff = dropoff > 30;
              const isBiggestDropoff = step.key === biggestDropoff.fromKey;

              return (
                <div key={step.key} className="flex items-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className={`flex flex-col items-center min-w-[52px] p-2 rounded-lg transition-colors ${
                      isBiggestDropoff ? 'bg-destructive/10 ring-1 ring-destructive/30' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="relative w-8 h-16 bg-muted/50 rounded overflow-hidden flex items-end">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${barHeight}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        className={`w-full rounded-t ${
                          step.key === 'email' 
                            ? 'bg-primary' 
                            : step.key === 'result' 
                              ? 'bg-green-500' 
                              : 'bg-primary/60'
                        }`}
                      />
                    </div>
                    <span className="text-lg mt-1">{step.icon}</span>
                    <span className="text-[10px] text-muted-foreground font-medium">{step.label}</span>
                    <span className="text-xs font-bold">{views}</span>
                  </motion.div>
                  
                  {index < funnelSteps.length - 1 && (
                    <div className="flex flex-col items-center mx-0.5">
                      <ArrowRight className={`w-3 h-3 ${isHighDropoff ? 'text-destructive' : 'text-muted-foreground/40'}`} />
                      {dropoff > 0 && (
                        <span className={`text-[9px] ${isHighDropoff ? 'text-destructive font-medium' : 'text-muted-foreground/60'}`}>
                          -{dropoff}%
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Biggest Dropoff Alert */}
      {biggestDropoff.rate > 20 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20"
        >
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
          <div>
            <p className="text-sm font-medium text-destructive">Maior ponto de abandono</p>
            <p className="text-sm text-muted-foreground">
              {biggestDropoff.from} → {biggestDropoff.to}: <span className="text-destructive font-semibold">{biggestDropoff.rate}%</span> de abandono
            </p>
          </div>
        </motion.div>
      )}

      {/* Last Updated */}
      <p className="text-[10px] text-muted-foreground text-center">
        Atualizado em: {new Date(metrics.lastUpdated).toLocaleString("pt-BR")}
      </p>
    </div>
  );
}
