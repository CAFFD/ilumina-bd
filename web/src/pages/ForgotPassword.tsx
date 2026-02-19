import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lamp } from "lucide-react";

const ForgotPassword = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-primary">
            <Lamp className="h-8 w-8" />
            <span className="text-2xl font-bold font-heading">Zeladoria</span>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Recuperar senha</CardTitle>
            <CardDescription>
              Esta funcionalidade está temporariamente indisponível. Entre em contato com o suporte.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-muted-foreground text-center">
                 Funcionalidade em manutenção durante a migração de sistema.
             </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
                <Link to="/login">Voltar ao login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
