import { motion } from "framer-motion";
import { BarChart3, Users, TrendingDown, RotateCcw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FunnelMetrics as FunnelMetricsType } from "@/hooks/useFunnelMetrics";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface FunnelMetricsProps {
  metrics: FunnelMetricsType;
  onReset: () => void;
  getDropoffRate: (from: keyof FunnelMetricsType["pageViews"], to: keyof FunnelMetricsType["pageViews"]) => number;
  getConversionRate: (from: keyof FunnelMetricsType["pageViews"], to: keyof FunnelMetricsType["pageViews"]) => number;
}

const funnelSteps: { key: keyof FunnelMetricsType["pageViews"]; label: string }[] = [
  { key: "landing", label: "Início" },
  { key: "question1", label: "Pergunta 1" },
  { key: "question2", label: "Pergunta 2" },
  { key: "question3", label: "Pergunta 3" },
  { key: "question4", label: "Pergunta 4" },
  { key: "question5", label: "Pergunta 5" },
  { key: "question6", label: "Pergunta 6" },
  { key: "email", label: "Captura Email" },
  { key: "question7", label: "Pergunta 7" },
  { key: "question8", label: "Pergunta 8" },
  { key: "result", label: "Resultado" },
];

export function FunnelMetricsPanel({ metrics, onReset, getDropoffRate, getConversionRate }: FunnelMetricsProps) {
  const maxViews = Math.max(...Object.values(metrics.pageViews), 1);
  const overallConversion = getConversionRate("landing", "result");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Métricas do Funil</h3>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
              <RotateCcw className="w-4 h-4 mr-1" />
              Resetar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle>Resetar Métricas?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação irá zerar todas as métricas do funil. Os dados não podem ser recuperados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={onReset} className="bg-destructive hover:bg-destructive/90">
                Confirmar Reset
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <Users className="w-3 h-3" />
            Visitas Totais
          </div>
          <p className="text-2xl font-bold text-foreground">{metrics.totalVisits}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <TrendingDown className="w-3 h-3" />
            Conversão Total
          </div>
          <p className="text-2xl font-bold text-primary">{overallConversion}%</p>
        </div>
      </div>

      {/* Funnel Visualization */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          Fluxo do Funil
        </p>
        <div className="space-y-1">
          {funnelSteps.map((step, index) => {
            const views = metrics.pageViews[step.key];
            const barWidth = maxViews > 0 ? (views / maxViews) * 100 : 0;
            const nextStep = funnelSteps[index + 1];
            const dropoff = nextStep ? getDropoffRate(step.key, nextStep.key) : null;

            return (
              <div key={step.key}>
                <div className="flex items-center gap-2">
                  <div className="w-24 text-xs text-muted-foreground truncate">
                    {step.label}
                  </div>
                  <div className="flex-1 h-6 bg-muted/30 rounded overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="h-full bg-gradient-to-r from-primary to-primary/70 rounded"
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-foreground">
                      {views}
                    </span>
                  </div>
                </div>
                {dropoff !== null && dropoff > 0 && (
                  <div className="flex items-center gap-2 ml-24 my-0.5">
                    <ArrowRight className="w-3 h-3 text-muted-foreground/50" />
                    <span className="text-[10px] text-destructive/80">
                      -{dropoff}% abandono
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Last Updated */}
      <p className="text-[10px] text-muted-foreground text-center">
        Última atualização: {new Date(metrics.lastUpdated).toLocaleString("pt-BR")}
      </p>
    </div>
  );
}
