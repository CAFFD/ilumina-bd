import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { PublicHeader } from "@/components/PublicHeader";
import { MapView } from "@/components/MapView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { loadPostsFromXLSX, type RealPost } from "@/lib/posts-data";
import { MOCK_OCCURRENCES, STATUS_LABELS } from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";
import { QRCodeSVG } from "qrcode.react";
import { MapPin, Download, AlertTriangle, Loader2 } from "lucide-react";

const BASE_URL = "https://sistema.prefeitura.com/postes";

export default function PostDetail() {
  const { codigoPublico } = useParams<{ codigoPublico: string }>();
  const [post, setPost] = useState<RealPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPostsFromXLSX().then((posts) => {
      const found = posts.find((p) => p.idPoste === codigoPublico);
      setPost(found || null);
      setLoading(false);
    });
  }, [codigoPublico]);

  const qrUrl = `${BASE_URL}/${codigoPublico}`;

  const occurrences = MOCK_OCCURRENCES.filter(
    (o) => o.postExternalId === `P-${codigoPublico}` || o.postExternalId === codigoPublico
  );

  const handleDownloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
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
      link.download = `QR-Poste-${codigoPublico}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <PublicHeader />
        <div className="container mx-auto px-4 py-12 max-w-2xl text-center space-y-4">
          <h1 className="font-display text-2xl font-bold text-foreground">Poste não encontrado</h1>
          <p className="text-muted-foreground">O código <strong>{codigoPublico}</strong> não foi localizado.</p>
          <Button asChild><Link to="/">Voltar ao Início</Link></Button>
        </div>
      </div>
    );
  }

  const markers = [{
    id: post.idPoste,
    lat: post.latitude,
    lng: post.longitude,
    color: "#0a3d91",
    label: `Poste ${post.idPoste}`,
    popup: `<strong>Poste: ${post.idPoste}</strong><br/>IPs: ${post.ips.join(", ")}`,
  }];

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <div className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="text-center pb-2">
            <CardTitle className="font-display text-xl flex items-center justify-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              POSTE {post.idPoste}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {post.tipoLampada} — {post.potenciaW}W — IPs: {post.ips.join(", ")}
            </p>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <QRCodeSVG
                id="qr-code-svg"
                value={qrUrl}
                size={200}
                level="H"
                includeMargin
              />
            </div>
            <p className="text-xs text-muted-foreground break-all">{qrUrl}</p>
            <Button variant="outline" size="sm" onClick={handleDownloadQR}>
              <Download className="w-4 h-4 mr-1" /> Baixar QR Code
            </Button>
          </CardContent>
        </Card>

        {/* Map */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base">Localização</CardTitle>
          </CardHeader>
          <CardContent>
            <MapView
              center={[post.latitude, post.longitude]}
              zoom={17}
              markers={markers}
              height="250px"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Coordenadas: {post.latitude.toFixed(6)}, {post.longitude.toFixed(6)}
            </p>
          </CardContent>
        </Card>

        {/* Occurrences */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="font-display text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Histórico de Ocorrências ({occurrences.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {occurrences.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma ocorrência registrada para este poste.</p>
            ) : (
              <div className="space-y-2">
                {occurrences.map((o) => (
                  <div key={o.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{o.protocol}</span>
                        <StatusBadge status={o.status} />
                      </div>
                      <p className="text-xs text-muted-foreground">{o.categoryName} — {new Date(o.createdAt).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* CTA */}
        <Button asChild className="w-full" size="lg">
          <Link to={`/cidadao?poste=${post.idPoste}`}>
            Registrar Problema neste Poste
          </Link>
        </Button>
      </div>
    </div>
  );
}
