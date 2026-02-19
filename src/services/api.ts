// src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    const text = await response.text();

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        `Server returned non-JSON response (HTTP ${response.status}). ` +
        `Check that the backend is running at ${this.baseUrl}.`
      );
    }

    if (!response.ok) {
      throw new Error(data.error || data.message || 'API request failed');
    }

    return data;
  }

  // ============ CREDITS API ============

  async issueCredits(data: {
    projectId: string;
    name: string;
    location: string;
    projectType: string;
    verifier: string;
    co2Tonnes: number;
    vintageYear: number;
    asaId: number;
    issuerWallet: string;
  }) {
    return this.request('/credits/issue', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCreditDetails(asaId: string | number) {
    return this.request(`/credits/${asaId}`);
  }

  async getAllCredits(filters?: {
    status?: string;
    verifier?: string;
    projectType?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.verifier) params.append('verifier', filters.verifier);
    if (filters?.projectType) params.append('projectType', filters.projectType);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/credits${query}`);
  }

  // ============ MARKETPLACE API ============

  async getListings() {
    return this.request('/marketplace');
  }

  async createListing(data: {
    asaId: number;
    sellerWallet: string;
    priceAlgo: number;
    co2Tonnes: number;
    vintageYear: number;
  }) {
    return this.request('/marketplace/list', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async buyCredit(data: {
    txnHash: string;
    buyerWallet: string;
    asaId: number;
  }) {
    return this.request('/marketplace/buy', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async cancelListing(data: {
    asaId: number;
    sellerWallet: string;
  }) {
    return this.request('/marketplace/cancel', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============ RETIREMENT API ============

  async retireCredits(data: {
    txnHash: string;
    companyWallet: string;
    companyName: string;
    asaId: number;
    tonnes: number;
    certificateId: string;
  }) {
    return this.request('/retirements/retire', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAllRetirements() {
    return this.request('/retirements');
  }

  async verifyCertificate(certificateId: string) {
    return this.request(`/retirements/verify/${certificateId}`);
  }

  // ============ EXPLORER API ============

  async getCompanyDashboard(walletAddress: string) {
    return this.request(`/explorer/company/${walletAddress}`);
  }

  async getPublicExplorer(walletAddress: string) {
    return this.request(`/explorer/public/${walletAddress}`);
  }

  // ============ HEALTH CHECK ============

  async healthCheck() {
    return this.request('/health');
  }
}

export const api = new ApiService();
export default api;