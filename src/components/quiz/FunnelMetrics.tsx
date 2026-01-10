import { motion } from "framer-motion";
import { BarChart3, Users, TrendingDown, RotateCcw, ArrowDown, Target, AlertTriangle } from "lucide-react";
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

const funnelSteps: { key: keyof FunnelMetricsType["pageViews"]; label: string; preview: string; icon: string }[] = [
  { key: "landing", label: "Início", preview: "Página inicial do quiz", icon: "🏠" },
  { key: "question1", label: "Pergunta 1", preview: "Identidade secreta", icon: "🎭" },
  { key: "question2", label: "Pergunta 2", preview: "Arma de sedução", icon: "💫" },
  { key: "question3", label: "Pergunta 3", preview: "Cenário perfeito", icon: "🌙" },
  { key: "question4", label: "Pergunta 4", preview: "Reação dela", icon: "💬" },
  { key: "question5", label: "Pergunta 5", preview: "Situação difícil", icon: "🎯" },
  { key: "question6", label: "Pergunta 6", preview: "Objetivo final", icon: "💎" },
  { key: "email", label: "Captura Email", preview: "Formulário de email", icon: "📧" },
  { key: "question7", label: "Pergunta 7", preview: "Âncora de preço", icon: "💰" },
  { key: "question8", label: "Pergunta 8", preview: "Compromisso", icon: "🤝" },
  { key: "result", label: "Resultado", preview: "Perfil + CTA final", icon: "🏆" },
];

export function FunnelMetricsPanel({ metrics, onReset, getDropoffRate, getConversionRate }: FunnelMetricsProps) {
  const maxViews = Math.max(...Object.values(metrics.pageViews), 1);
  const overallConversion = getConversionRate("landing", "result");
  const emailConversion = getConversionRate("landing", "email");

  // Find the biggest dropoff point
  let biggestDropoff = { from: "", to: "", rate: 0 };
  funnelSteps.forEach((step, index) => {
    const nextStep = funnelSteps[index + 1];
    if (nextStep) {
      const dropoff = getDropoffRate(step.key, nextStep.key);
      if (dropoff > biggestDropoff.rate) {
        biggestDropoff = { from: step.label, to: nextStep.label, rate: dropoff };
      }
    }
  });

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
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
            <Users className="w-3 h-3" />
            Visitas
          </div>
          <p className="text-xl font-bold text-foreground">{metrics.totalVisits}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
            <Target className="w-3 h-3" />
            Emails
          </div>
          <p className="text-xl font-bold text-primary">{emailConversion}%</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
            <TrendingDown className="w-3 h-3" />
            Conversão
          </div>
          <p className="text-xl font-bold text-green-500">{overallConversion}%</p>
        </div>
      </div>

      {/* Biggest Dropoff Alert */}
      {biggestDropoff.rate > 20 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 flex items-start gap-2"
        >
          <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-destructive">Maior ponto de abandono</p>
            <p className="text-xs text-muted-foreground">
              {biggestDropoff.from} → {biggestDropoff.to}: <span className="text-destructive font-semibold">{biggestDropoff.rate}%</span> de abandono
            </p>
          </div>
        </motion.div>
      )}

      {/* Funnel Visualization */}
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          Fluxo do Funil
        </p>
        <div className="space-y-2">
          {funnelSteps.map((step, index) => {
            const views = metrics.pageViews[step.key];
            const barWidth = maxViews > 0 ? (views / maxViews) * 100 : 0;
            const nextStep = funnelSteps[index + 1];
            const dropoff = nextStep ? getDropoffRate(step.key, nextStep.key) : null;
            const isHighDropoff = dropoff !== null && dropoff > 30;

            return (
              <div key={step.key}>
                {/* Step Card */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="bg-muted/30 rounded-lg p-2.5 border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Icon & Preview */}
                    <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 text-lg shrink-0">
                      {step.icon}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-foreground">{step.label}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{step.preview}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold text-foreground">{views}</p>
                          <p className="text-[10px] text-muted-foreground">usuários</p>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-2 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${barWidth}%` }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                          className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Dropoff Indicator */}
                {dropoff !== null && dropoff > 0 && (
                  <div className="flex items-center justify-center gap-1.5 py-1">
                    <ArrowDown className={`w-3 h-3 ${isHighDropoff ? 'text-destructive' : 'text-muted-foreground/50'}`} />
                    <span className={`text-[10px] ${isHighDropoff ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
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
      <div className="pt-2 border-t border-border/50">
        <p className="text-[10px] text-muted-foreground text-center">
          Atualizado em: {new Date(metrics.lastUpdated).toLocaleString("pt-BR")}
        </p>
      </div>
    </div>
  );
}