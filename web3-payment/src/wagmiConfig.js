import { createConfig, http } from "wagmi";
import {
  mainnet,
  bsc,
  polygon,
  avalanche,
  arbitrum,
  base
} from "wagmi/chains";
import { walletConnect } from "wagmi/connectors";

export const config = createConfig({
  chains: [mainnet, bsc, polygon, avalanche, arbitrum, base],
  connectors: [
    walletConnect({
      projectId: "c46979307f3f04398d086294ddbc8768",
      metadata: {
        name: "Secure Payment",
        description: "Transparent Web3 payment request system",
        url: "https://bitter-forest-f198.unzilegarip09.workers.dev",
        icons: []
      },
      qrModalOptions: {
        themeMode: "dark"
      }
    })
  ],
  transports: {
    [mainnet.id]: http(),
    [bsc.id]: http(),
    [polygon.id]: http(),
    [avalanche.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http()
  }
});