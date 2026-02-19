import React, { useState } from 'react';

export default function Verify() {
  const [assetId, setAssetId] = useState('');

  const handleVerify = (e) => {
    e.preventDefault();
    alert(`Checking Algorand Indexer for retirement status of Asset ID: ${assetId}`);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 text-center">
      <h1 className="text-3xl font-bold mb-4">Verify Carbon Retirement</h1>
      <p className="text-gray-600 mb-8">Enter the Asset ID to verify its public burn status on the blockchain.</p>
      
      <form onSubmit={handleVerify} className="flex justify-center gap-4">
        <input 
          type="text" 
          placeholder="Enter ASA ID" 
          className="border p-3 rounded-lg w-64"
          value={assetId}
          onChange={e => setAssetId(e.target.value)}
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Verify
        </button>
      </form>
    </div>
  );
}