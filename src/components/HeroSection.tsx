import { motion } from "framer-motion";
import { useCountUp } from "@/hooks/useCountUp";

const Particle = ({ delay, left, size }: { delay: number; left: string; size: number }) => (
  <div
    className="absolute opacity-0 pointer-events-none"
    style={{
      left,
      bottom: "-20px",
      width: size,
      height: size,
      animation: `particle-float ${15 + Math.random() * 10}s linear ${delay}s infinite`,
    }}
  >
    <svg viewBox="0 0 24 24" fill="hsl(var(--leaf-green))" opacity="0.4" width={size} height={size}>
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20c4 0 8.5-3.5 10-10" />
    </svg>
  </div>
);

function LiveStats() {
  const credits = useCountUp(247831, 2500, false);
  const co2 = useCountUp(89420, 2500, false);
  const projects = useCountUp(34, 1500, false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateY: -8 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ delay: 0.8, duration: 0.8 }}
      className="glass-card p-6 max-w-sm w-full green-glow"
    >
      <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-4">Live Network Stats</p>
      <div className="space-y-4">
        <div>
          <p className="stat-number text-3xl" ref={credits.ref as React.Ref<HTMLParagraphElement>}>{credits.count.toLocaleString()}</p>
          <p className="font-body text-xs text-muted-foreground">Credits Minted</p>
        </div>
        <div>
          <p className="stat-number text-3xl">{co2.count.toLocaleString()}t</p>
          <p className="font-body text-xs text-muted-foreground">CO₂ Retired</p>
        </div>
        <div>
          <p className="stat-number text-3xl">{projects.count}</p>
          <p className="font-body text-xs text-muted-foreground">Active Projects</p>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-leaf/10 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-leaf animate-pulse" />
        <span className="font-mono text-[10px] text-muted-foreground">ALGORAND MAINNET · LIVE</span>
      </div>
    </motion.div>
  );
}

export default function HeroSection() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    delay: i * 0.5,
    left: `${Math.random() * 100}%`,
    size: 8 + Math.random() * 12,
  }));

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden grain-overlay" style={{ background: "hsl(var(--forest-dark))" }}>
      {/* Blobs */}
      <div className="absolute top-20 -left-32 w-[500px] h-[500px] rounded-full blob opacity-[0.07]" style={{ background: "hsl(var(--leaf-green))", filter: "blur(100px)" }} />
      <div className="absolute bottom-20 right-10 w-[400px] h-[400px] rounded-full blob opacity-[0.05]" style={{ background: "hsl(var(--leaf-green))", filter: "blur(120px)", animationDelay: "4s" }} />
      <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full blob opacity-[0.04]" style={{ background: "hsl(var(--amber-gold))", filter: "blur(100px)", animationDelay: "8s" }} />

      {/* Particles */}
      {particles.map((p, i) => (
        <Particle key={i} {...p} />
      ))}

      <div className="container mx-auto px-6 pt-28 pb-20 relative z-10">
        <div className="grid lg:grid-cols-5 gap-12 items-center">
          {/* Left */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber/30 mb-8"
            >
              <span className="text-sm">🌍</span>
              <span className="font-mono text-xs tracking-wider text-amber uppercase">Carbon Credit Marketplace</span>
            </motion.div>

            <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.1] text-text-light mb-6">
              {["Turn Climate", "Promises Into"].map((word, i) => (
                <motion.span
                  key={i}
                  className="block"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.15, duration: 0.6 }}
                >
                  {word}
                </motion.span>
              ))}
              <motion.span
                className="block italic text-leaf"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                Verifiable Truth.
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="font-body text-lg text-text-light/70 max-w-xl mb-8 leading-relaxed"
            >
              A blockchain-powered marketplace where every carbon credit is born verified, traded transparently, and retired permanently — built for NGOs that refuse to greenwash.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="flex flex-wrap gap-4 items-center"
            >
              <a href="#for-ngos" className="group px-6 py-3 rounded-full bg-leaf text-forest-dark font-body font-semibold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                List Your Project <span className="transition-transform group-hover:translate-x-1">→</span>
              </a>
              <a href="#verify-credit" className="px-6 py-3 rounded-full border border-text-light/30 text-text-light font-body text-sm hover:border-leaf hover:text-leaf transition-colors">
                Verify a Credit
              </a>
              <a href="#how-it-works" className="flex items-center gap-2 text-text-light/60 hover:text-leaf font-body text-sm transition-colors">
                <span className="w-8 h-8 rounded-full border border-text-light/30 flex items-center justify-center">▶</span>
                Watch How It Works
              </a>
            </motion.div>
          </div>

          {/* Right */}
          <div className="lg:col-span-2 flex justify-center">
            <LiveStats />
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">Scroll to Explore</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--leaf-green))" strokeWidth="2" className="scroll-bounce">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.div>
      </div>
    </section>
  );
}
