"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const TOKENS_CONFIG = [
  { id: "solana", symbol: "SOL", name: "Solana", logo: "https://assets.coingecko.com/coins/images/4128/small/solana.png" },
  { id: "hyperliquid", symbol: "HYPE", name: "HyperLiquid", logo: "https://assets.coingecko.com/coins/images/36658/small/hyperliquid.png" },
];

export default function Dashboard() {
  const [prices, setPrices] = useState({});
  const [selected, setSelected] = useState("SOL");
  const prevPrices = useRef({});

  useEffect(() => {
    const fetch_ = async () => {
      try {
       const res = await fetch("/api/prices");
        const data = await res.json();
        setPrices({
          SOL: { price: data.solana?.usd, change: data.solana?.usd_24h_change, vol: data.solana?.usd_24h_vol, mcap: data.solana?.usd_market_cap },
          HYPE: { price: data.hyperliquid?.usd, change: data.hyperliquid?.usd_24h_change, vol: data.hyperliquid?.usd_24h_vol, mcap: data.hyperliquid?.usd_market_cap },
        });
      } catch {}
    };
    fetch_();
    const iv = setInterval(fetch_,  30000);
    return () => clearInterval(iv);
  }, []);

  const fmt = (n) => {
    if (!n) return "—";
    if (n >= 1e9) return `$${(n/1e9).toFixed(1)}B`;
    if (n >= 1e6) return `$${(n/1e6).toFixed(1)}M`;
    return `$${n.toFixed(2)}`;
  };

  const cur = prices[selected];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; color: #fff; font-family: 'DM Sans', sans-serif; }
        .ze-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 0 32px; height: 56px; background: rgba(8,8,8,0.95); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.06); }
        .ze-logo { font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 3px; color: #fff; text-decoration: none; }
        .ze-logo span { color: rgba(255,255,255,0.3); }
        .nav-links { display: flex; align-items: center; gap: 4px; }
        .nav-link { padding: 6px 14px; border-radius: 7px; font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.4); text-decoration: none; transition: all 0.15s; }
        .nav-link:hover { color: #fff; background: rgba(255,255,255,0.05); }
        .nav-link.active { color: #fff; background: rgba(255,255,255,0.08); }
        .content { padding: 80px 32px 60px; max-width: 1200px; margin: 0 auto; }
        .page-title { font-family: 'Bebas Neue', sans-serif; font-size: 40px; letter-spacing: 2px; margin-bottom: 6px; }
        .page-sub { font-size: 13px; color: rgba(255,255,255,0.3); margin-bottom: 32px; }

        /* TOKEN TABS */
        .token-tabs { display: flex; gap: 8px; margin-bottom: 28px; }
        .token-tab { display: flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); background: transparent; color: rgba(255,255,255,0.4); font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
        .token-tab.active { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); color: #fff; }
        .token-tab img { width: 20px; height: 20px; border-radius: 50%; }

        /* PRICE HERO */
        .price-hero { border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 32px; background: rgba(255,255,255,0.02); margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; }
        .price-main { display: flex; align-items: baseline; gap: 16px; }
        .price-val { font-family: 'Bebas Neue', sans-serif; font-size: 64px; letter-spacing: 1px; line-height: 1; }
        .price-change { font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 600; }
        .price-change.up { color: #fff; }
        .price-change.down { color: rgba(255,255,255,0.4); }
        .price-meta { display: flex; gap: 32px; }
        .price-meta-item { text-align: right; }
        .price-meta-label { font-size: 10px; color: rgba(255,255,255,0.25); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .price-meta-val { font-family: 'JetBrains Mono', monospace; font-size: 14px; color: rgba(255,255,255,0.7); }

        /* LIVE DOT */
        .live-dot { display: flex; align-items: center; gap: 6px; font-size: 11px; color: rgba(255,255,255,0.3); }
        .live-dot::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #fff; display: inline-block; animation: blink 2s infinite; }
        @keyframes blink { 0%,100%{opacity:1}50%{opacity:0.2} }

        /* ZONES */
        .zones-title { font-size: 11px; color: rgba(255,255,255,0.25); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 14px; }
        .zones-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 20px; }
        .zone-card { border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 20px; background: rgba(255,255,255,0.02); }
        .zone-card.active { border-color: rgba(255,255,255,0.25); background: rgba(255,255,255,0.05); }
        .zone-n { font-size: 10px; color: rgba(255,255,255,0.25); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }
        .zone-depth { font-family: 'Bebas Neue', sans-serif; font-size: 36px; color: #fff; line-height: 1; margin-bottom: 4px; }
        .zone-price { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 10px; }
        .zone-status { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 600; padding: 3px 9px; border-radius: 20px; }
        .zone-status.waiting { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.3); }
        .zone-status.active { background: rgba(255,255,255,0.1); color: #fff; }
        .zone-alloc { font-size: 11px; color: rgba(255,255,255,0.25); margin-top: 8px; }

        /* STATS ROW */
        .stats-row { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 20px; }
        .stat-card { border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 20px; background: rgba(255,255,255,0.02); }
        .stat-label { font-size: 10px; color: rgba(255,255,255,0.25); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
        .stat-val { font-family: 'JetBrains Mono', monospace; font-size: 20px; font-weight: 600; color: #fff; }
        .stat-sub { font-size: 11px; color: rgba(255,255,255,0.25); margin-top: 4px; }

        /* ACTIVITY */
        .activity { border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; overflow: hidden; }
        .activity-header { padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; justify-content: space-between; }
        .activity-row { display: flex; align-items: center; gap: 16px; padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .activity-row:last-child { border-bottom: none; }
        .activity-empty { padding: 48px 20px; text-align: center; font-size: 13px; color: rgba(255,255,255,0.2); }
        .act-icon { width: 32px; height: 32px; border-radius: 8px; background: rgba(255,255,255,0.06); display: flex; align-items: center; justifyContent: center; font-size: 14px; flex-shrink: 0; }
        .act-info { flex: 1; }
        .act-title { font-size: 13px; color: #fff; font-weight: 500; }
        .act-date { font-size: 11px; color: rgba(255,255,255,0.25); margin-top: 2px; }
        .act-amount { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: rgba(255,255,255,0.6); }

        @media(max-width:768px){
          .content{padding:72px 16px 60px;}
          .zones-grid{grid-template-columns:1fr;}
          .stats-row{grid-template-columns:1fr 1fr;}
          .price-hero{flex-direction:column;}
          .price-meta{flex-direction:column;gap:12px;}
          .price-meta-item{text-align:left;}
        }
      `}</style>

      <nav className="ze-nav">
        <Link href="/" className="ze-logo">ZILLA <span>ENGINE</span></Link>
        <div className="nav-links">
          <Link href="/dashboard" className="nav-link active">Dashboard</Link>
          <Link href="/backtester" className="nav-link">Backtester</Link>
          <Link href="/strategy" className="nav-link">Strategy</Link>
        </div>
        <div className="live-dot">Live</div>
      </nav>

      <div className="content">
        <div className="page-title">Dashboard</div>
        <div className="page-sub">Monitor your accumulation zones in real time</div>

        {/* Token tabs */}
        <div className="token-tabs">
          {TOKENS_CONFIG.map(t => (
            <button key={t.symbol} className={`token-tab${selected === t.symbol ? " active" : ""}`} onClick={() => setSelected(t.symbol)}>
              <img src={t.logo} alt={t.symbol} onError={e => e.target.style.display="none"} />
              {t.symbol}
            </button>
          ))}
          <button className="token-tab" disabled style={{ opacity: 0.3, cursor: "not-allowed" }}>
            + More soon
          </button>
        </div>

        {/* Price hero */}
        <div className="price-hero">
          <div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>{selected} / USD</div>
            <div className="price-main">
              <div className="price-val">${cur?.price?.toFixed(2) || "—"}</div>
              {cur?.change !== undefined && (
                <div className={`price-change ${cur.change >= 0 ? "up" : "down"}`}>
                  {cur.change >= 0 ? "▲" : "▼"} {Math.abs(cur.change).toFixed(2)}%
                </div>
              )}
            </div>
          </div>
          <div className="price-meta">
            <div className="price-meta-item">
              <div className="price-meta-label">Market Cap</div>
              <div className="price-meta-val">{fmt(cur?.mcap)}</div>
            </div>
            <div className="price-meta-item">
              <div className="price-meta-label">Volume 24h</div>
              <div className="price-meta-val">{fmt(cur?.vol)}</div>
            </div>
            <div className="price-meta-item">
              <div className="price-meta-label">Updates</div>
              <div className="price-meta-val" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Every 5s</div>
            </div>
          </div>
        </div>

        {/* Zones */}
        <div className="zones-title">Accumulation Zones — {selected}</div>
        <div className="zones-grid">
          {[
            { n: "Zone 1", depth: "5%", alloc: "20% capital", label: "Shallow dip" },
            { n: "Zone 2", depth: "12%", alloc: "30% capital", label: "Medium pullback" },
            { n: "Zone 3", depth: "25%", alloc: "20% capital", label: "Deep correction" },
          ].map((z, i) => {
            const refHigh = cur?.price ? cur.price * 1.25 : 0;
            const pct = refHigh > 0 ? ((refHigh - (cur?.price || 0)) / refHigh) * 100 : 0;
            const pullback = parseFloat(z.depth);
            const isActive = pct >= pullback;
            const targetPrice = cur?.price ? (cur.price * (1 - pullback / 100 / 1.25)).toFixed(2) : "—";
            return (
              <div key={i} className={`zone-card${isActive ? " active" : ""}`}>
                <div className="zone-n">{z.n}</div>
                <div className="zone-depth">{z.depth}</div>
                <div className="zone-price">Target ≈ ${targetPrice}</div>
                <div className={`zone-status ${isActive ? "active" : "waiting"}`}>
                  {isActive ? "🎯 In Range" : "⏳ Waiting"}
                </div>
                <div className="zone-alloc">{z.alloc} · {z.label}</div>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="stats-row">
          {[
            { label: "Strategy Status", val: "Preview", sub: "No live execution" },
            { label: "Capital Configured", val: "$1,000", sub: "70% max exposure" },
            { label: "Orders (Simulated)", val: "4", sub: "Last 90 days" },
            { label: "Est. PnL (Sim.)", val: "+6.3%", sub: "On deployed capital" },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-label">{s.label}</div>
              <div className="stat-val">{s.val}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Activity */}
        <div className="activity">
          <div className="activity-header">
            <span>Recent Activity</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>Simulated only</span>
          </div>
          <div className="activity-empty">
            No live orders yet — <Link href="/strategy" style={{ color: "rgba(255,255,255,0.5)", textDecoration: "underline" }}>create a strategy</Link> to get started
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
          <Link href="/backtester" style={{ padding: "12px 24px", borderRadius: 10, background: "#fff", color: "#080808", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Run Backtest</Link>
          <Link href="/strategy" style={{ padding: "12px 24px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Edit Strategy</Link>
        </div>
      </div>
    </>
  );
}
