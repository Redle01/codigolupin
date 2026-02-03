import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Visitor } from "@/hooks/useVisitors";

interface VisitorProgressTableProps {
  visitors: Visitor[];
  isLoading?: boolean;
}

const stepLabels: Record<string, string> = {
  landing: "Landing",
  question1: "Q1",
  question2: "Q2",
  question3: "Q3",
  question4: "Q4",
  question5: "Q5",
  question6: "Q6",
  email: "Email",
  question7: "Q7",
  question8: "Q8",
  result: "Resultado",
};

export function VisitorProgressTable({ visitors, isLoading }: VisitorProgressTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (visitors.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum visitante encontrado.
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Visitante</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Última Etapa</TableHead>
            <TableHead>Abandonou em</TableHead>
            <TableHead>Oferta</TableHead>
            <TableHead>Perfil</TableHead>
            <TableHead>Última Atividade</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visitors.map((visitor) => (
            <TableRow key={visitor.visitorId}>
              <TableCell className="font-mono text-xs">
                {visitor.visitorId.slice(0, 12)}...
              </TableCell>
              <TableCell>
                {visitor.email || (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                <Badge 
                  variant={visitor.reachedStep === "result" ? "default" : "secondary"}
                  className={visitor.reachedStep === "result" ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}
                >
                  {stepLabels[visitor.reachedStep] || visitor.reachedStep}
                </Badge>
              </TableCell>
              <TableCell>
                {visitor.abandonedAt ? (
                  <Badge variant="destructive" className="bg-destructive/10 text-destructive border-destructive/20">
                    {stepLabels[visitor.abandonedAt] || visitor.abandonedAt}
                  </Badge>
                ) : visitor.reachedStep === "result" ? (
                  <span className="text-green-500">✓ Completou</span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {visitor.offerFlow ? (
                  <Badge 
                    variant="outline"
                    className={visitor.offerFlow === 1 
                      ? "bg-blue-500/10 text-blue-500 border-blue-500/20" 
                      : "bg-purple-500/10 text-purple-500 border-purple-500/20"
                    }
                  >
                    Oferta {visitor.offerFlow}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {visitor.profileType ? (
                  <Badge variant="outline" className="capitalize">
                    {visitor.profileType}
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(visitor.lastSeenAt), {
                  locale: ptBR,
                  addSuffix: true,
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
