import { useState, useEffect, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
import { subDays } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useFunnelMetrics } from "@/hooks/useFunnelMetrics";
import { useLeads } from "@/hooks/useLeads";
import { useLeadsTimeline } from "@/hooks/useLeadsTimeline";
import { useRealtimeAdmin } from "@/hooks/useRealtimeAdmin";
import { useVisitors } from "@/hooks/useVisitors";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { LeadsTable } from "@/components/admin/LeadsTable";
import { LeadsTimelineChart } from "@/components/admin/LeadsTimelineChart";
import { FunnelMetricsInline } from "@/components/admin/FunnelMetricsInline";
import { VisitorProgressTable } from "@/components/admin/VisitorProgressTable";
import { DateRangePicker } from "@/components/admin/DateRangePicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Loader2, Shield, ShieldAlert, BarChart3, LayoutDashboard, Users, RefreshCw, Eye, RotateCcw } from "lucide-react";
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
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Admin() {
  const { user, isAdmin, isLoading: isAuthLoading, signIn, signOut } = useAuth();
  const { metrics, resetMetrics, refreshMetrics, getDropoffRate, getConversionRate } = useFunnelMetrics();
  const { stats, fetchStats } = useLeads();
  const { timeline, isLoading: isTimelineLoading, fetchTimeline } = useLeadsTimeline();
  const { visitors, stats: visitorStats, isLoading: isVisitorsLoading, fetchVisitors } = useVisitors();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dateRange, setDateRange] = useState<{
    startDate: Date | undefined;
    endDate: Date | undefined;
  }>({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refresh all data callback
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

  // Handler para mudança de datas - atualiza funil e timeline juntos
  const handleDateChange = useCallback((start: Date | undefined, end: Date | undefined) => {
    setDateRange({ startDate: start, endDate: end });
    if (start && end) {
      refreshMetrics({ startDate: start, endDate: end });
      fetchTimeline({ startDate: start, endDate: end });
    }
  }, [refreshMetrics, fetchTimeline]);

  // Realtime subscription
  const { isConnected, lastUpdate } = useRealtimeAdmin({
    onLeadInserted: handleRefreshAll,
    onFunnelEventInserted: handleRefreshAll,
    enabled: !!user && isAdmin,
  });

  // Refresh data when admin logs in
  useEffect(() => {
    if (user && isAdmin) {
      refreshMetrics({ startDate: dateRange.startDate, endDate: dateRange.endDate });
      fetchStats();
      fetchTimeline({ startDate: dateRange.startDate, endDate: dateRange.endDate });
      fetchVisitors();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      await signIn(email, password);
      toast.success("Login realizado com sucesso!");
      setEmail("");
      setPassword("");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logout realizado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer logout");
    }
  };

  // Loading state
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Not logged in - show login form
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Painel Admin</CardTitle>
            <CardDescription>
              Faça login para acessar o painel de métricas do funil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoggingIn}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoggingIn}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoggingIn}>
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Logged in but not admin - show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-destructive/10 w-fit">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Acesso Negado</CardTitle>
            <CardDescription>
              Sua conta ({user.email}) não possui permissões de administrador.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleLogout} className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Sair e tentar com outra conta
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin - show full admin panel with tabs
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Painel Administrativo</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Realtime Status Indicator */}
            <div className="hidden sm:flex items-center gap-2">
              {isConnected ? (
                <span className="flex items-center gap-1.5 text-sm">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-500 font-medium">Ao vivo</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span className="w-2 h-2 bg-muted rounded-full" />
                  Offline
                </span>
              )}
              {lastUpdate && (
                <span className="text-xs text-muted-foreground">
                  · {formatDistanceToNow(lastUpdate, { locale: ptBR, addSuffix: true })}
                </span>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main content with tabs */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="visitors" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span className="hidden sm:inline">Visitantes</span>
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Leads</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Dashboard Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">Visão geral do desempenho do quiz</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefreshAll}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>

            {/* Stats Cards */}
            <AdminDashboard stats={stats} />

            {/* Funnel Metrics Inline */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle className="text-lg">Métricas do Funil</CardTitle>
                  <div className="flex items-center gap-2 flex-wrap">
                    <DateRangePicker
                      startDate={dateRange.startDate}
                      endDate={dateRange.endDate}
                      onDateChange={handleDateChange}
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive"
                        >
                          Resetar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Deseja realmente resetar todas as métricas do funil?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação irá zerar todos os dados de métricas. Os dados não podem ser recuperados.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => resetMetrics()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Confirmar Reset
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <FunnelMetricsInline 
                  metrics={metrics}
                  getDropoffRate={getDropoffRate}
                  getConversionRate={getConversionRate}
                />
              </CardContent>
            </Card>
            
            {/* Timeline Charts */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Evolução Temporal</h3>
              <LeadsTimelineChart 
                timeline={timeline}
                isLoading={isTimelineLoading}
              />
            </div>
          </TabsContent>

          <TabsContent value="visitors" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Rastreamento de Visitantes</h2>
                <p className="text-muted-foreground">Jornada individual de cada visitante no funil</p>
              </div>
              <div className="flex gap-2">
                {visitorStats && (
                  <div className="flex gap-4 text-sm">
                    <span className="text-muted-foreground">
                      Total: <span className="font-semibold text-foreground">{visitorStats.totalVisitors}</span>
                    </span>
                    <span className="text-muted-foreground">
                      Completaram: <span className="font-semibold text-primary">{visitorStats.completedFunnel}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <VisitorProgressTable visitors={visitors} isLoading={isVisitorsLoading} />
          </TabsContent>

          <TabsContent value="leads" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Leads Capturados</h2>
              <p className="text-muted-foreground">Gerenciar e exportar leads do quiz</p>
            </div>
            <LeadsTable />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
