// src/components/dashboard/ListingCard.tsx
interface ListingCardProps {
  listing: any;
  onBuy: () => void;
  onCancel: () => void;
  isBuying: boolean;
  isOwner: boolean;
}

export default function ListingCard({ listing, onBuy, onCancel, isBuying, isOwner }: ListingCardProps) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-leaf/30 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-white/40 font-mono">ASA #{listing.asa_id}</p>
          <h3 className="text-lg font-semibold text-white mt-1">
            {listing.project?.name || 'Carbon Credit'}
          </h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-leaf">{listing.price_algo}</p>
          <p className="text-xs text-white/40">ALGO</p>
        </div>
      </div>
      
      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-white/50">CO₂</span>
          <span className="text-white">{listing.co2_tonnes} tonnes</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/50">Vintage</span>
          <span className="text-white">{listing.vintage_year}</span>
        </div>
        {listing.project?.verifier && (
          <div className="flex justify-between">
            <span className="text-white/50">Verifier</span>
            <span className="text-white">{listing.project.verifier}</span>
          </div>
        )}
      </div>
      
      {isOwner ? (
        <button
          onClick={onCancel}
          className="w-full py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
        >
          Cancel Listing
        </button>
      ) : (
        <button
          onClick={onBuy}
          disabled={isBuying}
          className="w-full py-2 rounded-lg bg-leaf text-forest-dark text-sm font-medium hover:bg-leaf/90 transition-colors disabled:opacity-50"
        >
          {isBuying ? 'Processing...' : 'Buy Now'}
        </button>
      )}
    </div>
  );
}