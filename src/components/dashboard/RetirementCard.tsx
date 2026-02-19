// src/components/dashboard/RetirementCard.tsx
interface RetirementCardProps {
  retirement: any;
}

export default function RetirementCard({ retirement }: RetirementCardProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center gap-6">
      <div className="w-14 h-14 rounded-full bg-amber/10 flex items-center justify-center flex-shrink-0">
        <svg className="w-7 h-7 text-amber" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded-full bg-amber/10 text-amber text-xs font-medium">
            {retirement.certificate_id}
          </span>
        </div>
        <p className="text-white font-medium truncate">
          {retirement.company?.name || 'Unknown Company'}
        </p>
        <p className="text-white/50 text-sm">
          {retirement.project?.name || 'Project'} • {retirement.project?.verifier || 'Verified'}
        </p>
      </div>
      
      <div className="text-right flex-shrink-0">
        <p className="text-2xl font-bold text-amber">{retirement.tonnes}</p>
        <p className="text-xs text-white/40">tonnes CO₂</p>
      </div>
      
      <div className="flex gap-2">
        <a
          href={`https://gateway.pinata.cloud/ipfs/${retirement.ipfs_certificate}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          title="View Certificate"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </a>
        <a
          href={`https://testnet.algoexplorer.io/tx/${retirement.txn_hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          title="View on Blockchain"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}