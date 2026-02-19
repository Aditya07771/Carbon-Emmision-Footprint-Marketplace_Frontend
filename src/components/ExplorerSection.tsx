import { motion } from "framer-motion";
import { useInView } from "@/hooks/useInView";
import { useState, useEffect } from "react";

const explorerLines = [
  "RETIREMENT RECORD #CC-RET-2025-08821",
  "─────────────────────────────────────────────",
  "Company:      Tata Consultancy Services",
  "Credits:      12,400 tonnes CO₂",
  "Project:      Sundarbans Mangrove Restoration",
  "Location:     Odisha, India · 21.9°N 86.7°E",
  "Standard:     Gold Standard · Verra VCS",
  "Retired:      14 Feb 2025 · 09:42:17 UTC",
  "Block:        #38291044",
  "Tx Hash:      0x9a2f...c841",
  "",
  "STATUS:  🔥 PERMANENTLY BURNED",
  "         Cannot be reused. Ever.",
  "",
  "[ VIEW ON ALGORAND EXPLORER ↗ ]",
];

const chips = [
  "🗞️ Journalists can audit in real-time",
  "📊 Investors verify ESG claims in 5 minutes",
  "🏛️ Regulators get instant compliance evidence",
];

export default function ExplorerSection() {
  const { ref, inView } = useInView(0.2);
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const interval = setInterval(() => {
      setVisibleLines((v) => {
        if (v >= explorerLines.length) {
          clearInterval(interval);
          return v;
        }
        return v + 1;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [inView]);

  return (
    <section id="verify-credit" ref={ref} className="relative py-24 md:py-32 grain-overlay" style={{ background: "hsl(var(--forest-dark))" }}>
      <div className="container mx-auto px-6 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}>
          <p className="section-label mb-4">Radical Transparency</p>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-text-light mb-16">
            Look up any retirement. Right now.<br className="hidden md:block" /> No login required.
          </h2>
        </motion.div>

        {/* Browser mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="max-w-3xl mx-auto"
        >
          <div className="rounded-t-xl border border-leaf/10 p-3 flex items-center gap-2" style={{ background: "hsl(var(--forest-primary))" }}>
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-destructive/60" />
              <span className="w-3 h-3 rounded-full bg-amber/60" />
              <span className="w-3 h-3 rounded-full bg-leaf/60" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-forest-dark/50 rounded-md px-3 py-1 font-mono text-xs text-muted-foreground flex items-center gap-2">
                <span>🔍</span> carbonchain.in/explorer
              </div>
            </div>
          </div>
          <div className="border border-t-0 border-leaf/10 rounded-b-xl p-6 md:p-8 font-mono text-xs md:text-sm leading-relaxed" style={{ background: "hsl(var(--forest-dark))" }}>
            {explorerLines.slice(0, visibleLines).map((line, i) => (
              <div key={i} className={`${line.includes("STATUS") || line.includes("BURNED") ? "text-amber" : line.includes("VIEW ON") ? "text-leaf" : "text-text-light/70"} ${i === visibleLines - 1 ? "cursor-blink" : ""}`}>
                {line || "\u00A0"}
              </div>
            ))}
            {visibleLines === 0 && <div className="cursor-blink text-text-light/30">&nbsp;</div>}
          </div>
        </motion.div>

        {/* Chips */}
        <div className="flex flex-wrap justify-center gap-3 mt-12">
          {chips.map((chip) => (
            <span key={chip} className="font-body text-sm text-text-light/70 bg-forest-primary/50 border border-leaf/10 px-4 py-2 rounded-full">
              {chip}
            </span>
          ))}
        </div>

        <p className="font-accent text-xl italic text-text-light/50 text-center mt-8">
          "No press releases. No trust required. Just math."
        </p>
      </div>
    </section>
  );
}
