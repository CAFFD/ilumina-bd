import { Link } from "react-router-dom";
import { MapPin, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
            <MapPin className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-display text-sm font-bold text-foreground leading-tight">Zeladoria Urbana</h1>
            <p className="text-[10px] text-muted-foreground">Prefeitura de Palmital</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link to="/cidadao" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent">
            Registrar Ocorrência
          </Link>
          <Link to="/acompanhar" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent">
            Acompanhar
          </Link>
          <Link to="/dashboard" className="ml-2">
            <Button size="sm">Acesso Interno</Button>
          </Link>
        </nav>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t bg-card p-4 space-y-2 animate-fade-in">
          <Link to="/cidadao" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-accent">
            Registrar Ocorrência
          </Link>
          <Link to="/acompanhar" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-accent">
            Acompanhar
          </Link>
          <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-accent">
            Acesso Interno
          </Link>
        </div>
      )}
    </header>
  );
}
