// src/services/algorand.ts

import algosdk from 'algosdk';

const algodClient = new algosdk.Algodv2(
  '',
  import.meta.env.VITE_ALGORAND_NODE || 'https://testnet-api.algonode.cloud',
  ''
);

const indexerClient = new algosdk.Indexer(
  '',
  import.meta.env.VITE_ALGORAND_INDEXER || 'https://testnet-idx.algonode.cloud',
  ''
);

export interface TransactionResult {
  txId: string;
  confirmedRound: number;
}

class AlgorandService {
  /**
   * Validate Algorand address
   */
  isValidAddress(address: unknown): address is string {
    if (!address || typeof address !== 'string' || address.trim() === '') {
      return false;
    }
    try {
      algosdk.decodeAddress(address);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate and parse ASA ID
   */
  parseAsaId(asaId: unknown): number | null {
    if (asaId === null || asaId === undefined) {
      return null;
    }

    const parsed = typeof asaId === 'string' ? parseInt(asaId, 10) : Number(asaId);

    if (isNaN(parsed) || parsed <= 0) {
      return null;
    }

    return parsed;
  }

  /**
   * Get suggested transaction parameters
   */
  async getSuggestedParams() {
    return await algodClient.getTransactionParams().do();
  }

  /**
   * Check if account has opted into an asset
   */
  async isOptedIntoAsset(address: string, assetId: number): Promise<boolean> {
    if (!this.isValidAddress(address)) {
      console.error('Invalid address for opt-in check:', address);
      return false;
    }

    const parsedAssetId = this.parseAsaId(assetId);
    if (!parsedAssetId) {
      console.error('Invalid assetId for opt-in check:', assetId);
      return false;
    }

    try {
      const accountInfo = await algodClient.accountInformation(address).do();
      const assets = accountInfo.assets || [];
      return assets.some((asset: any) => asset['asset-id'] === parsedAssetId);
    } catch (error) {
      console.error('Error checking opt-in status:', error);
      return false;
    }
  }

  /**
   * Create opt-in transaction for an asset
   */
  async createOptInTransaction(address: string, assetId: number) {
    // Strict validation
    if (!address || typeof address !== 'string' || address.trim() === '') {
      throw new Error(`Wallet address is required. Got: "${address}"`);
    }

    if (!this.isValidAddress(address)) {
      throw new Error(`Invalid wallet address provided: "${address}"`);
    }

    const parsedAssetId = this.parseAsaId(assetId);
    if (!parsedAssetId) {
      throw new Error(`Invalid asset ID provided: "${assetId}"`);
    }

    console.log('Creating opt-in transaction:', { address, assetId: parsedAssetId });

    const params = await this.getSuggestedParams();

    // Use object-style API (avoids positional arg issues with undefined values)
    return algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: address,
      to: address,
      amount: 0,
      assetIndex: parsedAssetId,
      suggestedParams: params,
    });
  }

  /**
   * Create payment transaction
   */
  async createPaymentTransaction(from: string, to: string, amountAlgo: number) {
    if (!from || typeof from !== 'string' || from.trim() === '') {
      throw new Error(`Sender address is required. Got: "${from}"`);
    }

    if (!this.isValidAddress(from)) {
      throw new Error(`Invalid sender address: "${from}"`);
    }

    if (!to || typeof to !== 'string' || to.trim() === '') {
      throw new Error(`Receiver address is required. Got: "${to}"`);
    }

    if (!this.isValidAddress(to)) {
      throw new Error(`Invalid receiver address: "${to}"`);
    }

    if (!amountAlgo || isNaN(amountAlgo) || amountAlgo <= 0) {
      throw new Error(`Invalid amount: "${amountAlgo}"`);
    }

    console.log('Creating payment transaction:', { from, to, amountAlgo });

    const params = await this.getSuggestedParams();
    const amountMicroAlgos = Math.floor(amountAlgo * 1_000_000);

    // Use object-style API (avoids positional arg issues)
    return algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from,
      to,
      amount: amountMicroAlgos,
      suggestedParams: params,
    });
  }


  /**
   * Submit signed transaction to the network
   */
  async submitTransaction(signedTxn: Uint8Array): Promise<string> {
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
    return txId;
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForConfirmation(txId: string, timeout = 10): Promise<TransactionResult> {
    const status = await algodClient.status().do();
    let lastRound = status['last-round'];

    while (timeout > 0) {
      const pendingInfo = await algodClient.pendingTransactionInformation(txId).do();

      if (pendingInfo['confirmed-round'] && pendingInfo['confirmed-round'] > 0) {
        return {
          txId,
          confirmedRound: pendingInfo['confirmed-round'],
        };
      }

      if (pendingInfo['pool-error'] && pendingInfo['pool-error'].length > 0) {
        throw new Error(`Transaction rejected: ${pendingInfo['pool-error']}`);
      }

      await algodClient.statusAfterBlock(lastRound + 1).do();
      lastRound++;
      timeout--;
    }

    throw new Error('Transaction confirmation timeout');
  }

  /**
   * Submit and wait for confirmation
   */
  async submitAndWait(signedTxn: Uint8Array): Promise<TransactionResult> {
    const txId = await this.submitTransaction(signedTxn);
    return await this.waitForConfirmation(txId);
  }

  /**
   * Get account balance
   */
  async getAccountBalance(address: string): Promise<number> {
    if (!this.isValidAddress(address)) {
      throw new Error(`Invalid address: "${address}"`);
    }

    const accountInfo = await algodClient.accountInformation(address).do();
    return accountInfo.amount / 1_000_000;
  }
}

export const algorandService = new AlgorandService();
export { algodClient, indexerClient };
export default algorandService;