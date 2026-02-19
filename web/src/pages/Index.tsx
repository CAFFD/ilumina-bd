import { Link } from "react-router-dom";
import { MapPin, Camera, Clock, Shield, ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicHeader } from "@/components/PublicHeader";
import { motion } from "framer-motion";

const features = [
  { icon: MapPin, title: "Localização Automática", desc: "Identifique o poste mais próximo via GPS" },
  { icon: Camera, title: "Registro com Foto", desc: "Envie fotos do problema para agilizar" },
  { icon: Clock, title: "Acompanhamento", desc: "Acompanhe o status pelo número de protocolo" },
  { icon: Shield, title: "Gestão Integrada", desc: "Equipes da prefeitura recebem em tempo real" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "radial-gradient(circle at 25% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 75% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          }} />
        </div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary-foreground/15 text-primary-foreground mb-4">
                <MapPin className="w-3 h-3" /> Prefeitura de Palmital
              </span>
              <h1 className="font-display text-3xl md:text-5xl font-extrabold text-primary-foreground leading-tight mb-4">
                Plataforma de<br />Zeladoria Urbana
              </h1>
              <p className="text-primary-foreground/80 text-base md:text-lg mb-8 max-w-lg">
                Registre problemas na iluminação pública da sua cidade de forma rápida e acompanhe a resolução em tempo real.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/cidadao">
                  <Button size="lg" className="w-full sm:w-auto bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold">
                    Registrar Ocorrência <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link to="/acompanhar">
                  <Button size="lg" className="w-full sm:w-auto bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold">
                    Acompanhar Protocolo <Clock className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">Como funciona</h2>
          <p className="text-muted-foreground max-w-md mx-auto">Reporte problemas de iluminação pública em poucos passos</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-accent-foreground" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-16">
        <div className="bg-accent rounded-2xl p-8 md:p-12 text-center">
          <Phone className="w-10 h-10 text-accent-foreground mx-auto mb-4" />
          <h2 className="font-display text-xl md:text-2xl font-bold text-accent-foreground mb-2">Emergências</h2>
          <p className="text-muted-foreground mb-4">Para situações de risco imediato, entre em contato pelo telefone:</p>
          <p className="font-display text-2xl font-bold text-primary">(18) 3351-1234</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © 2026 Prefeitura Municipal de Palmital — Plataforma de Zeladoria Urbana
        </div>
      </footer>
    </div>
  );
};

export default Index;
