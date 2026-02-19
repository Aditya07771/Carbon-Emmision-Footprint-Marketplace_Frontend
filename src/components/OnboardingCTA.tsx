import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";

const badges = ["Gold Standard", "Verra VCS", "BEE India", "Algorand Foundation", "UNFCCC"];

export default function OnboardingCTA() {
  const { ref, inView } = useInView(0.15);

  return (
    <section ref={ref} className="relative py-24 md:py-32" style={{ background: "hsl(var(--parchment))" }}>
      {/* Leaf watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <svg width="400" height="400" viewBox="0 0 24 24" fill="hsl(var(--forest-primary))">
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20c4 0 8.5-3.5 10-10" />
          <path d="M2 2s7 2 10 9" />
        </svg>
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}>
          <p className="section-label mb-4">Ready to Join?</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-text-dark mb-4">
            Is your environmental project ready to reach global buyers?
          </h2>
          <p className="font-body text-text-dark/60 mb-12 leading-relaxed">
            We help NGOs list verified carbon projects, mint digital certificates, and access a transparent global marketplace. Free to apply. No broker required.
          </p>
        </motion.div>

        {/* Form preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="bg-cream rounded-xl p-6 md:p-8 border border-smoke/10 mb-12 max-w-lg mx-auto"
        >
          <div className="grid grid-cols-3 gap-3 mb-4">
            {["Project Name", "Project Type", "Country"].map((f) => (
              <div key={f} className="text-left">
                <p className="font-mono text-[10px] text-text-dark/40 mb-1">{f}</p>
                <div className="h-9 rounded-md bg-parchment border border-smoke/10" />
              </div>
            ))}
          </div>
          <button className="group w-full py-3 rounded-full bg-leaf text-forest-dark font-body font-semibold flex items-center justify-center gap-2 hover:gap-3 transition-all">
            Apply to List Your Project <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </motion.div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          {badges.map((b) => (
            <span key={b} className="font-mono text-xs text-text-dark/30 hover:text-text-dark/70 transition-colors cursor-default">{b}</span>
          ))}
        </div>

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          <p className="font-accent text-xl italic text-text-dark/60 mb-3 leading-relaxed">
            "For the first time, our reforestation work in Jharkhand reached verified corporate buyers without a single broker in the middle. Payment arrived in 48 hours."
          </p>
          <p className="font-mono text-xs text-text-dark/40">— Priya Nair, Green Canopy Foundation</p>
        </motion.div>
      </div>
    </section>
  );
}
