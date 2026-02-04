import { useMemo } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: "gold" | "burgundy";
}

export function ParticleBackground() {
  const particles = useMemo<Particle[]>(() => {
    // Reduced from 8 to 5 particles for better mobile performance
    return Array.from({ length: 5 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 3,
      duration: 12 + Math.random() * 8,
      delay: Math.random() * 4,
      color: i % 3 === 0 ? "burgundy" : "gold",
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={`absolute rounded-full animate-particle-float ${
            particle.color === "gold"
              ? "bg-gold-particle"
              : "bg-burgundy-particle"
          }`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
}
