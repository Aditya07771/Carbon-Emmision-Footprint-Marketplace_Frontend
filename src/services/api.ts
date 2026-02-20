// src/services/api.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  /**
   * Core request method that handles double-slash prevention, 
   * form-data detection, and error handling.
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    walletAddress?: string
  ): Promise<T> {
    // 1. Remove trailing slashes from baseUrl
    const cleanBaseUrl = this.baseUrl.replace(/\/$/, '');
    // 2. Ensure endpoint starts with a single slash
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    // 3. Combine them safely
    const url = `${cleanBaseUrl}${cleanEndpoint}`;

    const isFormData = options.body instanceof FormData;
    const defaultHeaders: HeadersInit = isFormData
      ? {}
      : { 'Content-Type': 'application/json' };

    // Add wallet address to headers if provided
    if (walletAddress) {
      (defaultHeaders as Record<string, string>)['x-wallet-address'] = walletAddress;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    const response = await fetch(url, config);
    const text = await response.text();

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Server returned non-JSON response (HTTP ${response.status}).`);
    }

    if (!response.ok) {
      const error: any = new Error(data.error || data.message || 'API request failed');
      error.code = data.code;
      error.status = data.status;
      throw error;
    }

    return data;
  }

  // ============ USER / REGISTRATION API ============

  async getUserRole(walletAddress: string) {
    return this.request<{
      success: boolean;
      wallet: string;
      role: string;
      status: string;
      isRegistered: boolean;
      organizationName?: string;
      rejectionReason?: string;
    }>(`/users/role/${walletAddress}`);
  }

  async registerNgo(data: {
    walletAddress: string;
    organizationName: string;
    email: string;
    phone?: string;
    country: string;
    website?: string;
    description: string;
    registrationNumber: string;
    ngoType: string;
    operatingRegions?: string[];
    certifications?: string[];
  }) {
    return this.request('/users/register/ngo', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async registerBusiness(data: {
    walletAddress: string;
    organizationName: string;
    email: string;
    phone?: string;
    country: string;
    website?: string;
    description: string;
    companyType: string;
    industry: string;
    employeeCount?: string;
    sustainabilityGoals?: string;
  }) {
    return this.request('/users/register/business', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserProfile(walletAddress: string) {
    return this.request(`/users/profile/${walletAddress}`);
  }

  async updateUserProfile(walletAddress: string, data: any) {
    return this.request(`/users/profile/${walletAddress}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // ============ IPFS API ============
  async uploadToIpfs(files: File[]) {
    const formData = new FormData();
    files.forEach(file => {
      // Make sure 'files' matches your backend multer field name
      formData.append('files', file);
    });

    // We don't need a wallet address for this specific call, just form data
    return this.request<{ success: boolean; ipfsHash: string }>('/ipfs/upload', {
      method: 'POST',
      body: formData,
    });
  }

  // ============ ADMIN API ============

  async getPendingRegistrations(adminWallet: string) {
    return this.request('/users/admin/pending', {}, adminWallet);
  }

  async getAdminStats(adminWallet: string) {
    return this.request('/users/admin/stats', {}, adminWallet);
  }

  async approveRegistration(userId: string, adminWallet: string) {
    return this.request(`/users/admin/approve/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ adminWallet }),
    });
  }

  async rejectRegistration(userId: string, adminWallet: string, reason: string) {
    return this.request(`/users/admin/reject/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ adminWallet, reason }),
    });
  }

  async getApprovedNgos() {
    return this.request('/users/ngos');
  }

  async getApprovedBusinesses() {
    return this.request('/users/businesses');
  }

  // ============ CREDITS API ============

  async issueCredits(data: any, walletAddress: string) {
    return this.request('/credits/issue', {
      method: 'POST',
      body: JSON.stringify(data),
    }, walletAddress);
  }

  async getCreditDetails(asaId: string | number) {
    return this.request(`/credits/${asaId}`);
  }

  async getAllCredits(filters?: { status?: string; verifier?: string; projectType?: string; }) {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.verifier) params.append('verifier', filters.verifier);
    if (filters?.projectType) params.append('projectType', filters.projectType);

    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/credits${query}`);
  }

  // ============ MARKETPLACE API ============

  async getListings(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/marketplace${query}`);
  }

  async createListing(data: any) {
    return this.request('/marketplace/list', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // In api.ts, update the buyCredit method:

  async buyCredit(data: {
    txnHash: string;
    buyerWallet: string;
    asaId: number;
    priceAlgo?: number;
    sellerWallet?: string;
    optInTxnHash?: string | null;
  }) {
    return this.request('/marketplace/buy', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async cancelListing(data: any) {
    return this.request('/marketplace/cancel', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============ RETIREMENT API ============

  async retireCredits(data: any) {
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