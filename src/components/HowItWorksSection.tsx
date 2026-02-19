import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";

const steps = [
  {
    num: "01",
    emoji: "🌱",
    title: "Credit Issuance",
    subtitle: "BIRTH",
    body: "A verified environmental project completes third-party MRV. Our platform mints a unique digital certificate on Algorand — encoding project ID, GPS coordinates, vintage year, CO₂ quantity, and the auditor's cryptographic signature.",
    token: "TOKEN: CC-2024-IN-WIND-00423",
    hash: "HASH: 0x7f3a...b92e",
  },
  {
    num: "02",
    emoji: "🔄",
    title: "Marketplace Settlement",
    subtitle: "TRADING",
    body: "Buyers purchase credits like any e-commerce platform. Smart contracts execute atomically — payment releases to the project developer and the token transfers to the buyer simultaneously. No middleman. 4-second finality.",
    badge: "⚡ 4 SECONDS · ₹0.08 FEE",
  },
  {
    num: "03",
    emoji: "🗂️",
    title: "Portfolio & Registry",
    subtitle: "HOLDING",
    body: "Credits sit in the buyer's verified wallet, visible on their compliance dashboard. Every secondary transfer is publicly logged on-chain. Movement without a permanent record is mathematically impossible.",
  },
  {
    num: "04",
    emoji: "🔥",
    title: "Permanent Destruction",
    subtitle: "RETIREMENT",
    body: "When a company retires a credit, a smart contract calls the burn function — the token is permanently removed from existence. A timestamped public retirement certificate links to the company's identity forever.",
    status: "BURNED · IRREVERSIBLE · PUBLIC",
  },
];

export default function HowItWorksSection() {
  const { ref, inView } = useInView(0.1);

  return (
    <section id="how-it-works" ref={ref} className="relative py-24 md:py-32 overflow-hidden dot-grid" style={{ background: "hsl(var(--forest-primary))" }}>
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
        >
          <p className="section-label mb-4">The Lifecycle</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-text-light mb-16">
            Every credit. Fully traceable.<br className="hidden md:block" /> From birth to permanent retirement.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 * i, duration: 0.5 }}
              className="glass-card p-6 card-hover relative"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="font-mono text-xs text-amber">{step.num}</span>
                <span className="text-xs font-mono tracking-wider text-muted-foreground uppercase">{step.subtitle}</span>
              </div>
              <span className="text-3xl">{step.emoji}</span>
              <h3 className="font-display text-xl font-bold text-text-light mt-3 mb-3">{step.title}</h3>
              <p className="font-body text-sm text-text-light/60 leading-relaxed mb-4">{step.body}</p>
              {step.token && (
                <div className="font-mono text-[10px] text-leaf/80 bg-forest-dark/50 rounded p-2 space-y-1">
                  <p>{step.token}</p>
                  <p className="cursor-blink">{step.hash}</p>
                </div>
              )}
              {step.badge && (
                <span className="inline-block font-mono text-[10px] text-amber bg-amber/10 px-2 py-1 rounded">{step.badge}</span>
              )}
              {step.status && (
                <span className="inline-block font-mono text-[10px] text-leaf bg-leaf/10 px-2 py-1 rounded animate-pulse">{step.status}</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
