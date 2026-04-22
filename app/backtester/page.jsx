"use client";
import { useState } from "react";
import Link from "next/link";

const SUPPORTED_TOKENS = [
  { id: "solana", symbol: "SOL", name: "Solana", logo: "https://assets.coingecko.com/coins/images/4128/small/solana.png" },
  { id: "hyperliquid", symbol: "HYPE", name: "HyperLiquid", logo: "https://assets.coingecko.com/coins/images/36658/small/hyperliquid.png" },
];

async function fetchHistory(coinId, days) {
  const res = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=daily`);
  const data = await res.json();
  return (data.prices || []).map(([ts, price]) => ({ date: new Date(ts), price }));
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
  const startPrice = prices[0].price;
  const holdPnlPct = ((finalPrice - startPrice) / startPrice) * 100;
  return { orders, deployed, totalBought, totalSpent, currentValue, pnl, pnlPct, avgEntry, finalPrice, startPrice, holdPnlPct, prices };
}

export default function Backtester() {
  const [token, setToken] = useState(SUPPORTED_TOKENS[0]);
  const [days, setDays] = useState(90);
  const [capital, setCapital] = useState(1000);
  const [exposure, setExposure] = useState(70);
  const [zones, setZones] = useState([
    { pullback: 5, alloc: 20 },
    { pullback: 12, alloc: 30 },
    { pullback: 25, alloc: 20 },
  ]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleRun = async () => {
    setLoading(true); setResult(null);
    const history = await fetchHistory(token.id, days);
    const r = runBacktest(history, zones, capital, exposure);
    setResult(r); setLoading(false);
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
        .content { display: grid; grid-template-columns: 360px 1fr; gap: 20px; padding: 76px 32px 60px; max-width: 1200px; margin: 0 auto; }
        .panel { border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; overflow: hidden; }
        .panel-header { padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 1px; }
        .panel-body { padding: 20px; }
        .field { margin-bottom: 16px; }
        .field-label { font-size: 11px; color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; display: block; }
        .field-input { width: 100%; padding: 10px 14px; border-radius: 9px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04); color: #fff; font-family: 'JetBrains Mono', monospace; font-size: 14px; outline: none; transition: border-color 0.2s; }
        .field-input:focus { border-color: rgba(255,255,255,0.2); }
        .token-btns { display: flex; gap: 8px; }
        .token-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px; padding: 10px; border-radius: 9px; border: 1px solid rgba(255,255,255,0.08); background: transparent; color: rgba(255,255,255,0.4); font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .token-btn.active { border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.07); color: #fff; }
        .token-btn img { width: 18px; height: 18px; border-radius: 50%; }
        .days-btns { display: flex; gap: 6px; }
        .day-btn { flex: 1; padding: 8px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); background: transparent; color: rgba(255,255,255,0.3); font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .day-btn.active { border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.07); color: #fff; }
        .zone-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 8px; }
        .zone-label { font-size: 10px; color: rgba(255,255,255,0.25); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .divider { height: 1px; background: rgba(255,255,255,0.06); margin: 16px 0; }
        .alloc-note { font-size: 11px; color: ${totalAlloc > 100 ? "#ff6b6b" : "rgba(255,255,255,0.3)"}; margin-bottom: 16px; }
        .run-btn { width: 100%; padding: 14px; border-radius: 10px; background: #fff; color: #080808; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 700; border: none; cursor: pointer; transition: all 0.2s; letter-spacing: 0.3px; }
        .run-btn:hover { background: rgba(255,255,255,0.88); }
        .run-btn:disabled { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.2); cursor: not-allowed; }

        /* RESULTS */
        .results-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 16px; }
        .res-card { border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 16px; background: rgba(255,255,255,0.02); }
        .res-label { font-size: 10px; color: rgba(255,255,255,0.25); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
        .res-val { font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 600; color: #fff; }
        .res-val.positive { color: #fff; }
        .res-val.negative { color: rgba(255,255,255,0.4); }
        .orders-title { font-size: 11px; color: rgba(255,255,255,0.25); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
        .order-row { display: flex; align-items: center; gap: 12px; padding: 11px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .order-row:last-child { border-bottom: none; }
        .order-num { width: 26px; height: 26px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.12); display: flex; align-items: center; justify-content: center; font-size: 11px; color: rgba(255,255,255,0.5); flex-shrink: 0; font-family: 'JetBrains Mono', monospace; }
        .order-info { flex: 1; }
        .order-main { font-size: 13px; color: #fff; font-weight: 500; }
        .order-sub { font-size: 11px; color: rgba(255,255,255,0.25); margin-top: 2px; font-family: 'JetBrains Mono', monospace; }
        .order-amt { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: rgba(255,255,255,0.4); }
        .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; gap: 12px; text-align: center; }
        .empty-title { font-family: 'Bebas Neue', sans-serif; font-size: 28px; letter-spacing: 1px; color: rgba(255,255,255,0.2); }
        .empty-sub { font-size: 13px; color: rgba(255,255,255,0.2); }
        .compare-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
        .compare-card { border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 16px; background: rgba(255,255,255,0.02); }
        .compare-card.highlight { border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.04); }
        .compare-label { font-size: 10px; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
        .compare-val { font-family: 'Bebas Neue', sans-serif; font-size: 32px; letter-spacing: 1px; color: #fff; }
        .compare-sub { font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 4px; }
        .disclaimer { padding: 12px 16px; border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; font-size: 11px; color: rgba(255,255,255,0.25); line-height: 1.6; margin-top: 16px; }

        @media(max-width:900px){ .content{grid-template-columns:1fr;} }
        @media(max-width:768px){ .content{padding:72px 16px 60px;} .results-grid{grid-template-columns:1fr 1fr;} }
      `}</style>

      <nav className="ze-nav">
        <Link href="/" className="ze-logo">ZILLA <span>ENGINE</span></Link>
        <div className="nav-links">
          <Link href="/dashboard" className="nav-link">Dashboard</Link>
          <Link href="/backtester" className="nav-link active">Backtester</Link>
          <Link href="/strategy" className="nav-link">Strategy</Link>
        </div>
      </nav>

      <div className="content">
        {/* LEFT — Config */}
        <div>
          <div className="panel">
            <div className="panel-header">Strategy Config</div>
            <div className="panel-body">

              {/* Token */}
              <div className="field">
                <span className="field-label">Token</span>
                <div className="token-btns">
                  {SUPPORTED_TOKENS.map(t => (
                    <button key={t.symbol} className={`token-btn${token.symbol === t.symbol ? " active" : ""}`} onClick={() => setToken(t)}>
                      <img src={t.logo} alt={t.symbol} onError={e => e.target.style.display="none"} />
                      {t.symbol}
                    </button>
                  ))}
                </div>
              </div>

              {/* Period */}
              <div className="field">
                <span className="field-label">Backtest Period</span>
                <div className="days-btns">
                  {[30, 60, 90].map(d => (
                    <button key={d} className={`day-btn${days === d ? " active" : ""}`} onClick={() => setDays(d)}>{d}d</button>
                  ))}
                </div>
              </div>

              {/* Capital */}
              <div className="field">
                <span className="field-label">Total Capital (USD)</span>
                <input className="field-input" type="number" value={capital} onChange={e => setCapital(Number(e.target.value))} />
              </div>

              {/* Exposure */}
              <div className="field">
                <span className="field-label">Max Exposure %</span>
                <input className="field-input" type="number" min={10} max={100} value={exposure} onChange={e => setExposure(Math.min(100, Math.max(10, Number(e.target.value))))} />
              </div>

              <div className="divider" />

              {/* Zones */}
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>Accumulation Zones</div>
              {zones.map((z, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginBottom: 6 }}>ZONE {i+1}</div>
                  <div className="zone-row">
                    <div>
                      <div className="zone-label">Pullback %</div>
                      <input className="field-input" type="number" min={0.5} max={50} step={0.5} value={z.pullback} onChange={e => { const nz = [...zones]; nz[i] = { ...nz[i], pullback: Number(e.target.value) }; setZones(nz); }} />
                    </div>
                    <div>
                      <div className="zone-label">Allocation %</div>
                      <input className="field-input" type="number" min={1} max={100} value={z.alloc} onChange={e => { const nz = [...zones]; nz[i] = { ...nz[i], alloc: Number(e.target.value) }; setZones(nz); }} />
                    </div>
                  </div>
                </div>
              ))}

              <div className="alloc-note">
                Total allocation: <strong>{totalAlloc}%</strong> · Max deploy: <strong>${maxDeploy}</strong>
                {totalAlloc > 100 && " ⚠️ Exceeds 100%"}
              </div>

              <button className="run-btn" onClick={handleRun} disabled={loading || totalAlloc > 100}>
                {loading ? "⟳ Running simulation..." : `Run Backtest — ${token.symbol} ${days}d`}
              </button>

            </div>
          </div>
        </div>

        {/* RIGHT — Results */}
        <div>
          {!result && !loading && (
            <div className="panel" style={{ height: "100%" }}>
              <div className="empty-state">
                <div className="empty-title">Configure & Run</div>
                <div className="empty-sub">Set your strategy on the left and hit Run Backtest to see simulated results on real {token.symbol} price history.</div>
              </div>
            </div>
          )}

          {loading && (
            <div className="panel" style={{ height: "100%" }}>
              <div className="empty-state">
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>⟳ Fetching {token.symbol} price history and running simulation...</div>
              </div>
            </div>
          )}

          {result && !loading && (
            <div>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: 1 }}>Backtest Results</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{token.symbol} · Last {days} days · Simulated</div>
                </div>
                <div style={{ fontSize: 11, padding: "4px 12px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.3)" }}>SIMULATION</div>
              </div>

              {/* Stats grid */}
              <div className="results-grid">
                {[
                  { label: "Orders triggered", val: result.orders.length.toString() },
                  { label: "Capital deployed", val: `$${result.deployed.toFixed(0)}` },
                  { label: "Avg entry price", val: result.avgEntry > 0 ? `$${result.avgEntry.toFixed(2)}` : "—" },
                  { label: `${token.symbol} accumulated`, val: result.totalBought > 0 ? `${result.totalBought.toFixed(4)}` : "—" },
                  { label: "Current value", val: `$${result.currentValue.toFixed(0)}` },
                  { label: "Est. PnL", val: `${result.pnl >= 0 ? "+" : ""}$${result.pnl.toFixed(0)} (${result.pnlPct.toFixed(1)}%)`, positive: result.pnl >= 0 },
                ].map((s, i) => (
                  <div key={i} className="res-card">
                    <div className="res-label">{s.label}</div>
                    <div className={`res-val${s.positive !== undefined ? (s.positive ? " positive" : " negative") : ""}`}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* vs Hold comparison */}
              <div className="compare-row">
                <div className={`compare-card${result.pnlPct > result.holdPnlPct ? " highlight" : ""}`}>
                  <div className="compare-label">Zilla Engine PnL</div>
                  <div className="compare-val">{result.pnlPct >= 0 ? "+" : ""}{result.pnlPct.toFixed(1)}%</div>
                  <div className="compare-sub">On deployed capital</div>
                </div>
                <div className={`compare-card${result.holdPnlPct > result.pnlPct ? " highlight" : ""}`}>
                  <div className="compare-label">Simple Hold PnL</div>
                  <div className="compare-val">{result.holdPnlPct >= 0 ? "+" : ""}{result.holdPnlPct.toFixed(1)}%</div>
                  <div className="compare-sub">Buy at start, hold to end</div>
                </div>
              </div>

              {/* Order timeline */}
              {result.orders.length > 0 ? (
                <div className="panel">
                  <div className="panel-header">Order Timeline ({result.orders.length} orders)</div>
                  <div className="panel-body">
                    {result.orders.map((o, i) => (
                      <div key={i} className="order-row">
                        <div className="order-num">{i+1}</div>
                        <div className="order-info">
                          <div className="order-main">Zone {o.zone}% pullback — ${o.amount.toFixed(0)} deployed</div>
                          <div className="order-sub">{o.date.toLocaleDateString()} · ${o.price.toFixed(2)} entry · {o.units.toFixed(4)} {token.symbol}</div>
                        </div>
                        <div className="order-amt">${o.amount.toFixed(0)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ padding: "24px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.25)" }}>
                  No zones triggered in this period. Try reducing pullback depths.
                </div>
              )}

              <div className="disclaimer">
                ⚠️ Backtest results are simulated using historical CoinGecko price data. Past performance does not guarantee future results. This is not financial advice.
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
