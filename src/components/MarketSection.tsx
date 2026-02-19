import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import { useCountUp } from "@/hooks/useCountUp";

const drivers = [
  { icon: "🇪🇺", title: "EU CBAM", body: "Carbon border tariff live 2023. Exporters to Europe must verify embedded carbon." },
  { icon: "✈️", title: "CORSIA", body: "UN aviation offsetting scheme. Airlines need millions of verified credits." },
  { icon: "🇮🇳", title: "India BEE", body: "Domestic carbon trading scheme launched 2023. Made-in-India marketplace, extremely timely." },
  { icon: "🎯", title: "SBTi", body: "4,000+ companies with pledges. All need verified credits." },
];

export default function MarketSection() {
  const { ref, inView } = useInView(0.15);
  const market = useCountUp(2, 2000);
  const projected = useCountUp(50, 2000);
  const companies = useCountUp(4000, 2000);

  return (
    <section id="marketplace" ref={ref} className="relative py-24 md:py-32 dot-grid" style={{ background: "hsl(var(--forest-primary))" }}>
      <div className="container mx-auto px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}>
          <p className="section-label mb-4">The Opportunity</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-text-light mb-16">
            The voluntary carbon market is growing 25x by 2030.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            { val: `$${market.count}B`, label: "Market Size Today", r: market.ref },
            { val: `$${projected.count}B`, label: "Projected by 2030", r: projected.ref },
            { val: `${companies.count.toLocaleString()}+`, label: "Companies with Net-Zero Pledges", r: companies.ref },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="stat-number text-5xl md:text-6xl" ref={s.r as React.Ref<HTMLParagraphElement>}>{s.val}</p>
              <p className="font-body text-sm text-text-light/50 mt-2">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {drivers.map((d, i) => (
            <motion.div
              key={d.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 * i }}
              className="glass-card p-5 card-hover"
            >
              <span className="text-2xl">{d.icon}</span>
              <h3 className="font-display text-lg font-bold text-text-light mt-2 mb-2">{d.title}</h3>
              <p className="font-body text-sm text-text-light/60">{d.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
