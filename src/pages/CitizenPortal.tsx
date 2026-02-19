import { useState, useEffect, useCallback } from "react";
import { PublicHeader } from "@/components/PublicHeader";
import { MapView } from "@/components/MapView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { loadPostsFromXLSX, type RealPost } from "@/lib/posts-data";
import { haversineDistance } from "@/lib/mock-data";
import { MapPin, Loader2, CheckCircle, Navigation, LocateFixed, Phone, AlertTriangle, Wrench } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const NEARBY_RADIUS_M = 100;
const EXPANDED_RADIUS_M = 300;
const AUTO_SELECT_RADIUS_M = 30;

type Step = "locate" | "confirm" | "success";

export default function CitizenPortal() {
  const [step, setStep] = useState<Step>("locate");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedPost, setSelectedPost] = useState<RealPost | null>(null);
  const [nearestPost, setNearestPost] = useState<RealPost | null>(null);
  const [locating, setLocating] = useState(false);
  const [manualId, setManualId] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [protocol, setProtocol] = useState("");
  const [posts, setPosts] = useState<RealPost[]>([]);
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [activeRadius, setActiveRadius] = useState(NEARBY_RADIUS_M);

  useEffect(() => {
    loadPostsFromXLSX().then(setPosts);
  }, []);

  const findNearest = useCallback((lat: number, lng: number, postList: RealPost[]): RealPost | null => {
    let nearest: RealPost | null = null;
    let minDist = Infinity;
    for (const post of postList) {
      const d = haversineDistance(lat, lng, post.latitude, post.longitude);
      if (d < minDist) {
        minDist = d;
        nearest = post;
      }
    }
    return nearest;
  }, []);

  const getNearbyPosts = useCallback((lat: number, lng: number, postList: RealPost[], radius = NEARBY_RADIUS_M) => {
    return postList
      .map((p) => ({ post: p, distance: haversineDistance(lat, lng, p.latitude, p.longitude) }))
      .filter((item) => item.distance <= radius)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10);
  }, []);

  const getLocation = useCallback(() => {
    setLocating(true);
    if (!navigator.geolocation) {
      toast.error("Geolocalização não suportada neste navegador");
      setLocating(false);
      setUserLocation([-22.786, -50.205]);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(loc);
        if (posts.length > 0) {
          const nearest = findNearest(loc[0], loc[1], posts);
          setNearestPost(nearest);
          let nearby = getNearbyPosts(loc[0], loc[1], posts, NEARBY_RADIUS_M);
          if (nearby.length === 0) {
            toast.info("Nenhum poste encontrado próximo. Aumentando raio de busca...");
            setActiveRadius(EXPANDED_RADIUS_M);
            nearby = getNearbyPosts(loc[0], loc[1], posts, EXPANDED_RADIUS_M);
          } else {
            setActiveRadius(NEARBY_RADIUS_M);
          }
          const veryClose = nearby.filter((n) => n.distance <= AUTO_SELECT_RADIUS_M);
          if (veryClose.length === 1) {
            setSelectedPost(veryClose[0].post);
            toast.success("Poste identificado automaticamente com base na sua localização.");
          } else if (nearest) {
            setSelectedPost(nearest);
          }
        }
        setLocating(false);
      },
      () => {
        toast.info("Não foi possível acessar sua localização. Selecione o poste manualmente no mapa.");
        const fallback: [number, number] = [-22.786, -50.205];
        setUserLocation(fallback);
        if (posts.length > 0) {
          const nearest = findNearest(fallback[0], fallback[1], posts);
          setNearestPost(nearest);
          setSelectedPost(nearest);
        }
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [posts, findNearest, getNearbyPosts]);

  useEffect(() => {
    if (posts.length > 0) {
      getLocation();
    }
  }, [posts.length]);

  const handleManualSelect = () => {
    const post = posts.find((p) => p.idPoste === manualId.trim());
    if (post) {
      setSelectedPost(post);
      toast.success(`Poste ${post.idPoste} selecionado`);
    } else {
      toast.error("Poste não encontrado. Digite o ID_POSTE correto.");
    }
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handleSubmit = () => {
    if (!selectedPost) {
      toast.error("Selecione um poste");
      return;
    }
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      toast.error("Informe um número de WhatsApp/telefone válido");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const proto = `ZU-2026-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
      setProtocol(proto);
      setStep("success");
      setSubmitting(false);
    }, 1500);
  };

  const nearbyWithDist = userLocation ? getNearbyPosts(userLocation[0], userLocation[1], posts, activeRadius) : [];
  const nearbyIds = new Set(nearbyWithDist.map((n) => n.post.idPoste));
  const distMap = new Map(nearbyWithDist.map((n) => [n.post.idPoste, Math.round(n.distance)]));
  const visiblePosts = showAllPosts ? posts : nearbyWithDist.map((n) => n.post);

  const markers = [
    ...(userLocation
      ? [{
          id: "__user__",
          lat: userLocation[0],
          lng: userLocation[1],
          label: "Você está aqui",
          popup: "<strong>📍 Sua Localização</strong>",
          color: "#3b82f6",
        }]
      : []),
    ...visiblePosts.map((p) => {
      const dist = distMap.get(p.idPoste);
      const isNearby = nearbyIds.has(p.idPoste);
      return {
        id: p.idPoste,
        lat: p.latitude,
        lng: p.longitude,
        label: `P:${p.idPoste}${dist != null ? ` (${dist}m)` : ""}`,
        popup: `<strong>Poste: ${p.idPoste}</strong><br/>IPs: ${p.ips.join(", ")}${dist != null ? `<br/>📍 Distância: ${dist}m` : ""}`,
        color: p.idPoste === selectedPost?.idPoste ? "#ef4444" : isNearby ? "#22c55e" : "#0a3d91",
      };
    }),
  ];

  const mapZoom = showAllPosts ? 15 : 18;

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <AnimatePresence mode="wait">
          {/* STEP 1: Locate post */}
          {step === "locate" && (
            <motion.div key="locate" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Navigation className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-display text-lg font-bold text-foreground">Localizar Poste</h2>
                      <p className="text-xs text-muted-foreground">Toque no poste mais próximo ou use o GPS</p>
                    </div>
                  </div>

                  {locating || posts.length === 0 ? (
                    <div className="flex items-center justify-center py-12 text-muted-foreground">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" /> {posts.length === 0 ? "Carregando postes..." : "Obtendo localização..."}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {showAllPosts
                            ? `${posts.length} postes visíveis`
                            : `${nearbyWithDist.length} postes dentro de ${activeRadius}m`}
                        </span>
                        <Button
                          size="sm"
                          variant={showAllPosts ? "default" : "outline"}
                          className="text-xs h-7 gap-1"
                          onClick={() => setShowAllPosts(!showAllPosts)}
                        >
                          <MapPin className="w-3 h-3" />
                          {showAllPosts ? "Apenas próximos" : "Mostrar todos"}
                        </Button>
                      </div>
                      <MapView
                        center={userLocation || [-22.786, -50.205]}
                        zoom={mapZoom}
                        markers={markers}
                        highlightId={selectedPost?.idPoste}
                        circle={!showAllPosts && userLocation ? { center: userLocation, radius: activeRadius } : undefined}
                        onMarkerClick={(id) => {
                          if (id === "__user__") return;
                          const post = posts.find((p) => p.idPoste === id);
                          if (post) {
                            setSelectedPost(post);
                            const dist = distMap.get(post.idPoste);
                            toast.success(`Poste ${post.idPoste} selecionado${dist != null ? ` — ${dist}m de você` : ""}`);
                          }
                        }}
                        height="350px"
                        enableClustering={showAllPosts}
                      />

                      {nearbyWithDist.length > 0 && (
                        <div className="bg-accent rounded-lg p-3 space-y-1">
                          <div className="flex items-center gap-2 text-sm font-medium text-accent-foreground">
                            <LocateFixed className="w-4 h-4 text-primary" />
                            Postes próximos ({nearbyWithDist.length})
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {nearbyWithDist.map((n) => (
                              <button
                                key={n.post.idPoste}
                                onClick={() => { setSelectedPost(n.post); toast.success(`Poste ${n.post.idPoste} selecionado — ${Math.round(n.distance)}m`); }}
                                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                                  selectedPost?.idPoste === n.post.idPoste
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background hover:bg-accent border-border"
                                }`}
                              >
                                {n.post.idPoste} — {Math.round(n.distance)}m
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedPost && (
                        <div className="bg-success/10 rounded-lg p-3 text-sm flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span>Selecionado: <strong>Poste {selectedPost.idPoste}</strong></span>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Input
                          placeholder="Ou digite o ID_POSTE (ex: 5454769)"
                          value={manualId}
                          onChange={(e) => setManualId(e.target.value)}
                          className="flex-1"
                        />
                        <Button variant="secondary" onClick={handleManualSelect}>Buscar</Button>
                      </div>
                      <Button className="w-full" disabled={!selectedPost} onClick={() => setStep("confirm")}>
                        Confirmar Poste e Continuar
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* STEP 2: Confirm + phone — ZERO FRICTION */}
          {step === "confirm" && selectedPost && (
            <motion.div key="confirm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card className="overflow-hidden">
                <CardContent className="pt-6 space-y-5">
                  {/* Problem type — fixed */}
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                    <div className="w-12 h-12 rounded-full bg-destructive/15 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-6 h-6 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-destructive">LÂMPADA QUEIMADA</p>
                      <p className="text-xs text-muted-foreground">Relatar lâmpada queimada neste poste?</p>
                    </div>
                  </div>

                  {/* Post info */}
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-accent border border-border">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground">Poste {selectedPost.idPoste}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        IPs: {selectedPost.ips.join(', ')}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs shrink-0" onClick={() => setStep("locate")}>
                      Alterar
                    </Button>
                  </div>

                  {/* Phone input */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-sm font-semibold">
                      <Phone className="w-4 h-4 text-primary" />
                      Seu WhatsApp / Telefone *
                    </Label>
                    <Input
                      placeholder="(18) 99999-0000"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      className="text-lg h-12"
                      type="tel"
                      inputMode="tel"
                    />
                    <p className="text-xs text-muted-foreground">Usaremos para informar quando o técnico resolver.</p>
                  </div>

                  {/* CTA — giant button */}
                  <Button
                    className="w-full h-16 text-lg font-bold gap-3 rounded-xl"
                    onClick={handleSubmit}
                    disabled={submitting}
                    size="lg"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Wrench className="w-6 h-6" />
                        CHAMAR TÉCNICO
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* STEP 3: Success */}
          {step === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="text-center">
                <CardContent className="py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-success" />
                  </div>
                  <h2 className="font-display text-xl font-bold text-foreground">Chamado Registrado!</h2>
                  <p className="text-muted-foreground">Seu protocolo de acompanhamento:</p>
                  <div className="bg-accent rounded-lg p-4 inline-block">
                    <span className="font-display text-2xl font-bold text-primary">{protocol}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enviaremos uma mensagem no seu WhatsApp quando o técnico resolver.
                  </p>
                  <div className="flex gap-3 justify-center pt-4">
                    <Button variant="outline" onClick={() => { setStep("locate"); setSelectedPost(null); setPhone(""); }}>
                      Novo Chamado
                    </Button>
                    <Button asChild>
                      <a href={`/acompanhar?protocolo=${protocol}`}>Acompanhar</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
