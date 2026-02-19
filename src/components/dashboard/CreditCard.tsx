// src/components/dashboard/CreditCard.tsx
interface CreditCardProps {
  credit: any;
}

export default function CreditCard({ credit }: CreditCardProps) {
  const statusColors: Record<string, string> = {
    active: 'bg-green-500/10 text-green-400 border-green-500/20',
    listed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    sold: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    retired: 'bg-amber/10 text-amber border-amber/20',
  };

  // Calculate equivalent flights based on 500 tonnes = 2174 flights ratio
  const flightsEquivalent = Math.round(credit.co2_tonnes * 4.348);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-leaf/30 transition-colors flex flex-col h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-white/40 font-mono">ASA #{credit.asa_id}</p>
          <h3 className="text-lg font-semibold text-white mt-1">{credit.name}</h3>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColors[credit.status] || statusColors.active}`}>
          {credit.status ? credit.status.toUpperCase() : 'ACTIVE'}
        </span>
      </div>
      
      <div className="space-y-2 text-sm mb-5 flex-1">
        <div className="flex justify-between">
          <span className="text-white/50">Location</span>
          <span className="text-white truncate ml-4">{credit.location}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/50">Type</span>
          <span className="text-white">{credit.project_type}</span>
        </div>
        <div className="flex justify-between items-center py-1">
          <span className="text-white/50">CO₂ Volume</span>
          <span className="text-leaf font-bold text-base px-2 py-0.5 bg-leaf/10 rounded">{credit.co2_tonnes} tonnes</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/50">Vintage</span>
          <span className="text-white">{credit.vintage_year}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/50">Verifier</span>
          <span className="text-white">{credit.verifier}</span>
        </div>
      </div>

      {/* Real-world Impact Equivalent */}
      <div className="mt-auto bg-white/5 border border-white/10 rounded-lg p-3 flex items-start gap-3">
        <span className="text-xl leading-none" role="img" aria-label="flight">✈️</span>
        <p className="text-xs text-white/70 leading-relaxed">
          <span className="font-semibold text-white block mb-0.5">Real-world impact:</span>
          Equal to <span className="font-bold text-white">{flightsEquivalent.toLocaleString()}</span> passenger flights from Mumbai to Delhi.
        </p>
      </div>
    </div>
  );
}