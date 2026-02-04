import { LazyMotion, domAnimation, m } from "framer-motion";
import { Crown, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ParticleBackground } from "./ParticleBackground";

interface QuizLandingProps {
  onStart: () => void;
  totalParticipants: number;
}

export function QuizLanding({ onStart, totalParticipants }: QuizLandingProps) {
  return (
    <LazyMotion features={domAnimation} strict>
      <div className="min-h-screen flex flex-col items-center justify-start md:justify-center px-4 py-6 md:px-4 md:py-8 relative">
        {/* Particle effects */}
        <ParticleBackground />

        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 md:w-64 h-32 md:h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-48 md:w-96 h-48 md:h-96 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-2xl mx-auto text-center"
        >
          {/* Icon */}
          <m.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-14 h-14 md:w-18 md:h-18 mb-4 md:mb-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30"
          >
            <Crown className="w-7 h-7 md:w-9 md:h-9 text-primary" />
          </m.div>

          {/* Headline */}
          <m.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="font-serif-display text-xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-5 leading-tight"
          >
            <span className="text-foreground">Por Que Mulheres Te Veem Apenas Como </span>
            <span className="text-gradient-gold">"Amigo"</span>
            <br />
            <span className="text-foreground text-lg md:text-2xl lg:text-3xl">(Mesmo Você Sendo Um Bom Partido)?</span>
          </m.h1>

          {/* Subheadline */}
          <m.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-sm md:text-base lg:text-lg text-muted-foreground mb-6 md:mb-10 max-w-xl mx-auto leading-relaxed"
          >
            Descubra o <span className="text-primary font-semibold">ÚNICO erro</span> que está sabotando suas chances 
            com mulheres de qualidade e como se transformar no homem mais desejado do{" "}
            <span className="text-primary font-medium">Carnaval 2026</span>
          </m.p>

          {/* CTA Button */}
          <m.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.35 }}
          >
            <Button
              onClick={onStart}
              size="lg"
              className="bg-gradient-gold text-primary-foreground font-bold text-base md:text-lg px-6 md:px-10 py-5 md:py-6 rounded-xl shadow-gold-lg hover:shadow-gold transition-all duration-300 hover:scale-105"
            >
              <Sparkles className="w-5 h-5 md:w-5 md:h-5 mr-2" />
              DESCOBRIR MEU ERRO FATAL AGORA
            </Button>
          </m.div>

          {/* Subtitle below CTA */}
          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-xs md:text-sm text-muted-foreground mt-4 md:mt-5 italic"
          >
            "Apenas 2 minutos podem mudar sua vida romântica para sempre"
          </m.p>

          {/* Social proof */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="flex items-center justify-center gap-2 mt-4 md:mt-6 text-muted-foreground"
          >
            <Users className="w-4 h-4 md:w-4 md:h-4" />
            <span className="text-xs md:text-sm">
              <span className="text-primary font-semibold">
                {totalParticipants.toLocaleString("pt-BR")}
              </span>{" "}
              homens já descobriram seu erro
            </span>
          </m.div>
        </m.div>
      </div>
    </LazyMotion>
  );
}
