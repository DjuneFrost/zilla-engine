"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ── Supported tokens
const SUPPORTED_TOKENS = [
  { id: "solana",      symbol: "SOL",  name: "Solana",       logo: "https://assets.coingecko.com/coins/images/4128/small/solana.png",  coinId: "solana" },
  { id: "hyperliquid", symbol: "HYPE", name: "HyperLiquid", logo: "https://coin-images.coingecko.com/coins/images/36658/large/hyperliquid.png", coinId: "hyperliquid" },
];

async function fetchTokenPrice(coinId) {
  try {
    const res = await fetch(`/api/prices?id=${coinId}`);
    const data = await res.json();
    return { price: data[coinId]?.usd || 0, change24h: data[coinId]?.usd_24h_change || 0 };
  } catch { return { price: 0, change24h: 0 }; }
}

async function fetchTokenHistory(coinId, days = 60) {
  try {
    const res = await fetch(`/api/history?id=${coinId}&days=${days}`);
    const data = await res.json();
    return (data.prices || []).map(([ts, price]) => ({ date: new Date(ts), price }));
  } catch { return []; }
}

function runBacktest(prices, zones, capital, exposure) {
  if (!prices.length) return null;
  const maxDeploy = (capital * exposure) / 100;
  let deployed = 0, orders = [], totalBought = 0, totalSpent = 0;
  const refPrice = Math.max(...prices.slice(0, 5).map(p => p.price));
  prices.forEach((point, i) => {
    if (i === 0) return;
    const pct = ((refPrice - point.price) / refPrice) * 100;
    zones.forEach(zone => {
      if (pct >= zone.pullback) {
        const zoneAlloc = (maxDeploy * zone.alloc) / 100;
        const lastOrder = orders.filter(o => o.zone === zone.pullback).slice(-1)[0];
        if (!lastOrder || (point.date - lastOrder.date) > 7 * 24 * 60 * 60 * 1000) {
          if (deployed + zoneAlloc <= maxDeploy) {
            const units = zoneAlloc / point.price;
            deployed += zoneAlloc; totalBought += units; totalSpent += zoneAlloc;
            orders.push({ date: point.date, price: point.price, amount: zoneAlloc, units, zone: zone.pullback });
          }
        }
      }
    });
  });
  const finalPrice = prices[prices.length - 1].price;
  const currentValue = totalBought * finalPrice;
  const pnl = currentValue - totalSpent;
  const pnlPct = totalSpent > 0 ? (pnl / totalSpent) * 100 : 0;
  const avgEntry = totalBought > 0 ? totalSpent / totalBought : 0;
  return { orders, deployed, totalBought, totalSpent, currentValue, pnl, pnlPct, avgEntry, finalPrice };
}

export default function ZillaEnginePage() {
  const [selectedToken, setSelectedToken] = useState(SUPPORTED_TOKENS[0]);
  const [tokenPrice, setTokenPrice] = useState(0);
  const [tokenChange, setTokenChange] = useState(0);
  const [priceDir, setPriceDir] = useState(null);
  const prevPrice = useRef(0);

  const [showBacktest, setShowBacktest] = useState(false);
  const [backtestLoading, setBacktestLoading] = useState(false);
  const [backtestResult, setBacktestResult] = useState(null);

  const [triggerMode, setTriggerMode] = useState(0);
  const [toggleDynamic, setToggleDynamic] = useState(false);
  const [toggleExit, setToggleExit] = useState(false);
  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [strategyName, setStrategyName] = useState("");
  const [capital, setCapital] = useState(1000);
  const [exposure, setExposure] = useState(80);
  const [zones, setZones] = useState([{ pullback: 3, alloc: 20 }, { pullback: 7, alloc: 30 }, { pullback: 15, alloc: 30 }]);
  const [trendFilter, setTrendFilter] = useState("Above MA50");
  const [atrGuard, setAtrGuard] = useState(2.5);
  const [cooldown, setCooldown] = useState(4);
  const [minOrder, setMinOrder] = useState(10.5);
  const [triggers, setTriggers] = useState([false, false, false, false]);
  const [rsiThreshold, setRsiThreshold] = useState(35);
  const [volumeMultiplier, setVolumeMultiplier] = useState(2);
  const [supportIndicators, setSupportIndicators] = useState(2);
  const [dynMode, setDynMode] = useState("volatility");
  const [dynVolatilityReduction, setDynVolatilityReduction] = useState(50);
  const [dynUptrendBoost, setDynUptrendBoost] = useState(50);
  const [takeProfit, setTakeProfit] = useState(0);
  const [trailingStop, setTrailingStop] = useState(0);
  const [exitIndicator, setExitIndicator] = useState(false);
  const [exitIndicatorType, setExitIndicatorType] = useState("RSI (Daily)");
  const [exitCondition, setExitCondition] = useState("Above (>)");
  const [exitThreshold, setExitThreshold] = useState(0);
  const [exitDrop, setExitDrop] = useState(false);
  const [exitDropValue, setExitDropValue] = useState(0);
  const [exitMaxBuys, setExitMaxBuys] = useState(false);
  const [exitMaxBuysValue, setExitMaxBuysValue] = useState(0);

  const showToast = (msg) => { setToast(msg); setToastVisible(true); setTimeout(() => setToastVisible(false), 3000); };

  // Live price polling every 5s
  useEffect(() => {
    const poll = async () => {
      const { price, change24h } = await fetchTokenPrice(selectedToken.coinId);
      if (price > 0) {
        setPriceDir(price > prevPrice.current ? "up" : price < prevPrice.current ? "down" : null);
        prevPrice.current = price;
        setTokenPrice(price);
        setTokenChange(change24h);
        setTimeout(() => setPriceDir(null), 1200);
      }
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [selectedToken]);

  // Reset price on token change
  useEffect(() => {
    setTokenPrice(0);
    setTokenChange(0);
    prevPrice.current = 0;
    setBacktestResult(null);
    setShowBacktest(false);
  }, [selectedToken]);

  const activeZones = zones.map(z => {
    if (!tokenPrice) return false;
    const refHigh = tokenPrice * 1.25;
    return ((refHigh - tokenPrice) / refHigh) * 100 >= z.pullback;
  });

  const handleBacktest = async () => {
    setBacktestLoading(true); setShowBacktest(true); setBacktestResult(null);
    const history = await fetchTokenHistory(selectedToken.coinId, 60);
    const result = runBacktest(history, zones, Number(capital), Number(exposure));
    setBacktestResult(result); setBacktestLoading(false);
  };

  const activatePreset = () => {
    setStrategyName(`Zilla Engine — ${selectedToken.symbol}`);
    setExposure(70);
    setZones([{ pullback: 5, alloc: 20 }, { pullback: 12, alloc: 30 }, { pullback: 25, alloc: 20 }]);
    setTrendFilter("Above MA50"); setAtrGuard(2.5); setCooldown(6); setMinOrder(10.5);
    setTriggerMode(2); setTriggers([true, false, false, true]);
    setRsiThreshold(30); setSupportIndicators(1);
    showToast(`⚡ Zilla Engine preset loaded for ${selectedToken.symbol}!`);
  };

  const totalAlloc = zones.reduce((s, z) => s + Number(z.alloc), 0);
  const maxDeploy = ((capital * exposure) / 100).toFixed(0);
  const anyTriggerActive = triggers.some(Boolean);

  const Toggle = ({ val, set }) => (
    <div onClick={() => set(!val)} style={{ width: 44, height: 24, background: val ? "#fff" : "rgba(255,255,255,0.1)", borderRadius: 12, cursor: "pointer", position: "relative", flexShrink: 0, transition: "background 0.2s", border: "1px solid rgba(255,255,255,0.15)" }}>
      <div style={{ width: 18, height: 18, background: val ? "#080808" : "rgba(255,255,255,0.5)", borderRadius: "50%", position: "absolute", top: 2, left: val ? 22 : 2, transition: "left 0.2s" }} />
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; color: #fff; font-family: 'DM Sans', sans-serif; }

        .ze-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 0 32px; height: 56px; background: rgba(8,8,8,0.95); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.06); }
        .ze-logo { font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 3px; color: #fff; text-decoration: none; }
        .ze-logo span { color: rgba(255,255,255,0.3); }

        .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 20px; margin-bottom: 12px; }
        .card-title { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
        .inner-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 14px 16px; margin-bottom: 8px; }
        .field-group { display: flex; flex-direction: column; }
        .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .zone-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .label { font-size: 11px; color: rgba(255,255,255,0.4); display: block; margin-bottom: 4px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.3px; }
        .sublabel { font-size: 11px; color: rgba(255,255,255,0.2); display: block; margin-bottom: 8px; line-height: 1.4; text-transform: none; letter-spacing: 0; }
        .inp { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 9px; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 10px 14px; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
        .inp:focus { border-color: rgba(255,255,255,0.25); }
        .sel { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 9px; color: #fff; font-family: 'DM Sans', sans-serif; font-size: 13px; padding: 10px 14px; outline: none; appearance: none; box-sizing: border-box; cursor: pointer; }
        .divider { height: 1px; background: rgba(255,255,255,0.06); margin: 14px -20px; }
        .stat-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 16px; text-align: center; }
        .trig-btn { border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 12px 14px; cursor: pointer; transition: all 0.2s; display: flex; align-items: flex-start; gap: 12px; margin-bottom: 6px; background: rgba(255,255,255,0.02); width: 100%; text-align: left; }
        .trig-btn:hover { background: rgba(255,255,255,0.04); }
        .trig-btn.selected { border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.06); }

        @keyframes pulse-white { 0%,100%{box-shadow:0 0 0 0 rgba(255,255,255,0.3);}50%{box-shadow:0 0 0 6px rgba(255,255,255,0);} }
        .zone-active { animation: pulse-white 1.5s infinite; border-color: rgba(255,255,255,0.3) !important; background: rgba(255,255,255,0.06) !important; }

        .token-tab { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 9px; border: 1px solid rgba(255,255,255,0.08); background: transparent; color: rgba(255,255,255,0.4); font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .token-tab.active { border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.08); color: #fff; }
        .token-tab img { width: 20px; height: 20px; border-radius: 50%; }

        @media(max-width:768px){
          .row2 { grid-template-columns: 1fr !important; }
          .zone-row { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .ze-nav { padding: 0 16px; }
          .content { padding: 72px 16px 60px !important; }
        }
      `}</style>

      {/* NAV */}
      <nav className="ze-nav">
        <Link href="/" className="ze-logo">ZILLA <span>ENGINE</span></Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff", boxShadow: "0 0 8px #fff" }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono',monospace" }}>Phase 1 — Simulation</span>
        </div>
      </nav>

      <div className="content" style={{ position: "relative", maxWidth: 860, margin: "0 auto", padding: "76px 24px 60px" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, letterSpacing: 2, color: "#fff" }}>Zilla Engine</div>
            <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>Phase 1 — Live</span>
          </div>
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 14 }}>Structure-based accumulation — spot only, capital-protected, volatility-aware</div>
        </div>

        {/* Token selector */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {SUPPORTED_TOKENS.map(t => (
            <button key={t.symbol} className={`token-tab${selectedToken.symbol === t.symbol ? " active" : ""}`} onClick={() => setSelectedToken(t)}>
              <img src={t.logo} alt={t.symbol} onError={e => e.target.style.display="none"} />
              {t.symbol}
            </button>
          ))}
        </div>

        {/* Live price ticker */}
        <div className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <img src={selectedToken.logo} style={{ width: 36, height: 36, borderRadius: "50%" }} alt={selectedToken.symbol} onError={e => e.target.style.display="none"} />
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 2, fontFamily: "'JetBrains Mono',monospace" }}>{selectedToken.symbol} / USD — Live</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 32, color: priceDir === "up" ? "#fff" : priceDir === "down" ? "rgba(255,255,255,0.4)" : "#fff", transition: "color 0.4s", letterSpacing: 1 }}>
                  ${tokenPrice > 0 ? tokenPrice.toFixed(2) : "—"}
                </span>
                {tokenChange !== 0 && (
                  <span style={{ fontSize: 13, fontWeight: 600, color: tokenChange >= 0 ? "#fff" : "rgba(255,255,255,0.4)", fontFamily: "'JetBrains Mono',monospace" }}>
                    {tokenChange >= 0 ? "▲" : "▼"} {Math.abs(tokenChange).toFixed(2)}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff", boxShadow: "0 0 8px #fff" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono',monospace" }}>Updates every 5s</span>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
          {[
            { label: "Total Capital", value: `$${capital}`, },
            { label: "Deployed", value: "$0" },
            { label: "Status", value: "Preview" },
            { label: `${selectedToken.symbol} Price`, value: tokenPrice > 0 ? `$${tokenPrice.toFixed(2)}` : "—" },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 16, fontWeight: 600, color: "#fff" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Configure Strategy */}
        <div className="card">
          <div className="card-title">⚙ Configure Strategy</div>

          {/* AI — disabled */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, marginBottom: 10, opacity: 0.4, cursor: "not-allowed", pointerEvents: "none", padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 30, height: 30, background: "rgba(255,255,255,0.08)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✨</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>AI Strategy Generator <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>Coming Soon</span></div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Let AI build an optimized strategy based on your goals</div>
              </div>
            </div>
            <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 16 }}>▾</span>
          </div>

          {/* Preset */}
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <div style={{ width: 34, height: 34, background: "rgba(255,255,255,0.08)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>⚡</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#fff", marginBottom: 2 }}>Zilla Engine — {selectedToken.symbol}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>Capital-protection optimized DCA model for structured pullbacks.</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["Capital Protection", "Trend Filter", "Zone Accumulation"].map(t => (<span key={t} style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: "2px 9px" }}>{t}</span>))}
              </div>
            </div>
            <button onClick={activatePreset} style={{ background: "#fff", border: "none", color: "#080808", fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700, padding: "8px 18px", borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>⚡ Activate</button>
          </div>

          <div className="divider" />

          <div className="row2">
            <div className="field-group"><label className="label">Strategy Name</label><input type="text" className="inp" placeholder={`e.g. ${selectedToken.symbol} Accumulator`} value={strategyName} onChange={e => setStrategyName(e.target.value)} /></div>
            <div className="field-group"><label className="label">Asset</label>
              <select className="sel" value={selectedToken.symbol} onChange={e => setSelectedToken(SUPPORTED_TOKENS.find(t => t.symbol === e.target.value))}>
                {SUPPORTED_TOKENS.map(t => <option key={t.symbol} value={t.symbol}>{t.name} ({t.symbol})</option>)}
              </select>
            </div>
          </div>

          <div className="inner-box">
            <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>Capital Management</div>
            <div className="row2">
              <div className="field-group"><label className="label">Total Capital (USD)</label><span className="sublabel">Total budget for this strategy</span><input type="number" className="inp" value={capital} onChange={e => setCapital(e.target.value)} /></div>
              <div className="field-group"><label className="label">Max Exposure %</label><span className="sublabel">Cap on total capital ever deployed</span><input type="number" className="inp" min={10} max={100} value={exposure} onChange={e => setExposure(Math.min(100, Math.max(10, Number(e.target.value))))} /></div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "9px 12px", fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono',monospace" }}>
              Max deploy: <span style={{ color: "#fff", fontWeight: 600 }}>${maxDeploy}</span> · Exposure: <span style={{ color: "#fff", fontWeight: 600 }}>{exposure}%</span>
            </div>
          </div>
        </div>

        {/* Accumulation Zones */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div className="card-title" style={{ marginBottom: 0 }}>Accumulation Zones</div>
            <span style={{ fontSize: 12, color: totalAlloc > 100 ? "#ff6b6b" : "rgba(255,255,255,0.6)", fontWeight: 600, fontFamily: "'JetBrains Mono',monospace" }}>{totalAlloc}%</span>
          </div>
          {tokenPrice > 0 && (
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 12, color: "rgba(255,255,255,0.35)", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", flexShrink: 0, display: "inline-block" }} />
              {selectedToken.symbol} at <span style={{ color: "#fff", fontWeight: 600, margin: "0 4px", fontFamily: "'JetBrains Mono',monospace" }}>${tokenPrice.toFixed(2)}</span> — zones with 🎯 are within pullback range
            </div>
          )}
          {zones.map((z, i) => (
            <div key={i} className={`inner-box${activeZones[i] ? " zone-active" : ""}`}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Zone {i + 1}</span>
                  {activeZones[i] && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", fontWeight: 700 }}>🎯 Active</span>}
                </div>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>Deploy when pullback ≥ {z.pullback}%</span>
              </div>
              <div className="zone-row">
                <div className="field-group"><label className="label">Pullback Depth %</label><input type="number" className="inp" min={0.5} max={50} step={0.5} value={z.pullback} onChange={e => { const nz = [...zones]; nz[i] = { ...nz[i], pullback: Math.min(50, Math.max(0.5, Number(e.target.value))) }; setZones(nz); }} /></div>
                <div className="field-group"><label className="label">Capital Allocation %</label><input type="number" className="inp" min={1} max={100} value={z.alloc} onChange={e => { const nz = [...zones]; nz[i] = { ...nz[i], alloc: Math.min(100, Math.max(1, Number(e.target.value))) }; setZones(nz); }} /></div>
              </div>
            </div>
          ))}
        </div>

        {/* Protection Filters */}
        <div className="card">
          <div className="card-title">Protection Filters</div>
          <div className="row2">
            <div className="field-group"><label className="label">Trend Filter (MA)</label><span className="sublabel">Only accumulate if price is above this MA</span><select className="sel" value={trendFilter} onChange={e => setTrendFilter(e.target.value)}><option>Above MA50</option><option>Above MA20</option><option>Above MA100</option><option>Above MA200</option><option>No Filter</option></select></div>
            <div className="field-group"><label className="label">Volatility Spike Guard (ATR ×)</label><span className="sublabel">Pause buying when volatility exceeds this</span><input type="number" className="inp" min={1} max={10} value={atrGuard} step="0.1" onChange={e => setAtrGuard(Math.min(10, Math.max(1, Number(e.target.value))))} /></div>
            <div className="field-group"><label className="label">Cooldown Between Orders (hours)</label><span className="sublabel">Minimum wait between buys</span><input type="number" className="inp" min={1} value={cooldown} onChange={e => setCooldown(Math.max(1, Number(e.target.value)))} /></div>
            <div className="field-group"><label className="label">Min Order Size (USD)</label><span className="sublabel">Minimum is $10.50</span><input type="number" className="inp" min={1} step="0.5" value={minOrder} onChange={e => setMinOrder(Math.max(1, Number(e.target.value)))} /></div>
          </div>
        </div>

        {/* Triggers */}
        <div className="card">
          <div className="card-title">Accumulation Triggers</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 14 }}>Add indicator-based conditions beyond price pullbacks</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Combine with zone logic</div>
          {[{ title: "Any trigger fires (OR)", desc: "Buy when at least one condition is met" }, { title: "All triggers must fire (AND)", desc: "Buy only when every condition is met" }, { title: "Zone hit + any trigger", desc: "Price in zone AND at least one indicator fires" }].map((m, i) => (
            <button key={i} onClick={() => setTriggerMode(i)} className={`trig-btn${triggerMode === i ? " selected" : ""}`}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${triggerMode === i ? "#fff" : "rgba(255,255,255,0.2)"}`, background: triggerMode === i ? "#fff" : "transparent", flexShrink: 0, marginTop: 2 }} />
              <div><div style={{ fontSize: 13, fontWeight: 600, color: triggerMode === i ? "#fff" : "rgba(255,255,255,0.5)" }}>{m.title}</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>{m.desc}</div></div>
            </button>
          ))}
          <div className="divider" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { key: 0, title: "RSI Dip Below", desc: "Buy when RSI falls under threshold" },
              { key: 1, title: "MACD Bullish Cross", desc: "Buy when MACD crosses above signal" },
              { key: 2, title: "Volume Surge", desc: "Buy when volume exceeds X× average" },
              { key: 3, title: "Support Zone Confirmed", desc: "Buy near support with N indicators" },
            ].map(t => {
              const active = triggers[t.key];
              return (
                <div key={t.key} style={{ background: active ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)", border: `1px solid ${active ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.07)"}`, borderRadius: 10, padding: "12px 14px", transition: "all 0.2s" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: 5 }}><span style={{ fontSize: 11, fontWeight: 600, color: active ? "#fff" : "rgba(255,255,255,0.4)", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "2px 9px" }}>{t.title}</span></div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", lineHeight: 1.5 }}>{t.desc}</div>
                    </div>
                    <button onClick={() => { const nt = [...triggers]; nt[t.key] = !nt[t.key]; setTriggers(nt); }} style={{ width: 24, height: 24, borderRadius: 6, background: active ? "rgba(255,255,255,0.1)" : "transparent", border: "1px solid rgba(255,255,255,0.15)", color: active ? "#fff" : "rgba(255,255,255,0.25)", cursor: "pointer", fontSize: 14, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{active ? "✕" : "+"}</button>
                  </div>
                </div>
              );
            })}
          </div>
          {anyTriggerActive && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Configure Active Triggers</div>
              {triggers[0] && <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 11, fontWeight: 600, color: "#fff", background: "rgba(255,255,255,0.08)", borderRadius: 6, padding: "2px 9px", whiteSpace: "nowrap" }}>RSI Dip Below</span><div style={{ flex: 1 }} /><input type="number" className="inp" min={10} max={50} value={rsiThreshold} onChange={e => setRsiThreshold(Math.min(50, Math.max(10, Number(e.target.value))))} style={{ width: 76, textAlign: "center", flexShrink: 0 }} /><span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>RSI</span><button onClick={() => { const nt = [...triggers]; nt[0] = false; setTriggers(nt); }} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 14 }}>✕</button></div>}
              {triggers[2] && <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 11, fontWeight: 600, color: "#fff", background: "rgba(255,255,255,0.08)", borderRadius: 6, padding: "2px 9px", whiteSpace: "nowrap" }}>Volume Surge</span><div style={{ flex: 1 }} /><input type="number" className="inp" min={1.2} max={10} step={0.1} value={volumeMultiplier} onChange={e => setVolumeMultiplier(Math.min(10, Math.max(1.2, Number(e.target.value))))} style={{ width: 76, textAlign: "center", flexShrink: 0 }} /><span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>x avg</span><button onClick={() => { const nt = [...triggers]; nt[2] = false; setTriggers(nt); }} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 14 }}>✕</button></div>}
              {triggers[3] && <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "11px 14px", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 11, fontWeight: 600, color: "#fff", background: "rgba(255,255,255,0.08)", borderRadius: 6, padding: "2px 9px", whiteSpace: "nowrap" }}>Support Zone</span><div style={{ flex: 1 }} /><input type="number" className="inp" min={1} max={3} value={supportIndicators} onChange={e => setSupportIndicators(Math.min(3, Math.max(1, Number(e.target.value))))} style={{ width: 76, textAlign: "center", flexShrink: 0 }} /><span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap" }}>indicators</span><button onClick={() => { const nt = [...triggers]; nt[3] = false; setTriggers(nt); }} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 14 }}>✕</button></div>}
            </div>
          )}
        </div>

        {/* Dynamic Allocation */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div><div style={{ fontWeight: 600, fontSize: 13, color: "#fff", marginBottom: 2 }}>Dynamic Allocation</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Scale zone allocations based on market conditions</div></div>
            <Toggle val={toggleDynamic} set={setToggleDynamic} />
          </div>
          {toggleDynamic && (
            <div style={{ marginTop: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 18 }}>
                {[{ key: "volatility", icon: "📉", title: "Volatility-Based", desc: "Reduces during ATR spikes" }, { key: "trend", icon: "📈", title: "Trend-Based", desc: "Boosts during uptrends" }, { key: "combined", icon: "⚡", title: "Combined", desc: "Both simultaneously" }].map(m => (
                  <div key={m.key} onClick={() => setDynMode(m.key)} style={{ border: `1px solid ${dynMode === m.key ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.07)"}`, borderRadius: 10, padding: 12, cursor: "pointer", background: dynMode === m.key ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)", transition: "all 0.2s" }}>
                    <div style={{ fontSize: 14, marginBottom: 5 }}>{m.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: dynMode === m.key ? "#fff" : "rgba(255,255,255,0.5)", marginBottom: 3 }}>{m.title}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", lineHeight: 1.4 }}>{m.desc}</div>
                  </div>
                ))}
              </div>
              <div className="row2">
                {(dynMode === "trend" || dynMode === "combined") && <div className="field-group"><label className="label">Uptrend Boost %</label><input type="number" className="inp" min={10} max={100} value={dynUptrendBoost} onChange={e => setDynUptrendBoost(Math.min(100, Math.max(10, Number(e.target.value))))} /></div>}
                {(dynMode === "volatility" || dynMode === "combined") && <div className="field-group"><label className="label">Volatility Reduction %</label><input type="number" className="inp" min={10} max={90} value={dynVolatilityReduction} onChange={e => setDynVolatilityReduction(Math.min(90, Math.max(10, Number(e.target.value))))} /></div>}
              </div>
            </div>
          )}
        </div>

        {/* Exit Strategy */}
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div><div style={{ fontWeight: 600, fontSize: 13, color: "#fff", marginBottom: 2 }}>Exit Strategy</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Conditions that will pause accumulation</div></div>
            <Toggle val={toggleExit} set={setToggleExit} />
          </div>
          {toggleExit && (
            <div style={{ marginTop: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div className="inner-box"><div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}><span>🎯</span><span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Take Profit</span></div><div className="field-group"><label className="label">% above avg entry</label><span className="sublabel">0 = disabled</span><input type="number" className="inp" min={0} value={takeProfit} onChange={e => setTakeProfit(Math.max(0, Number(e.target.value)))} /></div></div>
                <div className="inner-box"><div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}><span>📉</span><span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Trailing Stop-Loss</span></div><div className="field-group"><label className="label">Drop % from peak</label><span className="sublabel">0 = disabled</span><input type="number" className="inp" min={0} max={90} value={trailingStop} onChange={e => setTrailingStop(Math.min(90, Math.max(0, Number(e.target.value))))} /></div></div>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "11px 14px" }}>
                <span>⚠️</span>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>Exit triggers <span style={{ color: "#fff", fontWeight: 600 }}>pause accumulation</span> only. They do not automatically sell your assets.</div>
              </div>
            </div>
          )}
        </div>

        {/* BACKTEST BUTTON */}
        <button onClick={handleBacktest} style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, color: "#fff", fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 600, padding: 14, cursor: "pointer", marginBottom: 12, transition: "all 0.2s" }}>
          📊 Run Backtest — {selectedToken.symbol} — Last 60 Days
        </button>

        {/* BACKTEST RESULTS */}
        {showBacktest && (
          <div className="card" style={{ marginBottom: 12 }}>
            <div className="card-title">📊 Backtest Results — {selectedToken.symbol} — Last 60 Days</div>
            {backtestLoading && <div style={{ textAlign: "center", padding: "32px", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>⟳ Running simulation on historical {selectedToken.symbol} data...</div>}
            {!backtestLoading && backtestResult && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
                  {[
                    { label: "Orders Triggered", value: backtestResult.orders.length.toString() },
                    { label: "Capital Deployed", value: `$${backtestResult.deployed.toFixed(0)}` },
                    { label: "Avg Entry Price", value: backtestResult.avgEntry > 0 ? `$${backtestResult.avgEntry.toFixed(2)}` : "—" },
                    { label: `${selectedToken.symbol} Accumulated`, value: backtestResult.totalBought > 0 ? `${backtestResult.totalBought.toFixed(4)}` : "—" },
                    { label: "Current Value", value: `$${backtestResult.currentValue.toFixed(0)}` },
                    { label: "Est. PnL", value: `${backtestResult.pnl >= 0 ? "+" : ""}$${backtestResult.pnl.toFixed(0)} (${backtestResult.pnlPct.toFixed(1)}%)`, positive: backtestResult.pnl >= 0 },
                  ].map((s, i) => (
                    <div key={i} className="inner-box" style={{ marginBottom: 0 }}>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
                      <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 15, fontWeight: 600, color: s.positive !== undefined ? (s.positive ? "#fff" : "rgba(255,255,255,0.4)") : "#fff" }}>{s.value}</div>
                    </div>
                  ))}
                </div>
                {backtestResult.orders.length > 0 ? (
                  <>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Order Timeline</div>
                    {backtestResult.orders.map((o, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: i < backtestResult.orders.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#fff", fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>Zone {o.zone}% pullback — ${o.amount.toFixed(0)} deployed</div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono',monospace" }}>{o.date.toLocaleDateString()} · ${o.price.toFixed(2)} · {o.units.toFixed(4)} {selectedToken.symbol}</div>
                        </div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "'JetBrains Mono',monospace" }}>${o.amount.toFixed(0)}</div>
                      </div>
                    ))}
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: "24px", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>No zones triggered. Try reducing pullback depth.</div>
                )}
                <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, fontSize: 11, color: "rgba(255,255,255,0.25)", lineHeight: 1.6 }}>
                  ⚠️ Simulated results only. Past performance does not guarantee future results. Not financial advice.
                </div>
              </>
            )}
          </div>
        )}

        {/* Activate button */}
        <button onClick={() => showToast("🔒 Live execution coming in Phase 2!")} style={{ width: "100%", background: "#fff", border: "none", borderRadius: 12, color: "#080808", fontFamily: "'DM Sans',sans-serif", fontSize: 15, fontWeight: 700, padding: 16, cursor: "pointer", marginBottom: 20 }}>
          🚀 Activate Strategy — {selectedToken.symbol}
        </button>

        {/* Coming soon note */}
        <div style={{ textAlign: "center", padding: "32px 24px", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 16 }}>
          <div style={{ fontSize: 24, marginBottom: 8, opacity: 0.3 }}>🔒</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>Live execution — Phase 2</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.15)" }}>Real orders on Solana and HyperLiquid coming soon</div>
        </div>
      </div>

      {toastVisible && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#fff", color: "#080808", padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 9999 }}>
          {toast}
        </div>
      )}
    </>
  );
}
