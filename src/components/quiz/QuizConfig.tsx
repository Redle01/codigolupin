import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Link, Webhook, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FunnelMetricsPanel } from "./FunnelMetrics";
import { FunnelMetrics as FunnelMetricsType } from "@/hooks/useFunnelMetrics";

interface QuizConfigProps {
  checkoutUrl: string;
  webhookUrl: string;
  onCheckoutUrlChange: (url: string) => void;
  onWebhookUrlChange: (url: string) => void;
  metrics: FunnelMetricsType;
  onResetMetrics: () => void;
  onRefreshMetrics: () => void;
  getDropoffRate: (from: keyof FunnelMetricsType["pageViews"], to: keyof FunnelMetricsType["pageViews"]) => number;
  getConversionRate: (from: keyof FunnelMetricsType["pageViews"], to: keyof FunnelMetricsType["pageViews"]) => number;
}

export function QuizConfig({
  checkoutUrl,
  webhookUrl,
  onCheckoutUrlChange,
  onWebhookUrlChange,
  metrics,
  onResetMetrics,
  onRefreshMetrics,
  getDropoffRate,
  getConversionRate,
}: QuizConfigProps) {
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<"idle" | "success" | "error">("idle");

  const testWebhook = async () => {
    if (!webhookUrl) return;
    
    setTestingWebhook(true);
    setWebhookStatus("idle");

    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({
          test: true,
          message: "Teste do Quiz Arsène Lupin",
          timestamp: new Date().toISOString(),
        }),
      });
      
      setWebhookStatus("success");
    } catch (error) {
      setWebhookStatus("error");
    } finally {
      setTestingWebhook(false);
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-4 right-4 h-12 w-12 rounded-full bg-card border border-border shadow-lg hover:bg-muted"
        >
          <Settings className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-card border-border w-[480px] sm:w-[540px] sm:max-w-[540px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-foreground">Painel de Controle</SheetTitle>
          <SheetDescription>
            Gerencie configurações e acompanhe métricas do funil
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="settings" className="mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50">
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </TabsTrigger>
            <TabsTrigger value="metrics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <span className="mr-2">📊</span>
              Métricas
            </TabsTrigger>
          </TabsList>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6 space-y-6">
            {/* Checkout URL */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-foreground">
                <Link className="w-4 h-4 text-primary" />
                URL do Checkout
              </Label>
              <Input
                type="url"
                placeholder="https://pay.hotmart.com/SEU_PRODUTO"
                value={checkoutUrl}
                onChange={(e) => onCheckoutUrlChange(e.target.value)}
                className="bg-input border-border text-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Cole aqui o link do seu checkout (Hotmart, Kiwify, etc.)
              </p>
            </div>

            {/* Webhook URL */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-foreground">
                <Webhook className="w-4 h-4 text-primary" />
                URL do Webhook
              </Label>
              <Input
                type="url"
                placeholder="https://hooks.zapier.com/..."
                value={webhookUrl}
                onChange={(e) => {
                  onWebhookUrlChange(e.target.value);
                  setWebhookStatus("idle");
                }}
                className="bg-input border-border text-foreground"
              />
              <p className="text-xs text-muted-foreground">
                Cole o webhook da sua ferramenta de email marketing
              </p>
            </div>

            {/* Test Webhook */}
            <div className="space-y-3">
              <Button
                onClick={testWebhook}
                disabled={!webhookUrl || testingWebhook}
                variant="outline"
                className="w-full"
              >
                {testingWebhook ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testando...
                  </>
                ) : (
                  "Testar Webhook"
                )}
              </Button>

              {webhookStatus === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-green-500 text-sm"
                >
                  <Check className="w-4 h-4" />
                  Requisição enviada! Verifique sua ferramenta.
                </motion.div>
              )}

              {webhookStatus === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-destructive text-sm"
                >
                  <X className="w-4 h-4" />
                  Erro ao enviar. Verifique a URL.
                </motion.div>
              )}
            </div>

            {/* Info */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-foreground mb-2">
                💡 Dicas de Integração
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• O email será passado como ?email= na URL do checkout</li>
                <li>• O webhook recebe: email, respostas e timestamp</li>
                <li>• Teste o webhook antes de rodar tráfego</li>
              </ul>
            </div>
          </TabsContent>

          {/* Metrics Tab */}
          <TabsContent value="metrics" className="mt-6">
            <FunnelMetricsPanel
              metrics={metrics}
              onReset={onResetMetrics}
              onRefresh={onRefreshMetrics}
              getDropoffRate={getDropoffRate}
              getConversionRate={getConversionRate}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}