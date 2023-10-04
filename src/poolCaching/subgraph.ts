import fetch from 'isomorphic-fetch';
import { SubgraphPoolBase } from '../types';
import { RequestInit, Response } from 'node-fetch';

const queryWithLinear = `
      {
        pools {
          id
          address
          poolType
          swapFee
          totalShares
          tokens {
            address
            balance
            decimals
            weight
            priceRate
          }
          tokensList
          totalWeight
          amp
          expiryTime
          unitSeconds
          principalToken
          baseToken
          swapEnabled
          wrappedIndex
          mainIndex
          lowerTarget
          upperTarget
        }
      }
    `;

const queryWithOutLinear = `
      {
        pools {
          id
          address
          poolType
          swapFee
          totalShares
          tokens {
            address
            balance
            decimals
            weight
            priceRate
          }
          tokensList
          totalWeight
          amp
          expiryTime
          unitSeconds
          principalToken
          baseToken
          swapEnabled
        }
      }
    `;

export const Query: { [chainId: number]: string } = {
    1: queryWithLinear,
    3: queryWithLinear,
    4: queryWithLinear,
    5: queryWithLinear,
    42: queryWithLinear,
    137: queryWithOutLinear,
    42161: queryWithLinear,
    250: queryWithLinear,
    43114: queryWithLinear,
    43113: queryWithLinear,
    56: queryWithLinear,
};

async function fetchWithRetry(
    url: string,
    options: RequestInit,
    retries: number = 3
): Promise<Response> {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, options);
            if (response.ok) return response;
            console.error(`Attempt ${i + 1} failed: ${response.statusText}`);
        } catch (error) {
            console.error(`Attempt ${i + 1} failed: ${error.message}`);
        }
        // Optional: add a delay before retrying, e.g., await new Promise(res => setTimeout(res, 2000));
    }
    throw new Error('Max retries exceeded');
}

export async function fetchSubgraphPools(
    subgraphUrl: string,
    chainId = 1
): Promise<{ response: any; pools: SubgraphPoolBase[] }> {
    const response = await fetchWithRetry(subgraphUrl, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: Query[chainId] }),
    });

    const jsonResponse = await response.json();
    const pools = jsonResponse.data.pools ?? [];

    return { response: jsonResponse, pools };
}
