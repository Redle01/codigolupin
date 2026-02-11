import { LazyMotion, domAnimation, m } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuizLandingProps {
  onStart: () => void;
  totalParticipants: number;
}

export function QuizLanding({ onStart, totalParticipants }: QuizLandingProps) {
  return (
    <LazyMotion features={domAnimation} strict>
      <div className="min-h-screen flex flex-col items-center justify-center px-5 py-8 md:px-4 md:py-8 relative">

        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-2xl mx-auto text-center"
        >
          {/* Headline */}
          <m.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="text-[22px] md:text-3xl lg:text-4xl font-bold mb-4 md:mb-5 leading-snug md:leading-tight px-2 md:px-0"
          >
            <span className="text-foreground">Por Que Mulheres Te Veem Apenas Como </span>
            <span className="text-gradient-gold">"Amigo"</span>
            <span className="text-foreground">?</span>
          </m.h1>

          {/* Subheadline */}
          <m.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-[15px] md:text-base lg:text-lg text-muted-foreground mb-8 md:mb-10 max-w-xl mx-auto leading-relaxed px-1 md:px-0"
          >
            Descubra o <span className="text-primary font-semibold">ÚNICO bloqueio</span> que está sabotando suas chances 
            com mulheres de qualidade e como se tornar extremamente magnético ao ponto delas não conseguirem resistir
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
              className="bg-gradient-gold text-primary-foreground font-bold text-[15px] md:text-lg px-5 md:px-10 py-5 md:py-6 rounded-xl shadow-gold-lg hover:shadow-gold transition-all duration-300 hover:scale-105 w-full max-w-[320px] md:w-auto md:max-w-none group"
            >
              DESCOBRIR MEU BLOQUEIO AGORA
              <ArrowRight className="w-5 h-5 md:w-5 md:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </m.div>

          {/* Value Proposition below CTA */}
          <m.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-[13px] md:text-sm text-muted-foreground mt-5 md:mt-5 italic px-4 md:px-0"
          >
            "Em menos de 2 minutos, você descobrirá exatamente por que mulheres te colocam na friendzone."
          </m.p>

          {/* Social proof */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="flex items-center justify-center gap-2 md:gap-3 mt-5 md:mt-6"
          >
            <div className="flex -space-x-2.5 md:-space-x-3 shrink-0">
              <img src="/images/avatar-1.webp" alt="" className="w-6 h-6 md:w-9 md:h-9 rounded-full border-[1.5px] md:border-2 border-background object-cover object-top" loading="lazy" />
              <img src="/images/avatar-2.webp" alt="" className="w-6 h-6 md:w-9 md:h-9 rounded-full border-[1.5px] md:border-2 border-background object-cover object-top" loading="lazy" />
              <img src="/images/avatar-3.webp" alt="" className="w-6 h-6 md:w-9 md:h-9 rounded-full border-[1.5px] md:border-2 border-background object-cover object-top" loading="lazy" />
              <img src="/images/avatar-4.webp" alt="" className="w-6 h-6 md:w-9 md:h-9 rounded-full border-[1.5px] md:border-2 border-background object-cover object-top" loading="lazy" />
            </div>
            <span className="text-[11px] md:text-sm text-muted-foreground leading-tight">
              <span className="text-primary font-semibold">
                {totalParticipants.toLocaleString("pt-BR")}
              </span>{" "}
              homens já descobriram seu bloqueio
            </span>
          </m.div>
        </m.div>
      </div>
    </LazyMotion>
  );
}
