import { useState, memo } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { Lock, Mail, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EmailCaptureProps {
  email: string;
  onEmailChange: (email: string) => void;
  onSubmit: () => Promise<boolean>;
  onContinue: () => void;
  isSubmitting: boolean;
}

export const EmailCapture = memo(function EmailCapture({
  email,
  onEmailChange,
  onSubmit,
  onContinue,
  isSubmitting,
}: EmailCaptureProps) {
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Por favor, insira seu email");
      return;
    }

    if (!validateEmail(email)) {
      setError("Por favor, insira um email válido");
      return;
    }

    const success = await onSubmit();
    if (success) {
      onContinue();
    }
  };

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="min-h-screen flex flex-col items-center justify-start md:justify-center px-4 py-6 md:px-4 md:py-8">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg mx-auto w-full"
        >
          {/* Lock icon */}
          <m.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-5 md:mb-6"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-16 md:h-16 rounded-full bg-primary/20 border border-primary/30">
              <Lock className="w-8 h-8 md:w-8 md:h-8 text-primary" />
            </div>
          </m.div>

          {/* Title */}
          <h2 className="font-serif-display text-2xl md:text-3xl font-bold text-center mb-4 md:mb-4">
            <span className="text-gradient-gold">RECEBA SEU DIAGNÓSTICO</span>
            <br />
            <span className="text-foreground">+ ACESSO EXCLUSIVO</span>
          </h2>

          <p className="text-center text-muted-foreground mb-5 md:mb-8 text-base md:text-base leading-relaxed px-2">
            Descubra seu perfil e ganhe acesso exclusivo ao método que transformou homens em ímãs de atração feminina
          </p>

          {/* Email form */}
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Seu melhor email aqui..."
                value={email}
                onChange={(e) => {
                  onEmailChange(e.target.value);
                  setError("");
                }}
                className="pl-10 md:pl-12 h-12 md:h-14 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary text-sm md:text-base"
              />
            </div>

            {error && (
              <m.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-destructive text-xs md:text-sm text-center"
              >
                {error}
              </m.p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 md:h-14 bg-gradient-green text-primary-foreground font-bold text-base md:text-lg rounded-xl shadow-green-lg hover:shadow-green transition-all duration-300 hover:scale-[1.02]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 md:w-5 md:h-5 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 md:w-5 md:h-5 mr-2" />
                  DESCOBRIR MEU PERFIL AGORA
                </>
              )}
            </Button>
          </form>

          {/* Privacy note */}
          <p className="text-xs md:text-xs text-muted-foreground text-center mt-5 md:mt-6">
            🔒 Seus dados estão seguros. Nunca compartilhamos seu email.
          </p>
        </m.div>
      </div>
    </LazyMotion>
  );
});
