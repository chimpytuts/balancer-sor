import fetch from 'isomorphic-fetch';
import { SubgraphPoolBase } from '../types';
import { Response } from 'node-fetch'; // If you're in a Node.js environment

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

// Returns all public pools
export async function fetchSubgraphPools(
    subgraphUrl: string,
    chainId = 1
): Promise<{ response: any; pools: SubgraphPoolBase[] }> {
    const response = await fetch(subgraphUrl, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: Query[chainId] }),
    });

    if (!response.ok) {
        const text = await response.text();
        console.error(
            `Error: ${response.status} ${response.statusText}\n${text}`
        );
        throw new Error(`Server responded with status ${response.status}`);
    }

    const jsonResponse = await response.json();
    const pools = jsonResponse.data.pools ?? [];

    return { response: jsonResponse, pools };
}
