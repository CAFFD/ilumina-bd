import { DashboardLayout } from "@/components/DashboardLayout";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MOCK_OCCURRENCES, STATUS_LABELS, CATEGORIES, type OccurrenceStatus, type Occurrence } from "@/lib/mock-data";
import { useState } from "react";
import { Search, Filter, Eye, CheckCircle, XCircle, UserPlus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

export default function OccurrencesList() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  const filtered = MOCK_OCCURRENCES.filter((o) => {
    if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
    if (categoryFilter !== "ALL" && o.categoryId !== categoryFilter) return false;
    if (search && !o.protocol.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Gestão de Ocorrências</h1>
          <p className="text-sm text-muted-foreground">Aprovar, rejeitar e atribuir ocorrências</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar protocolo..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9" />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos Status</SelectItem>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="h-9 w-40"><SelectValue placeholder="Categoria" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todas</SelectItem>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Protocolo</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground hidden md:table-cell">Poste</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground hidden md:table-cell">Categoria</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground hidden sm:table-cell">Prioridade</th>
                    <th className="text-left py-2 px-3 font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => (
                    <tr key={o.id} className="border-b hover:bg-accent/30 transition-colors">
                      <td className="py-2.5 px-3 font-medium">{o.protocol}</td>
                      <td className="py-2.5 px-3 hidden md:table-cell">{o.postExternalId}</td>
                      <td className="py-2.5 px-3 hidden md:table-cell">{o.categoryName}</td>
                      <td className="py-2.5 px-3"><StatusBadge status={o.status} /></td>
                      <td className="py-2.5 px-3 hidden sm:table-cell"><PriorityBadge priority={o.priority} /></td>
                      <td className="py-2.5 px-3">
                        <div className="flex gap-1">
                          {o.status === "PENDENTE_APROVACAO" && (
                            <>
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-success" onClick={() => toast.success("Ocorrência aprovada")}>
                                <CheckCircle className="w-3.5 h-3.5" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive" onClick={() => toast.info("Ocorrência rejeitada")}>
                                <XCircle className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                          {o.status === "APROVADA" && (
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-info" onClick={() => toast.info("Operador atribuído")}>
                              <UserPlus className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-7 px-2">
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle className="font-display">{o.protocol}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-3">
                                <div className="flex gap-2">
                                  <StatusBadge status={o.status} />
                                  <PriorityBadge priority={o.priority} />
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div><span className="text-muted-foreground">Poste:</span> {o.postExternalId}</div>
                                  <div><span className="text-muted-foreground">Categoria:</span> {o.categoryName}</div>
                                  <div><span className="text-muted-foreground">Telefone:</span> {o.phone}</div>
                                  <div><span className="text-muted-foreground">Operador:</span> {o.operatorName || "—"}</div>
                                </div>
                                <p className="text-sm">{o.description}</p>
                                <div className="text-xs text-muted-foreground">
                                  Criado: {new Date(o.createdAt).toLocaleString("pt-BR")} | Atualizado: {new Date(o.updatedAt).toLocaleString("pt-BR")}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <p className="text-center text-muted-foreground py-8 text-sm">Nenhuma ocorrência encontrada</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
