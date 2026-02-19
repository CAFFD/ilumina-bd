import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { MapView } from "@/components/MapView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loadPostsFromAPI, type RealPost } from "@/lib/posts-data";
import { QRCodeSVG } from "qrcode.react";
import { MapPin, Search, Download, FileDown, Loader2, QrCode, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import jsPDF from "jspdf";

const BASE_URL = "https://sistema.prefeitura.com/postes";

export default function PostesManagement() {
  const [posts, setPosts] = useState<RealPost[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPost, setSelectedPost] = useState<RealPost | null>(null);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadPostsFromAPI().then(setPosts);
  }, []);

  const filtered = posts.filter((p) =>
    p.idPoste.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.ips.some((ip) => ip.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const displayPosts = filtered.slice(0, 100);

  const postMarkers = filtered.slice(0, 500).map((p) => ({
    id: p.idPoste,
    lat: p.latitude,
    lng: p.longitude,
    color: "#0a3d91",
    popup: `<strong>Poste: ${p.idPoste}</strong><br/>IPs: ${p.ips.join(", ")}<br/>${p.tipoLampada} - ${p.potenciaW}W<br/><a href="/postes/${p.idPoste}" target="_blank">Ver detalhes →</a>`,
    label: p.idPoste,
  }));

  const handleMarkerClick = (id: string) => {
    const post = posts.find((p) => p.idPoste === id);
    if (post) {
      setSelectedPost(post);
      setQrDialogOpen(true);
    }
  };

  const handleDownloadSingleQR = () => {
    if (!selectedPost) return;
    const svg = document.getElementById("popup-qr-svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 300, 300);
      const link = document.createElement("a");
      link.download = `QR-Poste-${selectedPost.idPoste}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleExportPDF = async () => {
    setExporting(true);
    toast.info("Gerando PDF com QR Codes... Isso pode demorar alguns segundos.");

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const postsToExport = filtered.slice(0, 200); // Limit for performance
      const pageWidth = 210;
      const pageHeight = 297;
      const qrSize = 60;
      const margin = 20;

      for (let i = 0; i < postsToExport.length; i++) {
        if (i > 0) pdf.addPage();
        const post = postsToExport[i];
        const qrUrl = `${BASE_URL}/${post.idPoste}`;

        // Title
        pdf.setFontSize(16);
        pdf.setFont("helvetica", "bold");
        pdf.text("PREFEITURA DE PALMITAL", pageWidth / 2, margin, { align: "center" });
        pdf.setFontSize(12);
        pdf.text("Zeladoria Urbana", pageWidth / 2, margin + 8, { align: "center" });

        // Post info
        pdf.setFontSize(20);
        pdf.setFont("helvetica", "bold");
        pdf.text(`POSTE ${post.idPoste}`, pageWidth / 2, margin + 30, { align: "center" });

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");
        pdf.text(`IPs: ${post.ips.join(", ")}`, pageWidth / 2, margin + 38, { align: "center" });
        pdf.text(`${post.tipoLampada} — ${post.potenciaW}W`, pageWidth / 2, margin + 44, { align: "center" });
        pdf.text(`Lat: ${post.latitude.toFixed(6)} | Lng: ${post.longitude.toFixed(6)}`, pageWidth / 2, margin + 50, { align: "center" });

        // QR Code - render as canvas
        const canvas = document.createElement("canvas");
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, 300, 300);
        }

        // Create temporary QR SVG
        const tempDiv = document.createElement("div");
        tempDiv.style.position = "absolute";
        tempDiv.style.left = "-9999px";
        document.body.appendChild(tempDiv);

        const { createRoot } = await import("react-dom/client");
        const { createElement } = await import("react");
        const { QRCodeSVG: QR } = await import("qrcode.react");
        
        const root = createRoot(tempDiv);
        root.render(createElement(QR, { value: qrUrl, size: 280, level: "H", includeMargin: true }));
        
        await new Promise((r) => setTimeout(r, 100));
        
        const svgEl = tempDiv.querySelector("svg");
        if (svgEl && ctx) {
          const svgData = new XMLSerializer().serializeToString(svgEl);
          const img = new Image();
          await new Promise<void>((resolve) => {
            img.onload = () => {
              ctx.drawImage(img, 0, 0, 300, 300);
              resolve();
            };
            img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
          });
          
          const imgData = canvas.toDataURL("image/png");
          const qrX = (pageWidth - qrSize) / 2;
          pdf.addImage(imgData, "PNG", qrX, margin + 60, qrSize, qrSize);
        }

        root.unmount();
        document.body.removeChild(tempDiv);

        // URL below QR
        pdf.setFontSize(8);
        pdf.text(qrUrl, pageWidth / 2, margin + 60 + qrSize + 8, { align: "center" });

        // Footer
        pdf.setFontSize(8);
        pdf.setTextColor(150);
        pdf.text(`Página ${i + 1} de ${postsToExport.length}`, pageWidth / 2, pageHeight - 10, { align: "center" });
        pdf.setTextColor(0);
      }

      pdf.save("QRCodes-Postes-Palmital.pdf");
      toast.success(`PDF gerado com ${postsToExport.length} QR Codes!`);
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Erro ao gerar PDF");
    } finally {
      setExporting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Gestão de Postes</h1>
            <p className="text-sm text-muted-foreground">{posts.length} postes carregados — Clique no marcador para ver o QR Code</p>
          </div>
          <Button onClick={handleExportPDF} disabled={exporting}>
            {exporting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <FileDown className="w-4 h-4 mr-1" />}
            Exportar QR Codes (PDF)
          </Button>
        </div>

        {/* Map */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> Mapa de Postes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MapView
              markers={postMarkers}
              height="400px"
              zoom={14}
              enableClustering
              onMarkerClick={handleMarkerClick}
            />
          </CardContent>
        </Card>

        {/* List */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <CardTitle className="font-display text-base flex items-center gap-2">
                <QrCode className="w-4 h-4 text-primary" /> Lista de Postes
              </CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar ID_POSTE ou ID_IP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">
              Exibindo {displayPosts.length} de {filtered.length} postes
              {searchTerm && ` (filtro: "${searchTerm}")`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {displayPosts.map((p) => (
                <div
                  key={p.idPoste}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => { setSelectedPost(p); setQrDialogOpen(true); }}
                >
                  <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center shrink-0">
                    <QrCode className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground">Poste {p.idPoste}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {p.ips.length} IP(s) — {p.tipoLampada} — {p.potenciaW}W
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-center">
              POSTE {selectedPost?.idPoste}
            </DialogTitle>
          </DialogHeader>
          {selectedPost && (
            <div className="flex flex-col items-center gap-4 py-4">
              <p className="text-sm text-muted-foreground">
                {selectedPost.tipoLampada} — {selectedPost.potenciaW}W
              </p>
              <p className="text-xs text-muted-foreground">
                IPs: {selectedPost.ips.join(", ")}
              </p>
              
              <div className="bg-white p-4 rounded-lg border">
                <QRCodeSVG
                  id="popup-qr-svg"
                  value={`${BASE_URL}/${selectedPost.idPoste}`}
                  size={200}
                  level="H"
                  includeMargin
                />
              </div>
              
              <p className="text-xs text-muted-foreground break-all">
                {BASE_URL}/{selectedPost.idPoste}
              </p>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleDownloadSingleQR}>
                  <Download className="w-4 h-4 mr-1" /> Baixar QR
                </Button>
                <Button size="sm" asChild>
                  <a href={`/postes/${selectedPost.idPoste}`} target="_blank" rel="noopener">
                    Ver Detalhes
                  </a>
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
