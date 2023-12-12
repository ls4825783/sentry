import { Networkish, ethers } from 'ethers';

// global storage of providers
const providers: { [key: string]: ethers.JsonRpcProvider | ethers.WebSocketProvider | ethers.AlchemyProvider } = {};

/**
 * Creates an ethers provider from a given RPC URL. If the same RPC URL is passed in and ignoreMemo is false, 
 * the same instance of the provider is returned (Singleton nature).
 * @param rpcUrl - The RPC URL. Defaults to Arbitrum One's public RPC.
 * @param ignoreMemo - A flag to ignore the memo. Defaults to false.
 * @returns An ethers provider.
 */
export function getProvider(
    rpcUrl: string | undefined = undefined,
    ignoreMemo: boolean = false,
    alchemyNetwork: Networkish = {name: "arbitrum", chainId: 42161}
): ethers.JsonRpcProvider | ethers.WebSocketProvider | ethers.AlchemyProvider {
    
    const memoKey = rpcUrl != null ? rpcUrl : JSON.stringify(alchemyNetwork);

    if (!ignoreMemo && providers[memoKey]) {
        return providers[memoKey];
    }

    let provider: ethers.JsonRpcProvider | ethers.WebSocketProvider | ethers.AlchemyProvider;
    if (memoKey.startsWith('http') || memoKey.startsWith('https')) {
        provider = new ethers.JsonRpcProvider(memoKey);
    } else if (memoKey.startsWith('wss')) {
        provider = new ethers.WebSocketProvider(memoKey);
    } else {
        const apiKey = '0_k7oCEgz0T12XLeYvs4NetupsnupbX5'; 
        provider = new ethers.AlchemyProvider(alchemyNetwork, apiKey);
    }

    if (!ignoreMemo) {
        providers[memoKey] = provider;
    }

    return provider;
}
