import { DashboardLayout } from "@/components/DashboardLayout";
import { MapView } from "@/components/MapView";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MOCK_OCCURRENCES, STATUS_MAP_COLORS, STATUS_LABELS, type Occurrence } from "@/lib/mock-data";
import { Wrench, CheckCircle, MapPin, MessageSquare, Camera } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const OPERATOR_OCCURRENCES = MOCK_OCCURRENCES.filter((o) => o.operatorId === "op1");

export default function OperatorArea() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = OPERATOR_OCCURRENCES.find((o) => o.id === selectedId);

  const markers = OPERATOR_OCCURRENCES.map((o) => ({
    id: o.id,
    lat: o.latitude,
    lng: o.longitude,
    color: STATUS_MAP_COLORS[o.status],
    popup: `<strong>${o.protocol}</strong><br/>${STATUS_LABELS[o.status]}`,
    label: o.postExternalId,
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
            <Wrench className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Área do Operador</h1>
            <p className="text-sm text-muted-foreground">João Silva — {OPERATOR_OCCURRENCES.length} ocorrências atribuídas</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Map */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Minhas Ocorrências
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MapView
                markers={markers}
                highlightId={selectedId || undefined}
                onMarkerClick={setSelectedId}
                height="300px"
                zoom={14}
              />
            </CardContent>
          </Card>

          {/* Detail */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-base">
                {selected ? selected.protocol : "Selecione uma ocorrência"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selected ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Clique em um marcador no mapa ou na lista abaixo</p>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    <StatusBadge status={selected.status} />
                    <PriorityBadge priority={selected.priority} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-muted-foreground">Poste:</span> <strong>{selected.postExternalId}</strong></div>
                    <div><span className="text-muted-foreground">Categoria:</span> {selected.categoryName}</div>
                  </div>
                  <p className="text-sm text-foreground">{selected.description}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => toast.info("Upload de foto simulado")}>
                      <Camera className="w-4 h-4 mr-1" /> Foto
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => toast.info("Comentário simulado")}>
                      <MessageSquare className="w-4 h-4 mr-1" /> Comentar
                    </Button>
                  </div>
                  {(selected.status === "EM_EXECUCAO" || selected.status === "ATRIBUIDA") && (
                    <Button className="w-full" onClick={() => toast.success("Finalização solicitada!")}>
                      <CheckCircle className="w-4 h-4 mr-2" /> Solicitar Finalização
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* List */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">Lista de Ocorrências</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {OPERATOR_OCCURRENCES.map((o) => (
              <button
                key={o.id}
                onClick={() => setSelectedId(o.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors
                  ${selectedId === o.id ? "bg-accent border-primary/30" : "hover:bg-accent/50"}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{o.protocol}</span>
                    <StatusBadge status={o.status} />
                    <PriorityBadge priority={o.priority} />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{o.categoryName} — {o.postExternalId}</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
