// src/components/dashboard/ListingCard.tsx
import React from 'react';

interface ListingCardProps {
  listing: any;
  onBuy: () => void;
  onCancel: () => void;
  isBuying: boolean;
  isOwner: boolean;
}

export default function ListingCard({ listing, onBuy, onCancel, isBuying, isOwner }: ListingCardProps) {
  const flightsEquivalent = Math.round(listing.co2_tonnes * 4.348);

  const truncateAddress = (addr: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : 'Unknown';

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-leaf/30 transition-colors flex flex-col h-full">
      <div className="flex-1">
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
            <span className="text-white font-semibold">{listing.co2_tonnes} tonnes</span>
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
          <div className="flex justify-between">
            <span className="text-white/50">Seller</span>
            <span className="text-white/70 font-mono text-xs">
              {truncateAddress(listing.seller_wallet)}
            </span>
          </div>
        </div>

        {/* Real-world Impact */}
        <div className="mb-4 bg-leaf/10 border border-leaf/20 rounded-lg p-3 flex items-start gap-3">
          <span className="text-xl leading-none" role="img" aria-label="flight">✈️</span>
          <p className="text-xs text-leaf/90 leading-relaxed">
            <span className="font-semibold block mb-0.5">Real-world impact:</span>
            Offsets <span className="font-bold">{flightsEquivalent.toLocaleString()}</span> flights (Mumbai-Delhi)
          </p>
        </div>
      </div>

      {isOwner ? (
        <button
          onClick={onCancel}
          className="w-full mt-auto py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/20 transition-colors"
        >
          Cancel Listing
        </button>
      ) : (
        <button
          onClick={onBuy}
          disabled={isBuying}
          className="w-full mt-auto py-2.5 rounded-lg bg-leaf text-forest-dark text-sm font-semibold hover:bg-leaf/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isBuying ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing...
            </>
          ) : (
            `Buy for ${listing.price_algo} ALGO`
          )}
        </button>
      )}
    </div>
  );
}