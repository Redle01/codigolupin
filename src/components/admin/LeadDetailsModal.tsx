import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Lead } from "@/hooks/useLeads";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const PROFILE_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  diamante: { label: "Diamante", emoji: "💎", color: "bg-blue-500" },
  estrategista: { label: "Estrategista", emoji: "🎯", color: "bg-purple-500" },
  visionario: { label: "Visionário", emoji: "🔮", color: "bg-amber-500" },
  executor: { label: "Executor", emoji: "⚡", color: "bg-green-500" },
};

interface LeadDetailsModalProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadDetailsModal({ lead, open, onOpenChange }: LeadDetailsModalProps) {
  if (!lead) return null;

  const profileInfo = lead.result_type
    ? PROFILE_LABELS[lead.result_type] || { label: lead.result_type, emoji: "❓", color: "bg-gray-500" }
    : null;

  const formattedDate = lead.created_at
    ? format(new Date(lead.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
    : "Data desconhecida";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhes do Lead</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <p className="text-lg font-semibold">{lead.email}</p>
          </div>

          {/* Profile */}
          {profileInfo && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Perfil</label>
              <div className="mt-1">
                <Badge className={`${profileInfo.color} text-white`}>
                  {profileInfo.emoji} {profileInfo.label}
                </Badge>
              </div>
            </div>
          )}

          {/* Date */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Data de Captura</label>
            <p>{formattedDate}</p>
          </div>

          {/* Visitor ID */}
          {lead.visitor_id && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Visitor ID</label>
              <p className="text-sm font-mono text-muted-foreground">{lead.visitor_id}</p>
            </div>
          )}

          {/* Answers */}
          {lead.answers && Object.keys(lead.answers).length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Respostas do Quiz</label>
              <div className="mt-2 rounded-lg border bg-muted/50 p-3 space-y-2">
                {Object.entries(lead.answers).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pergunta {parseInt(key) + 1}:</span>
                    <span className="font-medium">Opção {(value as number) + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
