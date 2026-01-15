import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Eye, Loader2 } from "lucide-react";
import { Lead, useLeads } from "@/hooks/useLeads";
import { LeadDetailsModal } from "./LeadDetailsModal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const PROFILE_OPTIONS = [
  { value: "all", label: "Todos os perfis" },
  { value: "diamante", label: "💎 Diamante" },
  { value: "estrategista", label: "🎯 Estrategista" },
  { value: "visionario", label: "🔮 Visionário" },
  { value: "executor", label: "⚡ Executor" },
];

const PROFILE_BADGES: Record<string, { label: string; emoji: string; className: string }> = {
  diamante: { label: "Diamante", emoji: "💎", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  estrategista: { label: "Estrategista", emoji: "🎯", className: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  visionario: { label: "Visionário", emoji: "🔮", className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  executor: { label: "Executor", emoji: "⚡", className: "bg-green-500/10 text-green-500 border-green-500/20" },
};

export function LeadsTable() {
  const { leads, total, page, limit, isLoading, fetchLeads, exportCSV, setPage } = useLeads();
  const [search, setSearch] = useState("");
  const [resultType, setResultType] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchLeads({ page: 1, search, resultType: resultType === "all" ? "" : resultType });
  }, []);

  const handleSearch = () => {
    fetchLeads({ page: 1, search, resultType });
  };

  const handleFilterChange = (value: string) => {
    setResultType(value);
    fetchLeads({ page: 1, search, resultType: value === "all" ? "" : value });
  };

  const handlePageChange = (newPage: number) => {
    fetchLeads({ page: newPage, search, resultType });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportCSV({ search, resultType });
      toast.success("CSV exportado com sucesso!");
    } catch {
      toast.error("Erro ao exportar CSV");
    } finally {
      setIsExporting(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9"
            />
          </div>
          <Button variant="secondary" onClick={handleSearch}>
            Buscar
          </Button>
        </div>

        <div className="flex gap-2">
          <Select value={resultType} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por perfil" />
            </SelectTrigger>
            <SelectContent>
              {PROFILE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  Nenhum lead encontrado
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => {
                const profile = lead.result_type ? PROFILE_BADGES[lead.result_type] : null;
                return (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.email}</TableCell>
                    <TableCell>
                      {profile ? (
                        <Badge variant="outline" className={profile.className}>
                          {profile.emoji} {profile.label}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {lead.created_at
                        ? format(new Date(lead.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {(page - 1) * limit + 1}-{Math.min(page * limit, total)} de {total} leads
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => page > 1 && handlePageChange(page - 1)}
                  className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={() => handlePageChange(pageNum)}
                      isActive={page === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={() => page < totalPages && handlePageChange(page + 1)}
                  className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Details Modal */}
      <LeadDetailsModal
        lead={selectedLead}
        open={!!selectedLead}
        onOpenChange={(open) => !open && setSelectedLead(null)}
      />
    </div>
  );
}
