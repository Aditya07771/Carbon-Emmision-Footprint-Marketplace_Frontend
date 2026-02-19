const footerLinks = {
  Platform: ["How It Works", "For NGOs", "Marketplace", "Verify a Credit", "Developer API"],
  Standards: ["Gold Standard", "Verra VCS", "BEE India Framework", "CORSIA", "Documentation"],
  Connect: ["About Us", "Contact", "Press Kit", "Twitter/X", "LinkedIn", "GitHub"],
};

export default function Footer() {
  return (
    <footer className="relative py-16" style={{ background: "hsl(var(--forest-dark))" }}>
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4 group">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-leaf transition-transform duration-700 group-hover:rotate-[360deg]">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20c4 0 8.5-3.5 10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M2 2s7 2 10 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="font-display text-lg font-bold text-text-light">CarbonChain</span>
            </div>
            <p className="font-accent text-sm italic text-text-light/50 mb-4">
              Carbon accountability.<br />By design. Not by promise.
            </p>
            <span className="font-mono text-[10px] text-muted-foreground bg-forest-primary/30 px-2 py-1 rounded">Built on Algorand</span>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-body text-sm font-semibold text-text-light mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="font-body text-sm text-text-light/40 hover:text-leaf transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-leaf/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-text-light/30">© 2025 CarbonChain · All rights reserved</p>
          <div className="flex items-center gap-4">
            <a href="#" className="font-body text-xs text-text-light/30 hover:text-leaf transition-colors">Privacy Policy</a>
            <a href="#" className="font-body text-xs text-text-light/30 hover:text-leaf transition-colors">Terms of Use</a>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-leaf animate-pulse" />
            <span className="font-mono text-[10px] text-muted-foreground">Algorand Mainnet · All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
