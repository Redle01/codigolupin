import { motion } from "framer-motion";
import { Crown, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticleBackground } from "./ParticleBackground";

interface QuizLandingProps {
  onStart: () => void;
  totalParticipants: number;
}

export function QuizLanding({ onStart, totalParticipants }: QuizLandingProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-start md:justify-center px-4 py-6 md:px-4 md:py-8 relative">
      {/* Particle effects */}
      <ParticleBackground />

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 md:w-64 h-32 md:h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 md:w-96 h-48 md:h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-2xl mx-auto text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 mb-5 md:mb-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30"
        >
          <Crown className="w-8 h-8 md:w-10 md:h-10 text-primary" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="font-serif-display text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight"
        >
          <span className="text-gradient-gold">Qual é Seu Tipo de</span>
          <br />
          <span className="text-foreground">Magnetismo Masculino?</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-base md:text-lg text-muted-foreground mb-3 md:mb-4 max-w-xl mx-auto leading-relaxed"
        >
          Descubra se você tem o perfil do{" "}
          <span className="text-primary font-medium">Sedutor Aristocrata</span>,{" "}
          <span className="text-primary font-medium">Gentleman Moderno</span> ou{" "}
          <span className="text-primary font-medium">Ladrão de Corações</span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-sm md:text-sm text-muted-foreground mb-5 md:mb-8"
        >
          E receba seu plano personalizado para dominar o Carnaval 2026
        </motion.p>

        {/* Value proposition */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="bg-card/50 backdrop-blur-sm border border-border rounded-xl md:rounded-2xl p-5 md:p-6 mb-5 md:mb-8"
        >
          <p className="text-foreground/90 italic text-sm md:text-base leading-relaxed">
            "Em menos de 2 minutos, você descobrirá exatamente por que algumas mulheres 
            te veem apenas como 'amigo' e qual estratégia de sedução elegante 
            funcionará melhor com sua personalidade única."
          </p>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          <Button
            onClick={onStart}
            size="lg"
            className="bg-gradient-gold text-primary-foreground font-bold text-base md:text-lg px-6 md:px-10 py-5 md:py-6 rounded-xl shadow-gold-lg hover:shadow-gold transition-all duration-300 hover:scale-105"
          >
            <Sparkles className="w-5 h-5 md:w-5 md:h-5 mr-2" />
            DESCOBRIR MEU TIPO AGORA
          </Button>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="flex items-center justify-center gap-2 mt-5 md:mt-8 text-muted-foreground"
        >
          <Users className="w-4 h-4 md:w-4 md:h-4" />
          <span className="text-sm md:text-sm">
            <span className="text-primary font-semibold">
              {totalParticipants.toLocaleString("pt-BR")}
            </span>{" "}
            homens já descobriram seu tipo
          </span>
        </motion.div>

        {/* Time estimate */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-xs md:text-xs text-muted-foreground mt-4 md:mt-4"
        >
          ⏱️ Tempo estimado: 2 minutos
        </motion.p>
      </motion.div>
    </div>
  );
}
