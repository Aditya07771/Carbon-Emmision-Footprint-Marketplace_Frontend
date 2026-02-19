import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";

const features = [
  {
    icon: "🌐",
    title: "Direct Market Access",
    body: "List your reforestation, solar, wind, or biogas project and reach verified corporate buyers across India and globally. No broker. No gatekeeping.",
    tag: "🌐 GLOBAL REACH",
  },
  {
    icon: "⚡",
    title: "Instant Transparent Payment",
    body: "Smart contracts release payment the moment a credit is purchased. No NET-30 invoices. No waiting for intermediaries. Funds flow directly to your project wallet in seconds.",
    tag: "⚡ INSTANT SETTLEMENT",
  },
  {
    icon: "🔍",
    title: "Publicly Verified Impact",
    body: "Every tonne your project captures is permanently recorded on a public ledger. Your impact is verifiable by any investor, regulator, or journalist — without trusting a press release.",
    tag: "🔍 AUDITABLE FOREVER",
  },
];

const processSteps = ["Apply", "Verification", "Mint & List"];

export default function ForNGOsSection() {
  const { ref, inView } = useInView(0.15);

  return (
    <section id="for-ngos" ref={ref} className="relative py-24 md:py-32" style={{ background: "hsl(var(--parchment))" }}>
      <div className="container mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}>
          <p className="section-label mb-4">Built for Organizations Like Yours</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-text-dark mb-3">
            From field project to verified credit — without the middlemen.
          </h2>
          <p className="font-body text-text-dark/60 max-w-2xl mb-12">
            We built CarbonChain specifically so that NGOs and environmental developers can access global carbon markets directly.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 * i }}
              className="card-hover bg-cream rounded-xl p-6 border-t-4 border-t-leaf"
            >
              <span className="text-3xl">{f.icon}</span>
              <h3 className="font-display text-xl font-bold text-text-dark mt-3 mb-3">{f.title}</h3>
              <p className="font-body text-sm text-text-dark/70 leading-relaxed mb-4">{f.body}</p>
              <span className="font-mono text-[10px] tracking-wider text-leaf bg-leaf/10 px-2 py-1 rounded">{f.tag}</span>
            </motion.div>
          ))}
        </div>

        {/* Process */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
        >
          {processSteps.map((step, i) => (
            <div key={step} className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-leaf text-forest-dark font-mono text-sm font-bold flex items-center justify-center">{i + 1}</span>
                <span className="font-body font-medium text-text-dark">{step}</span>
              </div>
              {i < processSteps.length - 1 && (
                <span className="hidden sm:block w-12 border-t-2 border-dashed border-leaf/30" />
              )}
            </div>
          ))}
        </motion.div>

        <div className="text-center">
          <a href="#" className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-leaf text-forest-dark font-body font-semibold hover:gap-3 transition-all">
            Apply to List Your Project <span className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
