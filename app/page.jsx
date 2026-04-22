"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const TOKENS = [
  { symbol: "SOL", name: "Solana", change: "+127%", period: "6 months" },
  { symbol: "HYPE", name: "HyperLiquid", change: "+43%", period: "2 months" },
  { symbol: "JUP", name: "Jupiter", change: "+89%", period: "4 months" },
];

const FEATURES = [
  { n: "01", title: "Zone-Based DCA", desc: "Accumulate at precise pullback levels — 5%, 12%, 25% — not randomly on a schedule." },
  { n: "02", title: "Multi-Token", desc: "Run strategies simultaneously on SOL, HYPE, JUP and more from a single dashboard." },
  { n: "03", title: "Capital Protection", desc: "Never deploy more than your max exposure. Volatility guards pause buying during ATR spikes." },
  { n: "04", title: "Backtester", desc: "Simulate your strategy on 90 days of real price history before risking a single dollar." },
  { n: "05", title: "Live Detection", desc: "Real-time zone monitoring — get alerted the moment price enters an accumulation zone." },
  { n: "06", title: "Smart Exits", desc: "Take profit, trailing stop-loss, and indicator-based exits keep your gains locked in." },
];

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [solPrice, setSolPrice] = useState(null);
  const [hypePrice, setHypePrice] = useState(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=solana,hyperliquid&vs_currencies=usd&include_24hr_change=true");
        const data = await res.json();
        setSolPrice({ price: data.solana?.usd, change: data.solana?.usd_24h_change });
        setHypePrice({ price: data.hyperliquid?.usd, change: data.hyperliquid?.usd_24h_change });
      } catch {}
    };
    fetchPrices();
    const iv = setInterval(() => { fetchPrices(); setTick(t => t + 1); }, 10000);
    return () => clearInterval(iv);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080808; color: #fff; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #080808; } ::-webkit-scrollbar-thumb { background: #222; }

        .ze-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 0 48px; height: 64px; background: rgba(8,8,8,0.9); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.06); }
        .ze-logo { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 3px; color: #fff; text-decoration: none; }
        .ze-logo span { color: rgba(255,255,255,0.35); }
        .ze-nav-links { display: flex; align-items: center; gap: 32px; }
        .ze-nav-link { color: rgba(255,255,255,0.45); font-size: 13px; font-weight: 500; text-decoration: none; transition: color 0.2s; letter-spacing: 0.3px; }
        .ze-nav-link:hover { color: #fff; }
        .ze-nav-link.active { color: #fff; }
        .ze-btn { padding: 8px 20px; border-radius: 8px; background: #fff; color: #080808; font-size: 13px; font-weight: 700; text-decoration: none; transition: all 0.2s; letter-spacing: 0.2px; }
        .ze-btn:hover { background: rgba(255,255,255,0.85); }
        .ze-btn-ghost { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.15); }
        .ze-btn-ghost:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.3); }

        /* HERO */
        .hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 120px 24px 80px; text-align: center; position: relative; overflow: hidden; }
        .hero-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px); background-size: 60px 60px; mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%); }
        .hero-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); font-size: 12px; color: rgba(255,255,255,0.5); letter-spacing: 0.5px; margin-bottom: 32px; }
        .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #fff; animation: blink 2s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        .hero-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(72px, 12vw, 160px); line-height: 0.9; letter-spacing: -2px; margin-bottom: 28px; }
        .hero-title .outline { -webkit-text-stroke: 1.5px rgba(255,255,255,0.7); color: transparent; }
        .hero-sub { font-size: clamp(15px, 2vw, 18px); color: rgba(255,255,255,0.4); max-width: 520px; line-height: 1.7; margin-bottom: 48px; font-weight: 400; }
        .hero-ctas { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; margin-bottom: 64px; }
        .hero-cta-primary { padding: 14px 32px; border-radius: 10px; background: #fff; color: #080808; font-size: 14px; font-weight: 700; text-decoration: none; transition: all 0.2s; letter-spacing: 0.3px; }
        .hero-cta-primary:hover { background: rgba(255,255,255,0.88); transform: translateY(-1px); }
        .hero-cta-secondary { padding: 14px 32px; border-radius: 10px; background: transparent; color: rgba(255,255,255,0.6); font-size: 14px; font-weight: 500; text-decoration: none; border: 1px solid rgba(255,255,255,0.12); transition: all 0.2s; }
        .hero-cta-secondary:hover { border-color: rgba(255,255,255,0.3); color: #fff; }

        /* TICKER */
        .ticker { display: flex; gap: 24px; justify-content: center; flex-wrap: wrap; }
        .ticker-item { display: flex; align-items: center; gap: 10px; padding: 10px 18px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.03); }
        .ticker-sym { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 600; color: #fff; }
        .ticker-price { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: rgba(255,255,255,0.5); }
        .ticker-change { font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 6px; }
        .ticker-change.up { background: rgba(255,255,255,0.08); color: #fff; }
        .ticker-change.down { background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.4); }

        /* STATS */
        .stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; overflow: hidden; margin: 80px auto; max-width: 800px; }
        .stat { background: #080808; padding: 40px 32px; text-align: center; }
        .stat-val { font-family: 'Bebas Neue', sans-serif; font-size: 56px; letter-spacing: 1px; color: #fff; line-height: 1; margin-bottom: 8px; }
        .stat-label { font-size: 12px; color: rgba(255,255,255,0.3); letter-spacing: 0.5px; text-transform: uppercase; }

        /* FEATURES */
        .features { padding: 80px 48px; max-width: 1160px; margin: 0 auto; }
        .section-label { font-size: 11px; color: rgba(255,255,255,0.25); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px; }
        .section-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(40px, 5vw, 64px); letter-spacing: 1px; margin-bottom: 56px; line-height: 1; }
        .features-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; overflow: hidden; }
        .feature { background: #080808; padding: 32px; transition: background 0.2s; }
        .feature:hover { background: #0f0f0f; }
        .feature-n { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: rgba(255,255,255,0.2); margin-bottom: 16px; }
        .feature-title { font-size: 16px; font-weight: 600; color: #fff; margin-bottom: 10px; }
        .feature-desc { font-size: 13px; color: rgba(255,255,255,0.35); line-height: 1.6; }

        /* PERFORMANCE */
        .perf { padding: 80px 48px; max-width: 1160px; margin: 0 auto; }
        .perf-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
        .perf-card { border: 1px solid rgba(255,255,255,0.07); border-radius: 16px; padding: 28px; background: rgba(255,255,255,0.02); }
        .perf-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .perf-token { display: flex; align-items: center; gap: 10px; }
        .perf-token-dot { width: 8px; height: 8px; border-radius: 50%; background: #fff; }
        .perf-token-sym { font-family: 'JetBrains Mono', monospace; font-size: 14px; font-weight: 600; color: #fff; }
        .perf-token-name { font-size: 11px; color: rgba(255,255,255,0.3); }
        .perf-change { font-size: 22px; font-family: 'Bebas Neue', sans-serif; color: #fff; letter-spacing: 1px; }
        .perf-bars { display: flex; flex-direction: column; gap: 10px; }
        .perf-bar-row { display: flex; flex-direction: column; gap: 5px; }
        .perf-bar-label { display: flex; justify-content: space-between; font-size: 11px; color: rgba(255,255,255,0.3); }
        .perf-bar-track { height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; }
        .perf-bar-fill { height: 100%; border-radius: 2px; background: #fff; transition: width 1s ease; }

        /* BACKTESTER PREVIEW */
        .bt-preview { padding: 80px 48px; max-width: 1160px; margin: 0 auto; }
        .bt-mock { border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; overflow: hidden; background: #0d0d0d; }
        .bt-mock-header { padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: space-between; }
        .bt-mock-tabs { display: flex; gap: 4px; }
        .bt-tab { padding: 6px 14px; border-radius: 7px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; }
        .bt-tab.active { background: #fff; color: #080808; }
        .bt-tab:not(.active) { background: transparent; color: rgba(255,255,255,0.3); }
        .bt-mock-body { padding: 24px; display: grid; grid-template-columns: 1fr 280px; gap: 20px; }
        .bt-chart-area { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; height: 220px; position: relative; overflow: hidden; display: flex; align-items: flex-end; padding: 16px; gap: 3px; }
        .bt-bar-chart { flex: 1; height: 100%; display: flex; align-items: flex-end; gap: 3px; }
        .bt-bar { background: rgba(255,255,255,0.12); border-radius: 2px 2px 0 0; flex: 1; transition: background 0.2s; }
        .bt-bar:hover { background: rgba(255,255,255,0.25); }
        .bt-bar.highlight { background: #fff; }
        .bt-zone-line { position: absolute; left: 16px; right: 16px; height: 1px; background: rgba(255,255,255,0.15); border-top: 1px dashed rgba(255,255,255,0.15); }
        .bt-stats-panel { display: flex; flex-direction: column; gap: 10px; }
        .bt-stat-row { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 14px 16px; }
        .bt-stat-label { font-size: 10px; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
        .bt-stat-val { font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: 600; color: #fff; }
        .bt-stat-val.green { color: #fff; }

        /* WAITLIST */
        .waitlist { padding: 80px 48px; max-width: 640px; margin: 0 auto; text-align: center; }
        .waitlist-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(40px, 5vw, 72px); letter-spacing: 1px; margin-bottom: 16px; }
        .waitlist-sub { font-size: 15px; color: rgba(255,255,255,0.4); margin-bottom: 40px; line-height: 1.6; }
        .waitlist-form { display: flex; gap: 10px; }
        .waitlist-input { flex: 1; padding: 14px 18px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: #fff; font-family: 'DM Sans', sans-serif; font-size: 14px; outline: none; transition: border-color 0.2s; }
        .waitlist-input:focus { border-color: rgba(255,255,255,0.3); }
        .waitlist-input::placeholder { color: rgba(255,255,255,0.2); }
        .waitlist-submit { padding: 14px 24px; border-radius: 10px; background: #fff; color: #080808; font-size: 14px; font-weight: 700; border: none; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
        .waitlist-submit:hover { background: rgba(255,255,255,0.88); }
        .waitlist-success { padding: 16px 24px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); font-size: 14px; color: rgba(255,255,255,0.6); }

        /* FOOTER */
        .footer { border-top: 1px solid rgba(255,255,255,0.06); padding: 32px 48px; display: flex; align-items: center; justify-content: space-between; }
        .footer-logo { font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 3px; color: rgba(255,255,255,0.4); }
        .footer-copy { font-size: 12px; color: rgba(255,255,255,0.2); }
        .footer-link { font-size: 12px; color: rgba(255,255,255,0.3); text-decoration: none; }
        .footer-link:hover { color: #fff; }

        @media(max-width:768px){
          .ze-nav { padding: 0 20px; }
          .ze-nav-links { display: none; }
          .hero { padding: 100px 20px 60px; }
          .stats { grid-template-columns: 1fr; max-width: 100%; margin: 40px 20px; }
          .features { padding: 60px 20px; }
          .features-grid { grid-template-columns: 1fr; }
          .perf { padding: 60px 20px; }
          .perf-grid { grid-template-columns: 1fr; }
          .bt-preview { padding: 60px 20px; }
          .bt-mock-body { grid-template-columns: 1fr; }
          .waitlist { padding: 60px 20px; }
          .waitlist-form { flex-direction: column; }
          .footer { flex-direction: column; gap: 16px; text-align: center; padding: 24px 20px; }
        }
      `}</style>

      {/* NAV */}
      <nav className="ze-nav">
        <a href="/" className="ze-logo">ZILLA <span>ENGINE</span></a>
        <div className="ze-nav-links">
          <Link href="/dashboard" className="ze-nav-link">Dashboard</Link>
          <Link href="/backtester" className="ze-nav-link">Backtester</Link>
          <Link href="/strategy" className="ze-nav-link">Strategy Builder</Link>
          <a href="https://pangeon.xyz" target="_blank" className="ze-nav-link">Pangeon DEX ↗</a>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/dashboard" className="ze-btn ze-btn-ghost" style={{ padding: "8px 20px", borderRadius: 8, background: "transparent", color: "#fff", border: "1px solid rgba(255,255,255,0.15)", fontSize: 13, fontWeight: 600, textDecoration: "none", display: "inline-block" }}>Launch App</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-grid" />
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Structure-based DCA — Now in Beta
        </div>
        <h1 className="hero-title">
          <div>ZILLA</div>
          <div className="outline">ENGINE</div>
        </h1>
        <p className="hero-sub">
          Zone-based accumulation bot for Solana and HyperLiquid tokens. Buy the dips systematically. Protect your capital. Let the market come to you.
        </p>
        <div className="hero-ctas">
          <Link href="/backtester" className="hero-cta-primary">Run a Backtest</Link>
          <Link href="/strategy" className="hero-cta-secondary">Build a Strategy</Link>
        </div>

        {/* Live ticker */}
        <div className="ticker">
          {solPrice && (
            <div className="ticker-item">
              <span className="ticker-sym">SOL</span>
              <span className="ticker-price">${solPrice.price?.toFixed(2)}</span>
              <span className={`ticker-change ${solPrice.change >= 0 ? "up" : "down"}`}>
                {solPrice.change >= 0 ? "+" : ""}{solPrice.change?.toFixed(2)}%
              </span>
            </div>
          )}
          {hypePrice && (
            <div className="ticker-item">
              <span className="ticker-sym">HYPE</span>
              <span className="ticker-price">${hypePrice.price?.toFixed(2)}</span>
              <span className={`ticker-change ${hypePrice.change >= 0 ? "up" : "down"}`}>
                {hypePrice.change >= 0 ? "+" : ""}{hypePrice.change?.toFixed(2)}%
              </span>
            </div>
          )}
          <div className="ticker-item">
            <span className="ticker-sym" style={{ color: "rgba(255,255,255,0.4)" }}>MORE</span>
            <span className="ticker-price">COMING SOON</span>
          </div>
        </div>
      </section>

      {/* STATS */}
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "0 48px" }}>
        <div className="stats">
          {[
            { val: "90", label: "Days of backtesting data" },
            { val: "3", label: "Accumulation zones per strategy" },
            { val: "0", label: "Automatic sells without your consent" },
          ].map((s, i) => (
            <div key={i} className="stat">
              <div className="stat-val">{s.val}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section className="features">
        <div className="section-label">Core Features</div>
        <h2 className="section-title">Built Different.</h2>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature">
              <div className="feature-n">{f.n}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PERFORMANCE */}
      <section className="perf">
        <div className="section-label">Simulated Performance</div>
        <h2 className="section-title">What The Bot Would Have Done.</h2>
        <div className="perf-grid">
          {[
            { sym: "SOL", name: "Solana", change: "+79%", period: "Last 90 days", orders: 4, deployed: 63, pnl: 79 },
            { sym: "HYPE", name: "HyperLiquid", change: "+52%", period: "Last 60 days", orders: 3, deployed: 49, pnl: 52 },
            { sym: "JUP", name: "Jupiter", change: "Coming soon", period: "—", orders: 0, deployed: 0, pnl: 0, soon: true },
          ].map((t, i) => (
            <div key={i} className="perf-card">
              <div className="perf-card-header">
                <div className="perf-token">
                  <div className="perf-token-dot" style={{ opacity: t.soon ? 0.3 : 1 }} />
                  <div>
                    <div className="perf-token-sym" style={{ opacity: t.soon ? 0.4 : 1 }}>{t.sym}</div>
                    <div className="perf-token-name">{t.name}</div>
                  </div>
                </div>
                <div className="perf-change" style={{ opacity: t.soon ? 0.3 : 1 }}>{t.change}</div>
              </div>
              {t.soon ? (
                <div style={{ textAlign: "center", padding: "32px 0", fontSize: 12, color: "rgba(255,255,255,0.2)", letterSpacing: "1px" }}>COMING SOON</div>
              ) : (
                <div className="perf-bars">
                  {[
                    { label: "Capital deployed", val: t.deployed, max: 100 },
                    { label: "Est. PnL on deployed", val: t.pnl, max: 100 },
                    { label: "Orders triggered", val: t.orders * 25, max: 100 },
                  ].map((b, j) => (
                    <div key={j} className="perf-bar-row">
                      <div className="perf-bar-label">
                        <span>{b.label}</span>
                        <span style={{ color: "#fff" }}>{j === 2 ? `${t.orders} orders` : `${b.val}%`}</span>
                      </div>
                      <div className="perf-bar-track">
                        <div className="perf-bar-fill" style={{ width: `${b.val}%` }} />
                      </div>
                    </div>
                  ))}
                  <div style={{ marginTop: 4, fontSize: 11, color: "rgba(255,255,255,0.2)" }}>{t.period} · Simulated</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* BACKTESTER PREVIEW */}
      <section className="bt-preview">
        <div className="section-label">Backtester</div>
        <h2 className="section-title">Test Before You Risk.</h2>
        <div className="bt-mock">
          <div className="bt-mock-header">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Zilla Engine — SOL/USD — Last 90 Days</span>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>SIMULATED</span>
            </div>
            <div className="bt-mock-tabs">
              {["SOL", "HYPE"].map((t, i) => <button key={t} className={`bt-tab${i === 0 ? " active" : ""}`}>{t}</button>)}
            </div>
          </div>
          <div className="bt-mock-body">
            <div className="bt-chart-area">
              <div className="bt-zone-line" style={{ bottom: "45%" }} />
              <div className="bt-zone-line" style={{ bottom: "30%" }} />
              <div className="bt-bar-chart">
                {Array.from({ length: 45 }, (_, i) => {
                  const h = 20 + Math.sin(i * 0.4) * 15 + Math.cos(i * 0.2) * 20 + (i > 30 ? (i-30) * 2 : 0);
                  const highlight = [8, 15, 22, 31].includes(i);
                  return <div key={i} className={`bt-bar${highlight ? " highlight" : ""}`} style={{ height: `${Math.max(10, Math.min(95, h))}%` }} />;
                })}
              </div>
            </div>
            <div className="bt-stats-panel">
              {[
                { label: "Orders triggered", val: "4" },
                { label: "Capital deployed", val: "$630" },
                { label: "SOL accumulated", val: "7.67 SOL" },
                { label: "Est. PnL", val: "+$40 (6.3%)" },
              ].map((s, i) => (
                <div key={i} className="bt-stat-row">
                  <div className="bt-stat-label">{s.label}</div>
                  <div className={`bt-stat-val${i === 3 ? " green" : ""}`}>{s.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Link href="/backtester" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 28px", borderRadius: 10, background: "#fff", color: "#080808", fontSize: 14, fontWeight: 700, textDecoration: "none", transition: "all 0.2s" }}>
            Run Your Own Backtest →
          </Link>
        </div>
      </section>

      {/* WAITLIST */}
      <section className="waitlist">
        <div className="section-label">Early Access</div>
        <h2 className="waitlist-title">Get Notified First.</h2>
        <p className="waitlist-sub">Zilla Engine live execution is coming. Join the waitlist and be the first to run real strategies on SOL and HYPE.</p>
        {submitted ? (
          <div className="waitlist-success">✓ You're on the list — we'll be in touch.</div>
        ) : (
          <form className="waitlist-form" onSubmit={handleSubmit}>
            <input className="waitlist-input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            <button className="waitlist-submit" type="submit">Join Waitlist</button>
          </form>
        )}
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-logo">ZILLA ENGINE</div>
        <div className="footer-copy">© 2026 Zilla Engine. Powered by Pangeon DEX.</div>
        <div style={{ display: "flex", gap: 24 }}>
          <a href="https://pangeon.xyz" className="footer-link">Pangeon DEX</a>
          <a href="#" className="footer-link">Twitter</a>
        </div>
      </footer>
    </>
  );
}
