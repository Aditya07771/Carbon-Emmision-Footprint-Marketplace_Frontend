import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import { useCountUp } from "@/hooks/useCountUp";

const tableRows = [
  { criterion: "Fee", algorand: "₹0.08", ethereum: "₹500–2000", polygon: "₹5–50" },
  { criterion: "Finality", algorand: "4 seconds", ethereum: "15 mins", polygon: "2–5 mins" },
  { criterion: "Energy", algorand: "Carbon-negative", ethereum: "Moderate", polygon: "Moderate" },
  { criterion: "Uptime", algorand: "100% since 2019", ethereum: "—", polygon: "—" },
];

export default function WhyAlgorandSection() {
  const { ref, inView } = useInView(0.15);
  const finality = useCountUp(4, 1500);
  const uptime = useCountUp(100, 1500);

  return (
    <section ref={ref} className="relative py-24 md:py-32 grain-overlay" style={{ background: "hsl(var(--forest-dark))" }}>
      <div className="container mx-auto px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}>
          <p className="section-label mb-4">The Infrastructure</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-text-light mb-16">
            We chose Algorand.<br className="hidden md:block" /> Here's the math behind that decision.
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Comparison Table */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="glass-card overflow-hidden"
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-leaf/10">
                  <th className="p-4 font-body text-xs text-muted-foreground text-left">Criterion</th>
                  <th className="p-4 font-body text-xs text-leaf text-left font-semibold">Algorand</th>
                  <th className="p-4 font-body text-xs text-muted-foreground text-left">Ethereum</th>
                  <th className="p-4 font-body text-xs text-muted-foreground text-left">Polygon</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, i) => (
                  <motion.tr
                    key={row.criterion}
                    initial={{ opacity: 0, x: -20 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="border-b border-leaf/5"
                  >
                    <td className="p-4 font-body text-sm text-text-light/70">{row.criterion}</td>
                    <td className="p-4 font-mono text-sm text-leaf font-bold border-l-2 border-leaf/20">{row.algorand}</td>
                    <td className="p-4 font-mono text-sm text-text-light/40">{row.ethereum}</td>
                    <td className="p-4 font-mono text-sm text-text-light/40">{row.polygon}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 gap-6"
          >
            {[
              { label: "Transaction Finality", value: "4s" },
              { label: "Per Transaction", value: "₹0.08" },
              { label: "Uptime Since 2019", value: "100%" },
              { label: "Unplanned Downtime", value: "0" },
            ].map((s) => (
              <div key={s.label} className="glass-card p-6 text-center">
                <p className="stat-number text-4xl mb-2" ref={finality.ref as React.Ref<HTMLParagraphElement>}>{s.value}</p>
                <p className="font-body text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom banner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.7 }}
          className="mt-12 flex items-start gap-3 p-6 rounded-xl border border-leaf/10"
        >
          <span className="text-2xl">🌿</span>
          <p className="font-accent text-base italic text-text-light/70 leading-relaxed">
            Algorand is carbon-negative. Running a carbon accountability platform on a carbon-positive chain would be a contradiction. We chose not to contradict ourselves.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
