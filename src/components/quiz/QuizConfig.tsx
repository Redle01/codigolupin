import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { FunnelMetricsPanel } from "./FunnelMetrics";
import { FunnelMetrics as FunnelMetricsType } from "@/hooks/useFunnelMetrics";

interface QuizConfigProps {
  metrics: FunnelMetricsType;
  onResetMetrics: () => void;
  onRefreshMetrics: () => void;
  getDropoffRate: (from: keyof FunnelMetricsType["pageViews"], to: keyof FunnelMetricsType["pageViews"]) => number;
  getConversionRate: (from: keyof FunnelMetricsType["pageViews"], to: keyof FunnelMetricsType["pageViews"]) => number;
}

export function QuizConfig({
  metrics,
  onResetMetrics,
  onRefreshMetrics,
  getDropoffRate,
  getConversionRate,
}: QuizConfigProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-4 right-16 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-card border-border w-[480px] sm:w-[540px] sm:max-w-[540px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-foreground">Métricas do Funil</SheetTitle>
          <SheetDescription>
            Acompanhe o desempenho do seu funil em tempo real
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4">
          <FunnelMetricsPanel
            metrics={metrics}
            onReset={onResetMetrics}
            onRefresh={onRefreshMetrics}
            getDropoffRate={getDropoffRate}
            getConversionRate={getConversionRate}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
