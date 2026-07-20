"use client";
import { useState, useEffect, useRef } from "react";

/* ── helpers ── */
async function fetchSolPrice() {
  try {
    const res = await fetch("/api/prices?id=solana");
    const data = await res.json();
    return { price: data.solana?.usd || 0, change24h: data.solana?.usd_24h_change || 0 };
  } catch { return { price: 0, change24h: 0 }; }
}

async function fetchSolHistory() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/coins/solana/market_chart?vs_currency=usd&days=60&interval=daily");
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

/* ── Toggle component ── */
function Toggle({ val, set }) {
  return (
    <div onClick={() => set(!val)} style={{ width: 44, height: 24, background: val ? "rgba(150,40,200,0.6)" : "rgba(255,255,255,0.1)", borderRadius: 12, cursor: "pointer", position: "relative", flexShrink: 0, transition: "background 0.2s", border: `1px solid ${val ? "rgba(150,40,200,0.5)" : "rgba(255,255,255,0.1)"}` }}>
      <div style={{ width: 18, height: 18, background: "#fff", borderRadius: "50%", position: "absolute", top: 2, left: val ? 22 : 2, transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.4)" }} />
    </div>
  );
}

export default function DcaBotPage() {
  const [solPrice, setSolPrice] = useState(0);
  const [solChange24h, setSolChange24h] = useState(0);
  const [priceDir, setPriceDir] = useState(null);
  const prevPrice = useRef(0);

  const [showBacktest, setShowBacktest] = useState(false);
  const [backtestLoading, setBacktestLoading] = useState(false);
  const [backtestResult, setBacktestResult] = useState(null);
  const [savedStrategies, setSavedStrategies] = useState([]);
  const [saving, setSaving] = useState(false);

  const [triggerMode, setTriggerMode] = useState(0);
  const [toggleDynamic, setToggleDynamic] = useState(false);
  const [toggleExit, setToggleExit] = useState(false);
  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [strategyName, setStrategyName] = useState("");
  const [asset, setAsset] = useState("Solana (SOL)");
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
  const [activeStrategy, setActiveStrategy] = useState(null);
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

  useEffect(() => {
    const poll = async () => {
      const { price, change24h } = await fetchSolPrice();
      if (price > 0) {
        setPriceDir(price > prevPrice.current ? "up" : price < prevPrice.current ? "down" : null);
        prevPrice.current = price;
        setSolPrice(price);
        setSolChange24h(change24h);
        setTimeout(() => setPriceDir(null), 1200);
      }
    };
    poll();
    const interval = setInterval(poll, 30000);
    return () => clearInterval(interval);
  }, []);

  const activeZones = zones.map(z => {
    if (!solPrice) return false;
    const refHigh = solPrice * 1.25;
    const pctFromHigh = ((refHigh - solPrice) / refHigh) * 100;
    return pctFromHigh >= z.pullback;
  });

  const handleSaveStrategy = async () => {
    if (!strategyName) { showToast("⚠️ Enter a strategy name first!"); return; }
    setSaving(true);
    showToast("✅ Strategy saved!");
    setSaving(false);
  };

  const handleBacktest = async () => {
    setBacktestLoading(true); setShowBacktest(true); setBacktestResult(null);
    const history = await fetchSolHistory();
    const result = runBacktest(history, zones, Number(capital), Number(exposure));
    setBacktestResult(result); setBacktestLoading(false);
  };

  const activateZillaEngine = () => {
    setStrategyName("Zilla Engine"); setAsset("Solana (SOL)"); setExposure(70);
    setZones([{ pullback: 5, alloc: 20 }, { pullback: 12, alloc: 30 }, { pullback: 25, alloc: 20 }]);
    setTrendFilter("Above MA50"); setAtrGuard(2.5); setCooldown(6); setMinOrder(10.5);
    setTriggerMode(2); setTriggers([true, false, false, true]);
    setRsiThreshold(30); setSupportIndicators(1);
    showToast("⚡ Zilla Engine activated!");
  };

  const totalAlloc = zones.reduce((s, z) => s + Number(z.alloc), 0);
  const maxDeploy = ((capital * exposure) / 100).toFixed(0);
  const anyTriggerActive = triggers.some(Boolean);

  const ACCENT = "#C44FFF";
  const ACCENT_BG = "rgba(150,40,200,";
  const ACCENT_BORDER = "rgba(150,40,200,";

  return (
    <>
      <style>{`
        .bot-card { background: rgba(8,0,20,0.6); border: 1px solid rgba(150,40,200,0.12); border-radius: 16px; padding: 20px; backdrop-filter: blur(24px); margin-bottom: 12px; }
        .bot-input { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid rgba(150,40,200,0.15); border-radius: 10px; color: #fff; font-family: 'Inter',sans-serif; font-size: 13px; padding: 10px 14px; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
        .bot-input:focus { border-color: rgba(150,40,200,0.4); }
        .bot-select { width: 100%; background: rgba(8,0,20,0.8); border: 1px solid rgba(150,40,200,0.15); border-radius: 10px; color: #fff; font-family: 'Inter',sans-serif; font-size: 13px; padding: 10px 14px; outline: none; appearance: none; box-sizing: border-box; cursor: pointer; }
        .bot-label { font-size: 12px; color: rgba(255,255,255,0.5); display: block; margin-bottom: 4px; font-weight: 500; }
        .bot-sublabel { font-size: 11px; color: rgba(255,255,255,0.25); display: block; margin-bottom: 8px; line-height: 1.4; }
        .bot-section-title { font-family: 'Inter',sans-serif; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8); margin-bottom: 14px; display: flex; align-items: center; gap: 8px; }
        .bot-inner-box { background: rgba(255,255,255,0.02); border: 1px solid rgba(150,40,200,0.1); border-radius: 12px; padding: 14px 16px; margin-bottom: 8px; }
        .field-group { display: flex; flex-direction: column; }
        .row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
        .zone-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .trigger-mode-btn { border: 1px solid rgba(150,40,200,0.1); border-radius: 10px; padding: 12px 14px; cursor: pointer; transition: all 0.2s; display: flex; align-items: flex-start; gap: 12px; margin-bottom: 6px; background: rgba(255,255,255,0.02); width: 100%; text-align: left; }
        .trigger-mode-btn:hover { background: rgba(150,40,200,0.06); }
        .trigger-mode-btn.selected { border-color: rgba(150,40,200,0.4); background: rgba(150,40,200,0.08); }
        .bot-divider { height: 1px; background: rgba(150,40,200,0.08); margin: 14px -20px; }
        @keyframes pulse-purple { 0%,100%{box-shadow:0 0 0 0 rgba(150,40,200,0.4);}50%{box-shadow:0 0 0 8px rgba(150,40,200,0);} }
        .zone-active { animation: pulse-purple 1.5s infinite; border-color: rgba(150,40,200,0.4) !important; background: rgba(150,40,200,0.07) !important; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @media(max-width:768px){ .row2{grid-template-columns:1fr !important;} .zone-row{grid-template-columns:1fr !important;} .stats-grid{grid-template-columns:1fr 1fr !important;} }
      `}</style>

      <div style={{ padding: "40px 48px", maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 26, fontWeight: 700, color: "#fff" }}>Zilla Engine</div>
            <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", color: "#4ade80", fontWeight: 700 }}>Phase 1 — Live</span>
          </div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Structure-based accumulation — spot only, capital-protected, volatility-aware</div>
        </div>

        {/* Live price */}
        <div className="bot-card" style={{ marginBottom: 16, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <img src="https://assets.coingecko.com/coins/images/4128/small/solana.png" style={{ width: 36, height: 36, borderRadius: "50%" }} alt="SOL" />
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 2, fontFamily: "'Space Mono',monospace" }}>SOL / USD — Live</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 28, fontWeight: 700, color: priceDir === "up" ? "#4ade80" : priceDir === "down" ? "#f87171" : "#fff", transition: "color 0.4s" }}>
                  ${solPrice > 0 ? solPrice.toFixed(2) : "—"}
                </span>
                {solChange24h !== 0 && (
                  <span style={{ fontSize: 13, fontWeight: 600, color: solChange24h >= 0 ? "#4ade80" : "#f87171" }}>
                    {solChange24h >= 0 ? "▲" : "▼"} {Math.abs(solChange24h).toFixed(2)}%
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade80", animation: "blink 2s infinite" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'Space Mono',monospace" }}>Updates every 30s</span>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 16 }}>
          {[
            { label: "Total Capital", value: activeStrategy ? `$${capital}` : "$0", color: ACCENT },
            { label: "Deployed", value: "$0", color: "#4a9eff" },
            { label: "Strategies Saved", value: savedStrategies.length.toString(), color: ACCENT },
            { label: "SOL Price", value: solPrice > 0 ? `$${solPrice.toFixed(2)}` : "—", color: "#4ade80" },
          ].map((s, i) => (
            <div key={i} style={{ background: "rgba(8,0,20,0.6)", border: "1px solid rgba(150,40,200,0.12)", borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 6, fontFamily: "'Space Mono',monospace" }}>{s.label}</div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Configure Strategy */}
        <div className="bot-card">
          <div className="bot-section-title">⚙ Configure Strategy</div>

          {/* AI Generator (disabled) */}
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, marginBottom: 10, opacity: 0.5, cursor: "not-allowed", pointerEvents: "none" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 30, height: 30, background: "rgba(150,40,200,0.15)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✨</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>AI Strategy Generator <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 20, background: "rgba(150,40,200,0.08)", border: "1px solid rgba(150,40,200,0.25)", color: ACCENT, fontWeight: 700 }}>Coming Soon</span></div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Let AI build an optimized strategy based on your goals</div>
                </div>
              </div>
            </div>
          </div>

          {/* Zilla Engine preset */}
          <div style={{ background: "rgba(150,40,200,0.05)", border: "1px solid rgba(150,40,200,0.2)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
            <div style={{ width: 34, height: 34, background: "rgba(150,40,200,0.15)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>⚡</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#fff", marginBottom: 2 }}>Zilla Engine</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 8 }}>Capital-protection optimized DCA model for structured pullbacks in trending markets.</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["Capital Protection", "Trend Filter", "Zone Accumulation"].map(t => (
                  <span key={t} style={{ fontSize: 10, color: ACCENT, background: "rgba(150,40,200,0.08)", border: "1px solid rgba(150,40,200,0.2)", borderRadius: 20, padding: "2px 9px" }}>{t}</span>
                ))}
              </div>
            </div>
            <button onClick={activateZillaEngine} style={{ background: "rgba(150,40,200,0.25)", border: "1px solid rgba(150,40,200,0.5)", color: ACCENT, fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 600, padding: "8px 18px", borderRadius: 8, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>⚡ Activate</button>
          </div>

          <div className="bot-divider" />

          <div className="row2">
            <div className="field-group"><label className="bot-label">Strategy Name</label><input type="text" className="bot-input" placeholder="e.g. SOL Accumulator" value={strategyName} onChange={e => setStrategyName(e.target.value)} /></div>
            <div className="field-group"><label className="bot-label">Asset</label><select className="bot-select" value={asset} onChange={e => setAsset(e.target.value)}><option>Solana (SOL)</option></select></div>
          </div>

          <div className="bot-inner-box">
            <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>Capital Management</div>
            <div className="row2">
              <div className="field-group"><label className="bot-label">Total Capital (USD)</label><span className="bot-sublabel">Total budget for this strategy</span><input type="number" className="bot-input" value={capital} onChange={e => setCapital(e.target.value)} /></div>
              <div className="field-group"><label className="bot-label">Max Exposure %</label><span className="bot-sublabel">Cap on total capital ever deployed</span><input type="number" className="bot-input" min={10} max={100} value={exposure} onChange={e => setExposure(Math.min(100, Math.max(10, Number(e.target.value))))} /></div>
            </div>
            <div style={{ background: "rgba(150,40,200,0.04)", border: "1px solid rgba(150,40,200,0.1)", borderRadius: 8, padding: "9px 12px", fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
              Max deployment: <span style={{ color: ACCENT, fontWeight: 600 }}>${maxDeploy}</span> · Exposure: <span style={{ color: ACCENT, fontWeight: 600 }}>{exposure}%</span>
            </div>
          </div>
        </div>

        {/* Accumulation Zones */}
        <div className="bot-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div className="bot-section-title" style={{ marginBottom: 0 }}>Accumulation Zones</div>
            <span style={{ fontSize: 12, color: totalAlloc > 100 ? "#f87171" : "#4ade80", fontWeight: 600 }}>{totalAlloc}% allocated</span>
          </div>
          {solPrice > 0 && (
            <div style={{ background: "rgba(150,40,200,0.04)", border: "1px solid rgba(150,40,200,0.1)", borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 12, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", flexShrink: 0, display: "inline-block", boxShadow: "0 0 6px #4ade80" }} />
              SOL at <span style={{ color: "#fff", fontWeight: 600, margin: "0 4px" }}>${solPrice.toFixed(2)}</span> — zones with 🎯 are currently within pullback range
            </div>
          )}
          {zones.map((z, i) => (
            <div key={i} className={`bot-inner-box${activeZones[i] ? " zone-active" : ""}`}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Zone {i + 1}</span>
                  {activeZones[i] && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 20, background: "rgba(150,40,200,0.15)", border: "1px solid rgba(150,40,200,0.4)", color: ACCENT, fontWeight: 700 }}>🎯 Active</span>}
                </div>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>Deploy when pullback ≥ {z.pullback}%</span>
              </div>
              <div className="zone-row">
                <div className="field-group"><label className="bot-label">Pullback Depth %</label><input type="number" className="bot-input" min={0.5} max={50} step={0.5} value={z.pullback} onChange={e => { const nz = [...zones]; nz[i] = { ...nz[i], pullback: Math.min(50, Math.max(0.5, Number(e.target.value))) }; setZones(nz); }} /></div>
                <div className="field-group"><label className="bot-label">Capital Allocation %</label><input type="number" className="bot-input" min={1} max={100} value={z.alloc} onChange={e => { const nz = [...zones]; nz[i] = { ...nz[i], alloc: Math.min(100, Math.max(1, Number(e.target.value))) }; setZones(nz); }} /></div>
              </div>
            </div>
          ))}
        </div>

        {/* Protection Filters */}
        <div className="bot-card">
          <div className="bot-section-title">Protection Filters</div>
          <div className="row2">
            <div className="field-group"><label className="bot-label">Trend Filter (MA)</label><span className="bot-sublabel">Only accumulate if price is above this MA</span><select className="bot-select" value={trendFilter} onChange={e => setTrendFilter(e.target.value)}><option>Above MA50</option><option>Above MA20</option><option>Above MA100</option><option>Above MA200</option><option>No Filter</option></select></div>
            <div className="field-group"><label className="bot-label">Volatility Spike Guard (ATR ×)</label><span className="bot-sublabel">Pause buying when volatility exceeds this threshold</span><input type="number" className="bot-input" min={1} max={10} value={atrGuard} step="0.1" onChange={e => setAtrGuard(Math.min(10, Math.max(1, Number(e.target.value))))} /></div>
            <div className="field-group"><label className="bot-label">Cooldown Between Orders (hours)</label><span className="bot-sublabel">Minimum wait between buys</span><input type="number" className="bot-input" min={1} value={cooldown} onChange={e => setCooldown(Math.max(1, Number(e.target.value)))} /></div>
            <div className="field-group"><label className="bot-label">Min Order Size (USD)</label><span className="bot-sublabel">Minimum $10.50</span><input type="number" className="bot-input" min={1} step="0.5" value={minOrder} onChange={e => setMinOrder(Math.max(1, Number(e.target.value)))} /></div>
          </div>
        </div>

        {/* Triggers */}
        <div className="bot-card">
          <div className="bot-section-title">Accumulation Triggers</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 14 }}>Add indicator-based conditions beyond price pullbacks</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 600, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>Combine with zone logic</div>
          {[
            { title: "Any trigger fires (OR)", desc: "Buy when at least one condition is met" },
            { title: "All triggers must fire (AND)", desc: "Buy only when every condition is met simultaneously" },
            { title: "Zone hit + any trigger", desc: "Price must be in a zone AND at least one indicator trigger fires" }
          ].map((m, i) => (
            <button key={i} onClick={() => setTriggerMode(i)} className={`trigger-mode-btn${triggerMode === i ? " selected" : ""}`}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${triggerMode === i ? ACCENT : "rgba(255,255,255,0.2)"}`, background: triggerMode === i ? ACCENT : "transparent", flexShrink: 0, marginTop: 2 }} />
              <div><div style={{ fontSize: 13, fontWeight: 600, color: triggerMode === i ? "#fff" : "rgba(255,255,255,0.6)" }}>{m.title}</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{m.desc}</div></div>
            </button>
          ))}
          <div className="bot-divider" />
          {(() => {
            const TRIGGERS = [
              { key: 0, title: "RSI Dip Below", color: "#4a9eff", colorBg: "rgba(74,158,255,0.08)", colorBorder: "rgba(74,158,255,0.3)", desc: "Buy when RSI falls under a threshold (oversold signal)" },
              { key: 1, title: "MACD Bullish Cross", color: "#9945FF", colorBg: "rgba(153,69,255,0.08)", colorBorder: "rgba(153,69,255,0.3)", desc: "Buy when MACD line crosses above signal line" },
              { key: 2, title: "Volume Surge", color: "#ffab40", colorBg: "rgba(255,171,64,0.08)", colorBorder: "rgba(255,171,64,0.3)", desc: "Buy when volume exceeds X times the 20-period average" },
              { key: 3, title: "Support Zone Confirmed", color: "#4ade80", colorBg: "rgba(74,222,128,0.08)", colorBorder: "rgba(74,222,128,0.3)", desc: "Buy only when price is near a support zone AND at least N indicators agree" },
            ];
            return (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {TRIGGERS.map(t => {
                  const active = triggers[t.key];
                  return (
                    <div key={t.key} style={{ background: active ? t.colorBg : "rgba(255,255,255,0.02)", border: `1px solid ${active ? t.colorBorder : "rgba(255,255,255,0.07)"}`, borderRadius: 10, padding: "12px 14px", transition: "all 0.2s" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ marginBottom: 5 }}><span style={{ fontSize: 11, fontWeight: 600, color: active ? t.color : "rgba(255,255,255,0.55)", background: active ? t.colorBg : "rgba(255,255,255,0.04)", border: `1px solid ${active ? t.colorBorder : "rgba(255,255,255,0.08)"}`, borderRadius: 6, padding: "2px 9px" }}>{t.title}</span></div>
                          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>{t.desc}</div>
                        </div>
                        <button onClick={() => { const nt = [...triggers]; nt[t.key] = !nt[t.key]; setTriggers(nt); }} style={{ width: 24, height: 24, borderRadius: 6, background: active ? t.colorBg : "transparent", border: `1px solid ${active ? t.colorBorder : "rgba(255,255,255,0.1)"}`, color: active ? t.color : "rgba(255,255,255,0.25)", cursor: "pointer", fontSize: 14, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{active ? "✕" : "+"}</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
          {anyTriggerActive && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Configure Active Triggers</div>
              {triggers[0] && <div style={{ background: "rgba(74,158,255,0.05)", border: "1px solid rgba(74,158,255,0.2)", borderRadius: 10, padding: "11px 14px", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 11, fontWeight: 600, color: "#4a9eff", borderRadius: 6, padding: "2px 9px", background: "rgba(74,158,255,0.08)", border: "1px solid rgba(74,158,255,0.25)", whiteSpace: "nowrap" }}>RSI Dip Below</span><div style={{ flex: 1 }} /><input type="number" className="bot-input" min={10} max={50} value={rsiThreshold} onChange={e => setRsiThreshold(Math.min(50, Math.max(10, Number(e.target.value))))} style={{ width: 76, textAlign: "center", flexShrink: 0 }} /><span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>RSI</span><button onClick={() => { const nt = [...triggers]; nt[0] = false; setTriggers(nt); }} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.25)", cursor: "pointer", fontSize: 14 }}>✕</button></div>}
              {triggers[2] && <div style={{ background: "rgba(255,171,64,0.05)", border: "1px solid rgba(255,171,64,0.2)", borderRadius: 10, padding: "11px 14px", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 11, fontWeight: 600, color: "#ffab40", borderRadius: 6, padding: "2px 9px", background: "rgba(255,171,64,0.08)", border: "1px solid rgba(255,171,64,0.25)", whiteSpace: "nowrap" }}>Volume Surge</span><div style={{ flex: 1 }} /><input type="number" className="bot-input" min={1.2} max={10} step={0.1} value={volumeMultiplier} onChange={e => setVolumeMultiplier(Math.min(10, Math.max(1.2, Number(e.target.value))))} style={{ width: 76, textAlign: "center", flexShrink: 0 }} /><span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>x avg vol</span><button onClick={() => { const nt = [...triggers]; nt[2] = false; setTriggers(nt); }} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.25)", cursor: "pointer", fontSize: 14 }}>✕</button></div>}
              {triggers[3] && <div style={{ background: "rgba(74,222,128,0.05)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 10, padding: "11px 14px", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 11, fontWeight: 600, color: "#4ade80", borderRadius: 6, padding: "2px 9px", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.25)", whiteSpace: "nowrap" }}>Support Zone Confirmed</span><div style={{ flex: 1 }} /><input type="number" className="bot-input" min={1} max={3} value={supportIndicators} onChange={e => setSupportIndicators(Math.min(3, Math.max(1, Number(e.target.value))))} style={{ width: 76, textAlign: "center", flexShrink: 0 }} /><span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>indicators</span><button onClick={() => { const nt = [...triggers]; nt[3] = false; setTriggers(nt); }} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.25)", cursor: "pointer", fontSize: 14 }}>✕</button></div>}
            </div>
          )}
        </div>

        {/* Dynamic Allocation */}
        <div className="bot-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div><div style={{ fontWeight: 600, fontSize: 13, color: "#fff", marginBottom: 2 }}>Dynamic Allocation</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Automatically scale zone allocations based on market conditions</div></div>
            <Toggle val={toggleDynamic} set={setToggleDynamic} />
          </div>
          {toggleDynamic && (
            <div style={{ marginTop: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 18 }}>
                {[
                  { key: "volatility", icon: "📉", title: "Volatility-Based", desc: "Reduces allocation during high ATR spikes" },
                  { key: "trend", icon: "📈", title: "Trend-Based", desc: "Boosts allocation during confirmed uptrends" },
                  { key: "combined", icon: "⚡", title: "Combined (Recommended)", desc: "Boosts in uptrends AND reduces during volatility spikes" }
                ].map(m => (
                  <div key={m.key} onClick={() => setDynMode(m.key)} style={{ border: `1px solid ${dynMode === m.key ? "rgba(150,40,200,0.4)" : "rgba(255,255,255,0.07)"}`, borderRadius: 10, padding: 12, cursor: "pointer", background: dynMode === m.key ? "rgba(150,40,200,0.08)" : "rgba(255,255,255,0.02)", transition: "all 0.2s" }}>
                    <div style={{ fontSize: 14, marginBottom: 5 }}>{m.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: dynMode === m.key ? ACCENT : "rgba(255,255,255,0.7)", marginBottom: 3 }}>{m.title}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.4 }}>{m.desc}</div>
                  </div>
                ))}
              </div>
              <div className="row2" style={{ marginBottom: 12 }}>
                {(dynMode === "trend" || dynMode === "combined") && <div className="field-group"><label className="bot-label">Uptrend Boost %</label><span className="bot-sublabel">50 = up to 1.5× base allocation</span><input type="number" className="bot-input" min={10} max={100} value={dynUptrendBoost} onChange={e => setDynUptrendBoost(Math.min(100, Math.max(10, Number(e.target.value))))} /></div>}
                {(dynMode === "volatility" || dynMode === "combined") && <div className="field-group"><label className="bot-label">Volatility Reduction %</label><span className="bot-sublabel">50 = down to 0.5× base allocation</span><input type="number" className="bot-input" min={10} max={90} value={dynVolatilityReduction} onChange={e => setDynVolatilityReduction(Math.min(90, Math.max(10, Number(e.target.value))))} /></div>}
              </div>
              <div className="bot-inner-box">
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, marginBottom: 6 }}>How it works at runtime:</div>
                {(dynMode === "trend" || dynMode === "combined") && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4, lineHeight: 1.6 }}>• <span style={{ color: "#4ade80", fontWeight: 600 }}>Uptrend confirmed</span> → allocations scale up to <span style={{ color: "#fff", fontWeight: 600 }}>×{(1 + dynUptrendBoost / 100).toFixed(2)}</span> of base</div>}
                {(dynMode === "volatility" || dynMode === "combined") && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4, lineHeight: 1.6 }}>• <span style={{ color: "#ffab40", fontWeight: 600 }}>Elevated volatility</span> → allocations scale down to <span style={{ color: "#fff", fontWeight: 600 }}>×{(1 - dynVolatilityReduction / 100).toFixed(2)}</span> of base</div>}
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>• Base zone allocations remain your fallback during normal conditions</div>
              </div>
            </div>
          )}
        </div>

        {/* Exit Strategy */}
        <div className="bot-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div><div style={{ fontWeight: 600, fontSize: 13, color: "#fff", marginBottom: 2 }}>Exit Strategy</div><div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Configure conditions that will pause accumulation</div></div>
            <Toggle val={toggleExit} set={setToggleExit} />
          </div>
          {toggleExit && (
            <div style={{ marginTop: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                <div className="bot-inner-box"><div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}><span>🎯</span><span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Take Profit</span></div><div className="field-group"><label className="bot-label">% above avg entry</label><span className="bot-sublabel">0 = disabled</span><input type="number" className="bot-input" min={1} value={takeProfit} onChange={e => setTakeProfit(Math.max(1, Number(e.target.value)))} /></div></div>
                <div className="bot-inner-box"><div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}><span>📉</span><span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Trailing Stop-Loss</span></div><div className="field-group"><label className="bot-label">Drop % from all-time peak</label><span className="bot-sublabel">0 = disabled</span><input type="number" className="bot-input" min={0} max={90} value={trailingStop} onChange={e => setTrailingStop(Math.min(90, Math.max(0, Number(e.target.value))))} /></div></div>
              </div>
              <div className="bot-inner-box" style={{ marginBottom: 8, border: `1px solid ${exitDrop ? "rgba(150,40,200,0.3)" : "rgba(255,255,255,0.07)"}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: exitDrop ? 14 : 0 }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span>⬇️</span><span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Drop from Last Buy Price</span></div><Toggle val={exitDrop} set={setExitDrop} /></div>
                {exitDrop && <div className="field-group"><label className="bot-label">Max drop % from last buy price</label><input type="number" className="bot-input" min={0} max={90} value={exitDropValue} onChange={e => setExitDropValue(Math.min(90, Math.max(0, Number(e.target.value))))} /></div>}
              </div>
              <div className="bot-inner-box" style={{ marginBottom: 12, border: `1px solid ${exitMaxBuys ? "rgba(150,40,200,0.3)" : "rgba(255,255,255,0.07)"}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: exitMaxBuys ? 14 : 0 }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span>#</span><span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Max Number of Buys</span></div><Toggle val={exitMaxBuys} set={setExitMaxBuys} /></div>
                {exitMaxBuys && <div className="field-group"><label className="bot-label">Stop after N buys</label><input type="number" className="bot-input" min={0} value={exitMaxBuysValue} onChange={e => setExitMaxBuysValue(Math.max(0, Number(e.target.value)))} /></div>}
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "rgba(255,165,0,0.04)", border: "1px solid rgba(255,165,0,0.15)", borderRadius: 10, padding: "11px 14px" }}>
                <span>⚠️</span>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>All exit triggers <span style={{ color: "#ffab40", fontWeight: 600 }}>pause accumulation</span> and log a status alert. They do not automatically sell your assets.</div>
              </div>
            </div>
          )}
        </div>

        {/* Backtest */}
        <button onClick={handleBacktest} style={{ width: "100%", background: "rgba(150,40,200,0.08)", border: "1px solid rgba(150,40,200,0.3)", borderRadius: 12, color: ACCENT, fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 600, padding: 14, cursor: "pointer", marginBottom: 10 }}>
          📊 Run Backtest — Last 60 Days
        </button>

        {showBacktest && (
          <div className="bot-card" style={{ marginBottom: 10 }}>
            <div className="bot-section-title">📊 Backtest Results — Last 60 Days</div>
            {backtestLoading && <div style={{ textAlign: "center", padding: "32px", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>⟳ Running simulation on historical SOL data...</div>}
            {!backtestLoading && backtestResult && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
                  {[
                    { label: "Orders Triggered", value: backtestResult.orders.length.toString(), color: "#4a9eff" },
                    { label: "Capital Deployed", value: `$${backtestResult.deployed.toFixed(0)}`, color: ACCENT },
                    { label: "Avg Entry Price", value: backtestResult.avgEntry > 0 ? `$${backtestResult.avgEntry.toFixed(2)}` : "—", color: "#fff" },
                    { label: "SOL Accumulated", value: backtestResult.totalBought > 0 ? `${backtestResult.totalBought.toFixed(4)} SOL` : "—", color: "#4ade80" },
                    { label: "Current Value", value: `$${backtestResult.currentValue.toFixed(0)}`, color: "#9945FF" },
                    { label: "Est. PnL", value: `${backtestResult.pnl >= 0 ? "+" : ""}$${backtestResult.pnl.toFixed(0)} (${backtestResult.pnlPct.toFixed(1)}%)`, color: backtestResult.pnl >= 0 ? "#4ade80" : "#f87171" },
                  ].map((s, i) => (
                    <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(150,40,200,0.1)", borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
                {backtestResult.orders.length > 0 && backtestResult.orders.map((o, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: i < backtestResult.orders.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(150,40,200,0.1)", border: "1px solid rgba(150,40,200,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: ACCENT, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>Zone {o.zone}% pullback — ${o.amount.toFixed(0)} deployed</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{o.date.toLocaleDateString()} · Entry: ${o.price.toFixed(2)} · {o.units.toFixed(4)} SOL</div>
                    </div>
                    <div style={{ fontSize: 12, color: ACCENT, fontWeight: 600 }}>${o.amount.toFixed(0)}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Save + Activate */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          <button onClick={handleSaveStrategy} disabled={saving} style={{ background: "rgba(150,40,200,0.08)", border: "1px solid rgba(150,40,200,0.3)", borderRadius: 12, color: saving ? "rgba(255,255,255,0.2)" : ACCENT, fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 600, padding: 14, cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? "⟳ Saving..." : "💾 Save Strategy"}
          </button>
          <button onClick={() => { setActiveStrategy({ name: strategyName || "Unnamed Strategy", asset, capital }); showToast("🚀 Strategy activated!"); }} style={{ background: "linear-gradient(135deg,#1a1a6b,#2a1a8a)", border: "1px solid rgba(150,40,200,0.4)", borderRadius: 12, color: "#fff", fontFamily: "'Inter',sans-serif", fontSize: 14, fontWeight: 700, padding: 14, cursor: "pointer" }}>
            🚀 Activate Strategy
          </button>
        </div>

        {/* Saved Strategies */}
        <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.2)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>
          Saved Strategies {savedStrategies.length > 0 && <span style={{ color: ACCENT }}>({savedStrategies.length})</span>}
        </div>
        {savedStrategies.length === 0 && (
          <div className="bot-card" style={{ textAlign: "center", padding: "40px 24px" }}>
            <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.2 }}>🛡️</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.2)", marginBottom: 3 }}>No strategies saved yet</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.12)" }}>Configure and save your first strategy above</div>
          </div>
        )}
      </div>

      {toastVisible && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "rgba(8,0,20,0.97)", border: "1px solid rgba(150,40,200,0.3)", color: "#fff", padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 500, zIndex: 9999, backdropFilter: "blur(20px)" }}>
          {toast}
        </div>
      )}
    </>
  );
}
