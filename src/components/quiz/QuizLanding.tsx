interface QuizLandingProps {
  onStart: () => void;
  totalParticipants: number;
}

export function QuizLanding({ onStart, totalParticipants }: QuizLandingProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-8 md:px-4 md:py-8 relative">

      <div className="relative z-10 max-w-2xl mx-auto text-center animate-fade-in-up">
        {/* Headline */}
        <h1
          className="text-[22px] md:text-3xl lg:text-4xl font-bold mb-4 md:mb-5 leading-snug md:leading-tight px-2 md:px-0 animate-fade-in-up"
          style={{ animationDelay: '0.15s' }}
        >
          <span className="text-foreground">Por Que Mulheres Te Veem Apenas Como </span>
          <span className="text-gradient-gold">"Amigo"</span>
          <span className="text-foreground">?</span>
        </h1>

        {/* Subheadline */}
        <p
          className="text-[15px] md:text-base lg:text-lg text-muted-foreground mb-8 md:mb-10 max-w-xl mx-auto leading-relaxed px-1 md:px-0 animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          Descubra o <span className="text-primary font-semibold">ÚNICO bloqueio</span> que está sabotando suas chances 
          com mulheres de qualidade e como se tornar extremamente magnético ao ponto delas não conseguirem resistir
        </p>

        {/* CTA Button */}
        <div
          className="animate-scale-in"
          style={{ animationDelay: '0.5s' }}
        >
          <button
            onClick={onStart}
            className="inline-flex items-center justify-center bg-gradient-gold text-primary-foreground font-bold text-[15px] md:text-lg px-5 md:px-10 py-5 md:py-6 rounded-xl shadow-gold-lg hover:shadow-gold transition-all duration-300 hover:scale-105 w-full max-w-[320px] md:w-auto md:max-w-none group"
          >
            DESCOBRIR MEU BLOQUEIO AGORA
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 group-hover:translate-x-1 transition-transform"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
        </div>

        {/* Value Proposition below CTA */}
        <p
          className="text-[13px] md:text-sm text-muted-foreground mt-5 md:mt-5 italic px-4 md:px-0 animate-fade-in"
          style={{ animationDelay: '0.6s' }}
        >
          "Em menos de 2 minutos, você descobrirá exatamente por que mulheres te colocam na friendzone."
        </p>

        {/* Social proof */}
        <div
          className="flex items-center justify-center gap-2 md:gap-3 mt-5 md:mt-6 animate-fade-in"
          style={{ animationDelay: '0.7s' }}
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
        </div>
      </div>
    </div>
  );
}
