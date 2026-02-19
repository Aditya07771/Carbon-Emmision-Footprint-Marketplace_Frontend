// src/hooks/useApi.ts
import { useState, useCallback } from 'react';
import api from '@/services/api';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await apiCall();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      setState({ data: null, loading: false, error: message });
      throw error;
    }
  }, []);

  return { ...state, execute };
}

// Specific hooks for common operations
export function useCredits() {
  const [credits, setCredits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = useCallback(async (filters?: any) => {
    setLoading(true);
    try {
      const response: any = await api.getAllCredits(filters);
      setCredits(response.data || []);
      setError(null);
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
    try {
      const response: any = await api.getListings();
      setListings(response.data || []);
      setError(null);
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
    try {
      const response: any = await api.getAllRetirements();
      setRetirements(response.data || []);
      setTotalTonnes(response.totalTonnes || 0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch retirements');
    } finally {
      setLoading(false);
    }
  }, []);

  return { retirements, totalTonnes, loading, error, fetchRetirements };
}