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

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-leaf/30 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-white/40 font-mono">ASA #{credit.asa_id}</p>
          <h3 className="text-lg font-semibold text-white mt-1">{credit.name}</h3>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusColors[credit.status] || statusColors.active}`}>
          {credit.status}
        </span>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-white/50">Location</span>
          <span className="text-white">{credit.location}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/50">Type</span>
          <span className="text-white">{credit.project_type}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/50">CO₂</span>
          <span className="text-leaf font-bold">{credit.co2_tonnes} tonnes</span>
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
    </div>
  );
}