import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import L from "leaflet";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MapView } from "@/components/MapView";
import { StatusBadge, PriorityBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  MOCK_OCCURRENCES, STATUS_LABELS, STATUS_MAP_COLORS,
  type Occurrence,
} from "@/lib/mock-data";
import { loadPostsFromAPI, type RealPost } from "@/lib/posts-data";
import { getBairroByCep } from "@/lib/cep-bairro";
import { AlertTriangle, CheckCircle, Clock, MapPin, ClipboardList, TrendingUp, Search, QrCode, Download, ExternalLink, FileDown, Loader2, MousePointer, X, Eye } from "lucide-react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import jsPDF from "jspdf";

const BASE_URL = "http://ilumina.tipalmital.sp.gov.br";

const STAT_CARDS = [
  { label: "Pendentes", value: MOCK_OCCURRENCES.filter((o) => o.status === "PENDENTE_APROVACAO").length, icon: Clock, color: "text-warning" },
  { label: "Em Execução", value: MOCK_OCCURRENCES.filter((o) => o.status === "EM_EXECUCAO" || o.status === "ATRIBUIDA").length, icon: TrendingUp, color: "text-info" },
  { label: "Finalizadas", value: MOCK_OCCURRENCES.filter((o) => o.status === "FINALIZADA").length, icon: CheckCircle, color: "text-success" },
  { label: "Total", value: MOCK_OCCURRENCES.length, icon: ClipboardList, color: "text-primary" },
];

export default function Dashboard() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [posts, setPosts] = useState<RealPost[]>([]);
  const [exporting, setExporting] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    loadPostsFromAPI().then(setPosts);
  }, []);

  const postsWithBairro = useMemo(() =>
    posts.map((p) => ({ ...p, bairro: getBairroByCep(p.cep) })),
    [posts]
  );

  const togglePostSelection = useCallback((markerId: string) => {
    if (!selectionMode) return;
    // Extract post id from marker id format "post-XXX"
    const postId = markerId.startsWith("post-") ? markerId.replace("post-", "") : null;
    if (!postId) return;
    setSelectedPosts(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  }, [selectionMode]);

  const handleSelectVisible = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const bounds = map.getBounds();
    const visibleIds = postsWithBairro
      .filter(p => bounds.contains([p.latitude, p.longitude]))
      .map(p => p.idPoste);
    setSelectedPosts(visibleIds);
    toast.success(`${visibleIds.length} postes visíveis selecionados`);
  }, [postsWithBairro]);

  // Posts to use for QR export
  const exportPosts = useMemo(() => {
    if (selectedPosts.length > 0) {
      const set = new Set(selectedPosts);
      return postsWithBairro.filter(p => set.has(p.idPoste));
    }
    return postsWithBairro;
  }, [postsWithBairro, selectedPosts]);

  // Filtered occurrences
  const filteredOccurrences = MOCK_OCCURRENCES.filter((o) => {
    if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
    if (searchTerm && !o.protocol.toLowerCase().includes(searchTerm.toLowerCase()) && !o.postExternalId.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Map markers — highlight selected posts
  const selectedMarkerIds = useMemo(() =>
    selectedPosts.map(id => `post-${id}`),
    [selectedPosts]
  );

  const postMarkers = postsWithBairro.map((p) => ({
    id: `post-${p.idPoste}`,
    lat: p.latitude,
    lng: p.longitude,
    color: "#0a3d91",
    popup: `<strong>Poste: ${p.idPoste}</strong><br/>Bairro: ${p.bairro}<br/>IPs: ${p.ips.join(', ')}<br/>${p.tipoLampada} - ${p.potenciaW}W`,
    label: `P:${p.idPoste}`,
  }));

  const occurrenceMarkers = filteredOccurrences.map((o) => ({
    id: `occ-${o.id}`,
    lat: o.latitude,
    lng: o.longitude,
    color: STATUS_MAP_COLORS[o.status],
    popup: `<strong>${o.protocol}</strong><br/>${o.categoryName}<br/>${STATUS_LABELS[o.status]}`,
    label: o.postExternalId,
  }));

  const allMarkers = [...postMarkers, ...occurrenceMarkers];

  // Batch QR PDF export
  const handleExportPDF = async () => {
    if (exportPosts.length === 0) {
      toast.error("Nenhum poste para exportar.");
      return;
    }
    setExporting(true);
    const label = selectedPosts.length > 0 ? `${selectedPosts.length} selecionados` : "Todos";
    toast.info(`Gerando PDF com ${exportPosts.length} QR Codes (${label})...`);

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const postsToExport = exportPosts.slice(0, 200);
      const cols = 3;
      const rows = 4;
      const perPage = cols * rows;
      const pageWidth = 210;
      const margin = 15;
      const cellW = (pageWidth - margin * 2) / cols;
      const cellH = 60;

      for (let pageIdx = 0; pageIdx < Math.ceil(postsToExport.length / perPage); pageIdx++) {
        if (pageIdx > 0) pdf.addPage();
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.text(`QR Codes — ${label} — Pág. ${pageIdx + 1}`, pageWidth / 2, 10, { align: "center" });

        const pageSlice = postsToExport.slice(pageIdx * perPage, (pageIdx + 1) * perPage);

        for (let i = 0; i < pageSlice.length; i++) {
          const post = pageSlice[i];
          const col = i % cols;
          const row = Math.floor(i / cols);
          const x = margin + col * cellW;
          const y = 15 + row * cellH;
          const qrUrl = `${BASE_URL}/poste/${post.idPoste}`;

          pdf.setDrawColor(200);
          pdf.rect(x, y, cellW, cellH);
          pdf.setFontSize(9); // Aumentado para melhor leitura
          pdf.setFont("helvetica", "bold");
          pdf.setTextColor(0);
          pdf.text(`Poste ${post.idPoste}`, x + cellW / 2, y + 5, { align: "center" });

          const canvas = document.createElement("canvas");
          canvas.width = 200;
          canvas.height = 200;
          const ctx = canvas.getContext("2d");
          if (ctx) { ctx.fillStyle = "white"; ctx.fillRect(0, 0, 200, 200); }

          const tempDiv = document.createElement("div");
          tempDiv.style.position = "absolute";
          tempDiv.style.left = "-9999px";
          document.body.appendChild(tempDiv);

          const { createRoot } = await import("react-dom/client");
          const { createElement } = await import("react");
          const { QRCodeSVG: QR } = await import("qrcode.react");

          const root = createRoot(tempDiv);
          root.render(createElement(QR, { value: qrUrl, size: 180, level: "H", includeMargin: true }));
          await new Promise((r) => setTimeout(r, 80));

          const svgEl = tempDiv.querySelector("svg");
          if (svgEl && ctx) {
            const svgData = new XMLSerializer().serializeToString(svgEl);
            const img = new Image();
            await new Promise<void>((resolve) => {
              img.onload = () => { ctx.drawImage(img, 0, 0, 200, 200); resolve(); };
              img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
            });
            const imgData = canvas.toDataURL("image/png");
            const qrSize = 30;
            pdf.addImage(imgData, "PNG", x + (cellW - qrSize) / 2, y + 7, qrSize, qrSize);
          }

          root.unmount();
          document.body.removeChild(tempDiv);

          pdf.setFontSize(5);
          pdf.setFont("helvetica", "normal");
          pdf.setTextColor(100);
          pdf.text(post.logradouro || post.bairro, x + cellW / 2, y + cellH - 8, { align: "center" });
          if (post.cep) {
            pdf.text(`CEP: ${post.cep}`, x + cellW / 2, y + cellH - 4, { align: "center" });
          }
          pdf.setTextColor(0);
        }
      }

      const safeName = selectedPosts.length > 0 ? `selecionados-${selectedPosts.length}` : "todos";
      pdf.save(`qrcodes-${safeName}.pdf`);
      toast.success(`PDF gerado com ${postsToExport.length} QR Codes!`);
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Erro ao gerar PDF.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Monitoramento de ocorrências — Palmital — {posts.length} postes
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STAT_CARDS.map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-accent flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold font-display text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selection Mode + Export */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    id="selection-mode"
                    checked={selectionMode}
                    onCheckedChange={(checked) => {
                      setSelectionMode(checked);
                      if (!checked) setSelectedPosts([]);
                    }}
                  />
                  <Label htmlFor="selection-mode" className="text-sm font-medium text-foreground flex items-center gap-1.5 cursor-pointer">
                    <MousePointer className="w-4 h-4 text-primary" />
                    Modo Seleção
                  </Label>
                </div>
                {selectionMode && (
                  <Button size="sm" variant="outline" className="gap-1" onClick={handleSelectVisible}>
                    <Eye className="w-4 h-4" />
                    Selecionar Visíveis
                  </Button>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportPDF}
                disabled={exporting || posts.length === 0}
                className="gap-1 shrink-0"
              >
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                Baixar QR Codes{selectedPosts.length > 0 ? ` (${selectedPosts.length})` : ""}
              </Button>
            </div>
            {selectedPosts.length > 0 && (
              <div className="mt-3 p-2 rounded-md bg-accent/50 text-sm text-foreground flex items-center justify-between">
                <span>
                  <strong>Postes Selecionados:</strong> {selectedPosts.length}
                </span>
                <Button size="sm" variant="ghost" className="h-7 gap-1 text-destructive" onClick={() => setSelectedPosts([])}>
                  <X className="w-3.5 h-3.5" /> Limpar Seleção
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Map */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> Mapa de Postes e Ocorrências ({posts.length} postes)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MapView
              markers={allMarkers}
              height="450px"
              zoom={14}
              enableClustering
              highlightedIds={selectedMarkerIds}
              onMarkerClick={selectionMode ? togglePostSelection : undefined}
              mapInstanceRef={mapInstanceRef}
            />
            {selectionMode && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Clique nos marcadores para selecionar/desselecionar postes
              </p>
            )}
          </CardContent>
        </Card>

        {/* Filters + List */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <CardTitle className="font-display text-base">Ocorrências Recentes</CardTitle>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar protocolo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 h-9 w-full sm:w-48"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos</SelectItem>
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredOccurrences.length === 0 && (
                <p className="text-center text-muted-foreground py-8 text-sm">Nenhuma ocorrência encontrada</p>
              )}
              {filteredOccurrences.map((o) => (
                <OccurrenceRow key={o.id} occurrence={o} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function OccurrenceRow({ occurrence: o }: { occurrence: Occurrence }) {
  const qrUrl = `${window.location.origin}/postes/${o.postExternalId}`;

  const handleDownloadQR = () => {
    const canvas = document.querySelector(`#qr-occ-${o.id} canvas`) as HTMLCanvasElement;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `QR-${o.postExternalId}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors">
      <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
        <AlertTriangle className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm text-foreground">{o.protocol}</span>
          <StatusBadge status={o.status} />
          <PriorityBadge priority={o.priority} />
        </div>
        <p className="text-xs text-muted-foreground truncate">{o.categoryName} — {o.postExternalId} — {o.operatorName || "Sem operador"}</p>
      </div>

      {/* QR Code shortcut */}
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" variant="ghost" className="h-8 px-2 gap-1 text-primary shrink-0" title="Ver QR do Poste">
            <QrCode className="w-4 h-4" />
            <span className="hidden lg:inline text-xs">QR</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-center">Poste {o.postExternalId}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4" id={`qr-occ-${o.id}`}>
            <StatusBadge status={o.status} />
            <div className="bg-background p-4 rounded-lg border">
              <QRCodeCanvas value={qrUrl} size={180} level="H" includeMargin />
            </div>
            <p className="text-xs text-muted-foreground text-center break-all">{qrUrl}</p>
            <div className="flex gap-2 w-full">
              <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={handleDownloadQR}>
                <Download className="w-3.5 h-3.5" /> Baixar QR
              </Button>
              <Link to={`/postes/${o.postExternalId}`} className="flex-1">
                <Button size="sm" className="w-full gap-1">
                  <ExternalLink className="w-3.5 h-3.5" /> Ver Detalhes
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <span className="text-xs text-muted-foreground hidden sm:block">{new Date(o.createdAt).toLocaleDateString("pt-BR")}</span>
    </div>
  );
}
