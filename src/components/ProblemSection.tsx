import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";

const problems = [
  {
    icon: "📄",
    stat: "90%",
    text: "of Verra's rainforest offset credits were found to be phantom credits that represent no real CO₂ reductions.",
    source: "The Guardian × Zeit · 2023",
    title: "Double Counting",
  },
  {
    icon: "♻️",
    stat: "∞",
    text: "The same credit can be quietly reused across reporting periods. No public ledger. No enforcement. Just policy — and policy fails.",
    source: "",
    title: "No Retirement Visibility",
  },
  {
    icon: "🔗",
    stat: "30+",
    text: "Separate registries — Gold Standard, Verra, ACR — operate with zero interoperability. A credit retired on one is invisible to all others.",
    source: "",
    title: "Fragmented Registries",
  },
];

export default function ProblemSection() {
  const { ref, inView } = useInView(0.15);

  return (
    <section ref={ref} className="relative py-24 md:py-32" style={{ background: "hsl(var(--parchment))" }}>
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <p className="section-label mb-4">Why This Exists</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-text-dark mb-3">
            The carbon credit system is broken by design.
          </h2>
          <p className="font-body text-text-dark/60 max-w-2xl mb-12">
            Before CarbonChain, this is what "carbon neutral" actually meant:
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 * i, duration: 0.5 }}
              className="card-hover bg-cream rounded-xl p-6 border border-smoke/10 hover:border-l-4 hover:border-l-amber"
            >
              <span className="text-3xl">{p.icon}</span>
              <p className="stat-number text-5xl mt-3 mb-2">{p.stat}</p>
              <h3 className="font-display text-lg font-bold text-text-dark mb-2">{p.title}</h3>
              <p className="font-body text-sm text-text-dark/70 leading-relaxed">{p.text}</p>
              {p.source && (
                <span className="inline-block mt-3 font-mono text-[10px] text-text-dark/40 bg-parchment px-2 py-1 rounded">{p.source}</span>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="rounded-xl p-6 md:p-8" style={{ background: "hsl(var(--forest-dark))" }}
        >
          <p className="font-accent text-lg md:text-xl italic text-text-light/80 leading-relaxed">
            "A company can claim 'carbon neutral' today. Tomorrow, that same credit offsets someone else's emissions. No one catches it. No one is lying — there's just no system."
          </p>
        </motion.div>
      </div>
    </section>
  );
}
