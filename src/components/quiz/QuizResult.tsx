import { motion } from "framer-motion";
import { Crown, Brain, Gem, Shield, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResultType, ResultData } from "@/lib/quizConfig";
import { ParticleBackground } from "./ParticleBackground";

interface QuizResultProps {
  result: ResultData;
  onCheckout: () => void;
}

const iconMap: Record<ResultType, React.ReactNode> = {
  gentleman: <Crown className="w-12 h-12" />,
  estrategista: <Brain className="w-12 h-12" />,
  diamante: <Gem className="w-12 h-12" />,
  guerreiro: <Shield className="w-12 h-12" />,
};

export function QuizResult({ result, onCheckout }: QuizResultProps) {
  return (
    <div className="min-h-screen flex flex-col px-4 py-6 md:px-4 md:py-8 overflow-y-auto relative">
      {/* Particle effects */}
      <ParticleBackground />

      <div className="flex-1 flex flex-col items-center justify-start md:justify-center max-w-3xl mx-auto w-full relative z-10">
        {/* Celebration animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="relative mb-5 md:mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/50">
            <span className="text-primary [&>svg]:w-10 [&>svg]:h-10 md:[&>svg]:w-12 md:[&>svg]:h-12">{iconMap[result.type]}</span>
          </div>
          
          {/* Sparkle effects */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute -top-1 -right-1 md:-top-2 md:-right-2"
          >
            <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary animate-pulse" />
          </motion.div>
        </motion.div>

        {/* Result reveal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center mb-5 md:mb-8"
        >
          <p className="text-primary text-xs md:text-sm font-medium mb-2 md:mb-2 uppercase tracking-wider">
            Seu Tipo de Magnetismo
          </p>
          <h1 className="font-serif-display text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
            <span className="text-gradient-gold">{result.title}</span>
          </h1>
          <p className="text-muted-foreground text-base md:text-lg">
            {result.subtitle}
          </p>
          <p className="text-primary/70 text-sm md:text-sm mt-2 md:mt-2">
            {result.percentage} dos homens compartilham este perfil
          </p>
        </motion.div>

        {/* Diagnosis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="bg-card/50 backdrop-blur-sm border border-border rounded-xl md:rounded-2xl p-5 md:p-8 mb-4 md:mb-6 w-full"
        >
          <h3 className="font-serif-display text-lg md:text-xl font-bold text-primary mb-3 md:mb-4">
            📋 Seu Diagnóstico Personalizado
          </h3>
          <div className="text-foreground/90 leading-relaxed whitespace-pre-line text-sm md:text-base">
            {result.diagnosis}
          </div>
        </motion.div>

        {/* Transformation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/30 rounded-xl md:rounded-2xl p-5 md:p-8 mb-5 md:mb-8 w-full"
        >
          <h3 className="font-serif-display text-lg md:text-xl font-bold text-primary mb-3 md:mb-4">
            🎯 Sua Transformação Específica
          </h3>
          <p className="text-foreground/90 leading-relaxed text-sm md:text-base">
            {result.transformation}
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, duration: 0.4 }}
          className="w-full max-w-md"
        >
        <Button
            onClick={onCheckout}
            size="lg"
            className="w-full h-14 md:h-16 bg-gradient-gold text-primary-foreground font-bold text-base md:text-lg rounded-xl shadow-gold-lg hover:shadow-gold transition-all duration-300 hover:scale-[1.02] group"
          >
            {result.ctaText}
            <ArrowRight className="w-5 h-5 md:w-5 md:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <p className="text-xs md:text-xs text-muted-foreground text-center mt-4 md:mt-4">
            🔒 Acesso imediato após confirmação • Garantia de 7 dias
          </p>
        </motion.div>
      </div>
    </div>
  );
}
