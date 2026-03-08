import { memo } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResultData, bonusConfig } from "@/lib/quizConfig";
import { useMetaPixel } from "@/hooks/useMetaPixel";

interface QuizResultProps {
  result: ResultData;
  onCheckout: () => void;
}

export const QuizResult = memo(function QuizResult({ result, onCheckout }: QuizResultProps) {
  const { trackInitiateCheckout } = useMetaPixel();
  
  const { bonuses, pricing } = bonusConfig;

  const handleCheckoutClick = () => {
    trackInitiateCheckout({
      result_type: result.type,
    });
    onCheckout();
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 md:px-4 md:py-8 overflow-y-auto relative">
      <div className="flex-1 flex flex-col items-center justify-start md:justify-center max-w-3xl mx-auto w-full relative z-10">
        {/* Result reveal */}
        <div
          className="text-center mb-5 md:mb-8 animate-fade-in-up"
          style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
        >
          <h1 className="font-serif-display text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
            <span className="text-gradient-gold">{result.title}</span>
          </h1>
          <p className="text-primary/70 text-sm md:text-sm mt-2 md:mt-2">
            {result.percentage} dos homens compartilham este perfil
          </p>
        </div>

        {/* Seu Resultado */}
        <div
          className="bg-card border border-border rounded-xl md:rounded-2xl p-5 md:p-8 mb-4 md:mb-6 w-full animate-fade-in-up"
          style={{ animationDelay: '0.5s', animationFillMode: 'both' }}
        >
          <h3 className="font-serif-display text-lg md:text-xl font-bold text-primary mb-3 md:mb-4">
            📋 Seu Resultado
          </h3>
          <div className="text-foreground/90 leading-relaxed text-sm md:text-base">
            {result.result}
          </div>
        </div>

        {/* Seu Maior Potencial */}
        <div
          className="bg-card border border-border rounded-xl md:rounded-2xl p-5 md:p-8 mb-4 md:mb-6 w-full animate-fade-in-up"
          style={{ animationDelay: '0.6s', animationFillMode: 'both' }}
        >
          <h3 className="font-serif-display text-lg md:text-xl font-bold text-primary mb-3 md:mb-4">
            ✨ Seu Maior Potencial
          </h3>
          <p className="text-foreground/90 leading-relaxed text-sm md:text-base">
            {result.potential}
          </p>
        </div>

        {/* Próximo Passo */}
        <div
          className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/30 rounded-xl md:rounded-2xl p-5 md:p-8 mb-4 md:mb-6 w-full animate-fade-in-up"
          style={{ animationDelay: '0.7s', animationFillMode: 'both' }}
        >
          <h3 className="font-serif-display text-lg md:text-xl font-bold text-primary mb-3 md:mb-4">
            🎯 Próximo Passo
          </h3>
          <p className="text-foreground/90 leading-relaxed text-sm md:text-base">
            {result.nextStep}
          </p>
        </div>

        {/* Oferta Especial */}
        <div
          className="bg-card border-2 border-primary/50 rounded-xl md:rounded-2xl p-5 md:p-8 mb-5 md:mb-8 w-full animate-fade-in-up"
          style={{ animationDelay: '0.8s', animationFillMode: 'both' }}
        >
          <p className="text-muted-foreground font-medium text-center text-sm md:text-base mb-3">
            {pricing.emoji} {pricing.label}
          </p>
          <div className="flex items-baseline justify-center gap-1 mb-4">
            <span className="text-muted-foreground text-xs md:text-sm">{pricing.installments}</span>
            <span className="text-green-500 text-base md:text-lg font-semibold">{pricing.currency}</span>
            <span className="text-green-500 text-5xl md:text-6xl font-bold leading-none">{pricing.amount}</span>
            <span className="text-green-500 text-base md:text-lg font-semibold self-start mt-1">{pricing.cents}</span>
          </div>
          
          <p className="text-muted-foreground text-sm md:text-sm mb-3">Bônus Inclusos:</p>
          <ul className="space-y-2">
            <li className="text-foreground text-sm md:text-base">
              {bonuses.primary}
              {bonuses.primaryPrice && <s className="text-muted-foreground ml-1">{bonuses.primaryPrice}</s>}
            </li>
            <li className="text-foreground text-sm md:text-base">
              {bonuses.secondary}
              {bonuses.secondaryPrice && <s className="text-muted-foreground ml-1">{bonuses.secondaryPrice}</s>}
            </li>
          </ul>
        </div>

        {/* Mockup */}
        <div
          className="w-full mb-5 md:mb-8 animate-fade-in-up"
          style={{ animationDelay: '0.85s', animationFillMode: 'both' }}
        >
          <img
            src="/images/mockup-checkout.webp"
            alt="O que você vai receber"
            className="w-full max-w-md mx-auto h-auto object-contain"
            loading="lazy"
          />
        </div>

        {/* CTA */}
        <div
          className="w-full max-w-md animate-scale-in"
          style={{ animationDelay: '0.9s', animationFillMode: 'both' }}
        >
          <Button
            onClick={handleCheckoutClick}
            size="lg"
            className="w-full h-auto min-h-[3.5rem] md:min-h-[4rem] py-3 md:py-4 px-4 md:px-6 bg-gradient-green text-primary-foreground font-bold text-xs sm:text-sm md:text-lg rounded-xl shadow-green-lg hover:shadow-green transition-all duration-300 hover:scale-[1.02] group leading-tight whitespace-normal text-center"
          >
            {result.ctaText}
            <ArrowRight className="w-5 h-5 md:w-5 md:h-5 ml-2 shrink-0 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <p className="text-xs md:text-xs text-muted-foreground text-center mt-4 md:mt-4">
            🔒 Acesso imediato após confirmação • Garantia de 30 dias
          </p>
        </div>
      </div>
    </div>
  );
});
