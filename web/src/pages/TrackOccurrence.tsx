import { useState } from "react";
import { PublicHeader } from "@/components/PublicHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { MOCK_OCCURRENCES } from "@/lib/mock-data";
import { Search, FileText } from "lucide-react";
import { useSearchParams } from "react-router-dom";

export default function TrackOccurrence() {
  const [searchParams] = useSearchParams();
  const [protocol, setProtocol] = useState(searchParams.get("protocolo") || "");
  const [searched, setSearched] = useState(!!searchParams.get("protocolo"));

  const occurrence = MOCK_OCCURRENCES.find((o) => o.protocol === protocol);

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <div className="container mx-auto px-4 py-6 max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle className="font-display flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Acompanhar Ocorrência
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Digite o número do protocolo"
                value={protocol}
                onChange={(e) => setProtocol(e.target.value)}
              />
              <Button onClick={() => setSearched(true)}>Buscar</Button>
            </div>

            {searched && occurrence && (
              <div className="space-y-3 animate-fade-in">
                <div className="bg-accent rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-display font-semibold text-foreground">{occurrence.protocol}</span>
                    <StatusBadge status={occurrence.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Poste:</span> <strong>{occurrence.postExternalId}</strong></div>
                    <div><span className="text-muted-foreground">Prioridade:</span> <PriorityBadge priority={occurrence.priority} /></div>
                    <div><span className="text-muted-foreground">Categoria:</span> {occurrence.categoryName}</div>
                    <div><span className="text-muted-foreground">Operador:</span> {occurrence.operatorName || "—"}</div>
                  </div>
                  <p className="text-sm text-muted-foreground">{occurrence.description}</p>
                  <div className="text-xs text-muted-foreground">
                    Registrado em: {new Date(occurrence.createdAt).toLocaleDateString("pt-BR")}
                  </div>
                </div>
              </div>
            )}

            {searched && !occurrence && (
              <div className="text-center py-8">
                <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Nenhuma ocorrência encontrada com este protocolo.</p>
                <p className="text-xs text-muted-foreground mt-1">Tente: ZU-2026-0001</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
