import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Eye, TrendingUp, Award } from "lucide-react";
import { LeadStats } from "@/hooks/useLeads";

const PROFILE_LABELS: Record<string, { label: string; emoji: string }> = {
  diamante: { label: "Diamante", emoji: "💎" },
  estrategista: { label: "Estrategista", emoji: "🎯" },
  visionario: { label: "Visionário", emoji: "🔮" },
  executor: { label: "Executor", emoji: "⚡" },
  unknown: { label: "Desconhecido", emoji: "❓" },
};

interface AdminDashboardProps {
  stats: LeadStats | null;
  isLoading?: boolean;
}

export function AdminDashboard({ stats, isLoading }: AdminDashboardProps) {
  const profileInfo = stats?.mostCommonProfile
    ? PROFILE_LABELS[stats.mostCommonProfile.type] || PROFILE_LABELS.unknown
    : null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : stats?.totalLeads || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Emails capturados
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Visitantes Únicos</CardTitle>
          <Eye className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : stats?.uniqueVisitors || 0}
          </div>
          <p className="text-xs text-muted-foreground">
            Iniciaram o quiz
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : `${stats?.conversionRate || 0}%`}
          </div>
          <p className="text-xs text-muted-foreground">
            Visitante → Lead
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Perfil Mais Comum</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? "..." : profileInfo ? `${profileInfo.emoji} ${profileInfo.label}` : "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">
            {stats?.mostCommonProfile ? `${stats.mostCommonProfile.count} leads` : "Sem dados"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
