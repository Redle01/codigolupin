import { motion } from "framer-motion";
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
    return Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 4,
      duration: 15 + Math.random() * 10,
      delay: Math.random() * 5,
      color: i % 3 === 0 ? "burgundy" : "gold",
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute rounded-full ${
            particle.color === "gold"
              ? "bg-[hsl(var(--gold))]"
              : "bg-[hsl(var(--burgundy))]"
          }`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.15, 0.35, 0.15],
            y: [0, -30, -15, -40, 0],
            x: [0, 15, -10, 5, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
