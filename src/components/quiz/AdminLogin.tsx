import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Settings, LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AdminLoginProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onLogout: () => Promise<void>;
  isLoggedIn: boolean;
  isAdmin: boolean;
  userEmail?: string;
}

export function AdminLogin({
  isOpen,
  onOpenChange,
  onLogin,
  onLogout,
  isLoggedIn,
  isAdmin,
  userEmail,
}: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onLogin(email, password);
      toast.success("Login realizado com sucesso!");
      setEmail("");
      setPassword("");
      onOpenChange(false);
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Erro ao fazer login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await onLogout();
      toast.success("Logout realizado com sucesso!");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer logout");
    }
  };

  return (
    <>
      {/* Floating admin button - very discreet */}
      <button
        onClick={() => onOpenChange(true)}
        className="fixed bottom-4 right-4 p-2 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground/50 hover:text-muted-foreground transition-all opacity-30 hover:opacity-100 z-50"
        aria-label="Admin access"
      >
        <Settings className="h-4 w-4" />
      </button>

      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isLoggedIn ? "Painel Admin" : "Acesso Admin"}
            </DialogTitle>
            <DialogDescription>
              {isLoggedIn
                ? isAdmin
                  ? `Logado como ${userEmail}`
                  : `Logado como ${userEmail} (sem permissões de admin)`
                : "Faça login para acessar o painel de métricas"}
            </DialogDescription>
          </DialogHeader>

          {isLoggedIn ? (
            <div className="flex flex-col gap-4">
              {!isAdmin && (
                <p className="text-sm text-destructive">
                  Sua conta não possui permissões de administrador.
                </p>
              )}
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
