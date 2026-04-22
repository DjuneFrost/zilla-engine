"use client";
import { useState } from "react";
import Link from "next/link";

const PRESETS = [
  {
    id: "zilla",
    name: "Zilla Engine",
    desc: "Capital-protection DCA for structured pullbacks in trending markets.",
    tags: ["Conservative", "Zone-Based", "Trend Filter"],
    config: { exposure: 70, zones: [{ pullback: 5, alloc: 20 }, { pullback: 12, alloc: 30 }, { pullback: 25, alloc: 20 }], cooldown: 6, trendFilter: "Above MA50" },
  },
  {
    id: "aggressive",
    name: "Bull Run Mode",
    desc: "Higher exposure for faster accumulation during confirmed uptrends.",
    tags: ["Aggressive", "High Exposure", "Uptrend"],
    config: { exposure: 90, zones: [{ pullback: 3, alloc: 30 }, { pullback: 8, alloc: 35 }, { pullback: 15, alloc: 25 }], cooldown: 2, trendFilter: "No Filter" },
  },
  {
    id: "conservative",
    name: "Capital Shield",
    desc: "Deep pullback zones only. 50% max exposure. Extreme capital protection.",
    tags: ["Ultra Safe", "Deep Zones", "Low Exposure"],
    config: { exposure: 50, zones: [{ pullback: 10, alloc: 15 }, { pullback: 20, alloc: 20 }, { pullback: 35, alloc: 15 }], cooldown: 12, trendFilter: "Above MA200" },
  },
];

const TOKENS = [
  { symbol: "SOL", name: "Solana", logo: "https://assets.coingecko.com/coins/images/4128/small/solana.png" },
  { symbol: "HYPE", name: "HyperLiquid", logo: "https://assets.coingecko.com/coins/images/36658/small/hyperliquid.png" },
];

export default function StrategyBuilder() {
  const [selectedPreset, setSelectedPreset] = useState("zilla");
  const [token, setToken] = useState("SOL");
  const [strategyName, setStrategyName] = useState("");
  const [capital, setCapital] = useState(1000);
  const [exposure, setExposure] = useState(70);
  const [zones, setZones] = useState([
    { pullback: 5, alloc: 20 },
    { pullback: 12, alloc: 30 },
    { pullback: 25, alloc: 20 },
  ]);
  const [cooldown, setCooldown] = useState(6);
  const [trendFilter, setTrendFilter] = useState("Above MA50");
  const [takeProfit, setTakeProfit] = useState(0);
  const [trailingStop, setTrailingStop] = useState(0);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState("");

  const applyPreset = (preset) => {
    setSelectedPreset(preset.id);
    setExposure(preset.config.exposure);
    setZones(preset.config.zones);
    setCooldown(preset.config.cooldown);
    setTrendFilter(preset.config.trendFilter);
    setStrategyName(preset.name);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleSave = () => {
    if (!strategyName) { showToast("⚠️ Enter a strategy name"); return; }
    setSaved(true);
    showToast("✓ Strategy saved — go to Backtester to simulate it");
  };

  const totalAlloc = zones.reduce((s, z) => s + z.alloc, 0);
  const maxDeploy = ((capital * exposure) / 100).toFixed(0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; color: #fff; font-family: 'DM Sans', sans-serif; }
        .ze-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 0 32px; height: 56px; background: rgba(8,8,8,0.95); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.06); }
        .ze-logo { font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 3px; color: #fff; text-decoration: none; }
        .ze-logo span { color: rgba(255,255,255,0.3); }
        .nav-links { display: flex; gap: 4px; }
        .nav-link { padding: 6px 14px; border-radius: 7px; font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.4); text-decoration: none; transition: all 0.15s; }
        .nav-link:hover { color: #fff; background: rgba(255,255,255,0.05); }
        .nav-link.active { color: #fff; background: rgba(255,255,255,0.08); }
        .content { max-width: 1000px; margin: 0 auto; padding: 76px 32px 60px; }
        .page-header { margin-bottom: 32px; }
        .page-title { font-family: 'Bebas Neue', sans-serif; font-size: 40px; letter-spacing: 2px; margin-bottom: 4px; }
        .page-sub { font-size: 13px; color: rgba(255,255,255,0.3); }

        /* PRESETS */
        .presets { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 28px; }
        .preset { border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 20px; cursor: pointer; transition: all 0.15s; background: rgba(255,255,255,0.02); }
        .preset:hover { border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.04); }
        .preset.active { border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.06); }
        .preset-name { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 6px; }
        .preset-desc { font-size: 12px; color: rgba(255,255,255,0.35); line-height: 1.5; margin-bottom: 12px; }
        .preset-tags { display: flex; gap: 5px; flex-wrap: wrap; }
        .preset-tag { font-size: 10px; padding: 2px 8px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.35); }

        /* FORM */
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .card { border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; overflow: hidden; margin-bottom: 16px; }
        .card-header { padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 1px; }
        .card-body { padding: 20px; }
        .field { margin-bottom: 14px; }
        .field:last-child { margin-bottom: 0; }
        .field-label { font-size: 11px; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: block; }
        .field-input { width: 100%; padding: 10px 14px; border-radius: 9px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04); color: #fff; font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; transition: border-color 0.2s; }
        .field-input:focus { border-color: rgba(255,255,255,0.2); }
        .field-select { width: 100%; padding: 10px 14px; border-radius: 9px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04); color: #fff; font-family: 'DM Sans', sans-serif; font-size: 13px; outline: none; appearance: none; }
        .token-btns { display: flex; gap: 8px; }
        .token-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px; padding: 10px; border-radius: 9px; border: 1px solid rgba(255,255,255,0.08); background: transparent; color: rgba(255,255,255,0.4); font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .token-btn.active { border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.07); color: #fff; }
        .token-btn img { width: 18px; height: 18px; border-radius: 50%; }
        .zone-row-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; }
        .zone-n-label { font-size: 10px; color: rgba(255,255,255,0.2); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .alloc-bar { height: 3px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; margin-bottom: 14px; }
        .alloc-bar-fill { height: 100%; background: ${(a) => a > 100 ? '#ff6b6b' : '#fff'}; border-radius: 2px; transition: width 0.3s; }
        .alloc-note { font-size: 11px; color: rgba(255,255,255,0.3); margin-bottom: 16px; }
        .deploy-note { font-size: 12px; color: rgba(255,255,255,0.25); padding: 10px 14px; border: 1px solid rgba(255,255,255,0.06); border-radius: 9px; font-family: 'JetBrains Mono', monospace; }
        .save-btn { width: 100%; padding: 14px; border-radius: 10px; background: #fff; color: #080808; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 700; border: none; cursor: pointer; transition: all 0.2s; margin-bottom: 10px; }
        .save-btn:hover { background: rgba(255,255,255,0.88); }
        .bt-link { display: block; width: 100%; padding: 13px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); font-size: 14px; font-weight: 500; text-align: center; text-decoration: none; transition: all 0.2s; }
        .bt-link:hover { border-color: rgba(255,255,255,0.25); color: #fff; }
        .toast { position: fixed; bottom: 24px; right: 24px; padding: 12px 20px; border-radius: 10px; background: #fff; color: #080808; font-size: 13px; font-weight: 600; z-index: 9999; animation: slideIn 0.2s ease; }
        @keyframes slideIn { from{transform:translateY(10px);opacity:0} to{transform:translateY(0);opacity:1} }

        @media(max-width:768px){ .content{padding:72px 16px 60px;} .presets{grid-template-columns:1fr;} .form-grid{grid-template-columns:1fr;} }
      `}</style>

      <nav className="ze-nav">
        <Link href="/" className="ze-logo">ZILLA <span>ENGINE</span></Link>
        <div className="nav-links">
          <Link href="/dashboard" className="nav-link">Dashboard</Link>
          <Link href="/backtester" className="nav-link">Backtester</Link>
          <Link href="/strategy" className="nav-link active">Strategy</Link>
        </div>
      </nav>

      <div className="content">
        <div className="page-header">
          <div className="page-title">Strategy Builder</div>
          <div className="page-sub">Configure your accumulation strategy — then backtest it on real price data</div>
        </div>

        {/* Presets */}
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>Quick Presets</div>
        <div className="presets">
          {PRESETS.map(p => (
            <div key={p.id} className={`preset${selectedPreset === p.id ? " active" : ""}`} onClick={() => applyPreset(p)}>
              <div className="preset-name">{p.name}</div>
              <div className="preset-desc">{p.desc}</div>
              <div className="preset-tags">{p.tags.map(t => <span key={t} className="preset-tag">{t}</span>)}</div>
            </div>
          ))}
        </div>

        <div className="form-grid">
          {/* LEFT */}
          <div>
            {/* Basic info */}
            <div className="card">
              <div className="card-header">Basic Info</div>
              <div className="card-body">
                <div className="field">
                  <span className="field-label">Strategy Name</span>
                  <input className="field-input" type="text" placeholder="e.g. SOL Bull Run" value={strategyName} onChange={e => setStrategyName(e.target.value)} />
                </div>
                <div className="field">
                  <span className="field-label">Token</span>
                  <div className="token-btns">
                    {TOKENS.map(t => (
                      <button key={t.symbol} className={`token-btn${token === t.symbol ? " active" : ""}`} onClick={() => setToken(t.symbol)}>
                        <img src={t.logo} alt={t.symbol} onError={e => e.target.style.display="none"} />
                        {t.symbol}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <span className="field-label">Total Capital (USD)</span>
                  <input className="field-input" type="number" value={capital} onChange={e => setCapital(Number(e.target.value))} />
                </div>
                <div className="field">
                  <span className="field-label">Max Exposure %</span>
                  <input className="field-input" type="number" min={10} max={100} value={exposure} onChange={e => setExposure(Math.min(100, Math.max(10, Number(e.target.value))))} />
                </div>
                <div className="deploy-note">Max deployable: ${maxDeploy}</div>
              </div>
            </div>

            {/* Filters */}
            <div className="card">
              <div className="card-header">Protection Filters</div>
              <div className="card-body">
                <div className="field">
                  <span className="field-label">Trend Filter</span>
                  <select className="field-select" value={trendFilter} onChange={e => setTrendFilter(e.target.value)}>
                    <option>No Filter</option>
                    <option>Above MA20</option>
                    <option>Above MA50</option>
                    <option>Above MA100</option>
                    <option>Above MA200</option>
                  </select>
                </div>
                <div className="field">
                  <span className="field-label">Cooldown Between Orders (hours)</span>
                  <input className="field-input" type="number" min={1} value={cooldown} onChange={e => setCooldown(Math.max(1, Number(e.target.value)))} />
                </div>
                <div className="field">
                  <span className="field-label">Take Profit % (0 = disabled)</span>
                  <input className="field-input" type="number" min={0} value={takeProfit} onChange={e => setTakeProfit(Math.max(0, Number(e.target.value)))} />
                </div>
                <div className="field">
                  <span className="field-label">Trailing Stop-Loss % (0 = disabled)</span>
                  <input className="field-input" type="number" min={0} max={90} value={trailingStop} onChange={e => setTrailingStop(Math.min(90, Math.max(0, Number(e.target.value))))} />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div>
            {/* Zones */}
            <div className="card">
              <div className="card-header">Accumulation Zones</div>
              <div className="card-body">
                {zones.map((z, i) => (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div className="zone-n-label">Zone {i+1}</div>
                    <div className="zone-row-fields">
                      <div>
                        <span className="field-label">Pullback %</span>
                        <input className="field-input" type="number" min={0.5} max={50} step={0.5} value={z.pullback} onChange={e => { const nz = [...zones]; nz[i] = { ...nz[i], pullback: Number(e.target.value) }; setZones(nz); }} />
                      </div>
                      <div>
                        <span className="field-label">Allocation %</span>
                        <input className="field-input" type="number" min={1} max={100} value={z.alloc} onChange={e => { const nz = [...zones]; nz[i] = { ...nz[i], alloc: Number(e.target.value) }; setZones(nz); }} />
                      </div>
                    </div>
                  </div>
                ))}
                <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", marginBottom: 8 }}>
                  <div style={{ height: "100%", width: `${Math.min(totalAlloc, 100)}%`, background: totalAlloc > 100 ? "#ff6b6b" : "#fff", borderRadius: 2, transition: "width 0.3s" }} />
                </div>
                <div style={{ fontSize: 11, color: totalAlloc > 100 ? "#ff6b6b" : "rgba(255,255,255,0.3)" }}>
                  {totalAlloc}% of max exposure allocated{totalAlloc > 100 ? " — exceeds 100%" : ""}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="card">
              <div className="card-header">Strategy Summary</div>
              <div className="card-body">
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                  {[
                    { label: "Token", val: token },
                    { label: "Capital", val: `$${capital}` },
                    { label: "Max Deploy", val: `$${maxDeploy} (${exposure}%)` },
                    { label: "Zones", val: zones.map(z => `${z.pullback}%`).join(" · ") },
                    { label: "Trend Filter", val: trendFilter },
                    { label: "Cooldown", val: `${cooldown}h between orders` },
                    { label: "Take Profit", val: takeProfit > 0 ? `+${takeProfit}%` : "Disabled" },
                    { label: "Trailing Stop", val: trailingStop > 0 ? `-${trailingStop}%` : "Disabled" },
                  ].map((s, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                      <span style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</span>
                      <span style={{ color: "#fff", fontFamily: "'JetBrains Mono',monospace", fontSize: 11 }}>{s.val}</span>
                    </div>
                  ))}
                </div>

                <button className="save-btn" onClick={handleSave}>
                  {saved ? "✓ Strategy Saved" : "Save Strategy"}
                </button>
                <Link href="/backtester" className="bt-link">
                  Backtest this Strategy →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </>
  );
}
