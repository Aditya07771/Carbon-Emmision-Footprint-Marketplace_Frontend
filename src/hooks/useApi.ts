// src/hooks/useApi.ts

import { useState, useCallback } from 'react';
import api from '@/services/api';

export function useCredits() {
  const [credits, setCredits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response: any = await api.getAllCredits();
      setCredits(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch credits');
    } finally {
      setLoading(false);
    }
  }, []);

  return { credits, loading, error, fetchCredits };
}

export function useListings() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response: any = await api.getListings();
      setListings(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch listings');
    } finally {
      setLoading(false);
    }
  }, []);

  return { listings, loading, error, fetchListings };
}

export function useRetirements() {
  const [retirements, setRetirements] = useState<any[]>([]);
  const [totalTonnes, setTotalTonnes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRetirements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response: any = await api.getAllRetirements();
      setRetirements(response.data || []);
      setTotalTonnes(response.totalTonnes || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch retirements');
    } finally {
      setLoading(false);
    }
  }, []);

  return { retirements, totalTonnes, loading, error, fetchRetirements };
}