import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { useNavigate } from 'react-router-dom';

export default function Marketplace() {
  const [listings, setListings] = useState([]);
  const { role } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/marketplace')
      .then(res => res.json())
      .then(data => {
        if (data.success) setListings(data.data);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Carbon Credit Marketplace</h1>
        <button onClick={() => navigate('/login')} className="text-blue-600 hover:underline">
          Dashboard
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {listings.map(listing => (
          <div key={listing.id} className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-xl font-semibold mb-2">{listing.project?.name || 'Carbon Credit'}</h2>
            <p className="text-gray-600 mb-4">{listing.co2_tonnes} Tonnes CO2e</p>
            <div className="flex justify-between items-center mt-4 border-t pt-4">
              <span className="font-bold text-lg">{listing.price_algo} ALGO</span>
              {role === 'business' && (
                <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                  Buy Now
                </button>
              )}
            </div>
          </div>
        ))}
        {listings.length === 0 && <p className="col-span-3 text-center text-gray-500">No active listings.</p>}
      </div>
    </div>
  );
}