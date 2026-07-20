"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import DcaBotPage from "./dca-bot-content";

const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i, top: `${(i * 37 + 11) % 100}%`, left: `${(i * 53 + 7) % 100}%`,
  size: i % 5 === 0 ? 2 : 1, opacity: ((i * 17 + 3) % 6) * 0.03 + 0.02,
}));

const TOKENS_CONFIG = [
  { id: "solana", symbol: "SOL", logo: "https://assets.coingecko.com/coins/images/4128/small/solana.png" },
  { id: "hyperliquid", symbol: "HYPE", logo: "https://assets.coingecko.com/coins/images/36658/small/hyperliquid.png" },
  { id: "bitcoin", symbol: "BTC", logo: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png" },
];

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
  { id: "strategy", label: "Strategy", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
  { id: "dca-bots", label: "DCA Bots", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg> },
  { id: "settings", label: "Settings", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
];

/* ── DASHBOARD PAGE CONTENT ── */
function DashboardContent() {
  const [prices, setPrices] = useState({});
  const [selected, setSelected] = useState("SOL");

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const res = await fetch("/api/prices?id=solana,hyperliquid,bitcoin");
        const data = await res.json();
        setPrices({
          SOL:  { price: data.solana?.usd,       change: data.solana?.usd_24h_change,       vol: data.solana?.usd_24h_vol,       mcap: data.solana?.usd_market_cap },
          HYPE: { price: data.hyperliquid?.usd,   change: data.hyperliquid?.usd_24h_change,  vol: data.hyperliquid?.usd_24h_vol,  mcap: data.hyperliquid?.usd_market_cap },
          BTC:  { price: data.bitcoin?.usd,       change: data.bitcoin?.usd_24h_change,      vol: data.bitcoin?.usd_24h_vol,      mcap: data.bitcoin?.usd_market_cap },
        });
      } catch {}
    };
    fetchPrices();
    const iv = setInterval(fetchPrices, 30000);
    return () => clearInterval(iv);
  }, []);

  const fmt = (n) => {
    if (!n) return "—";
    if (n >= 1e9) return `$${(n/1e9).toFixed(1)}B`;
    if (n >= 1e6) return `$${(n/1e6).toFixed(1)}M`;
    return `$${n.toFixed(2)}`;
  };

  const cur = prices[selected];

  const zones = [
    { n: "Zone 1", depth: 5,  alloc: "20%", label: "Shallow dip" },
    { n: "Zone 2", depth: 12, alloc: "30%", label: "Medium pullback" },
    { n: "Zone 3", depth: 25, alloc: "20%", label: "Deep correction" },
  ];

  return (
    <div style={{ padding: "40px 48px", maxWidth: 1100 }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(180,79,255,0.8)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: 10 }}>Automated Accumulation</div>
        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(28px,3vw,42px)", fontWeight: 700, color: "#fff", lineHeight: 1.15, marginBottom: 10 }}>
          Build your position,<br /><span style={{ color: "#C44FFF" }}>layer by layer.</span>
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", maxWidth: 480, lineHeight: 1.7 }}>
          Your DCA bot runs your strategy across price zones, relentlessly and without emotion. Every pullback becomes another layer in your position.
        </p>
      </div>

      {/* Token tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {TOKENS_CONFIG.map(t => (
          <button key={t.symbol} onClick={() => setSelected(t.symbol)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 10, border: `1px solid ${selected === t.symbol ? "rgba(150,40,200,0.5)" : "rgba(255,255,255,0.08)"}`, background: selected === t.symbol ? "rgba(150,40,200,0.15)" : "transparent", color: selected === t.symbol ? "#C44FFF" : "rgba(255,255,255,0.4)", fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}>
            <img src={t.logo} alt={t.symbol} width={18} height={18} style={{ borderRadius: "50%" }} />
            {t.symbol}
          </button>
        ))}
      </div>

      {/* Price hero */}
      <div style={{ borderRadius: 16, border: "1px solid rgba(150,40,200,0.15)", background: "rgba(8,0,20,0.5)", padding: "24px 28px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 8, fontFamily: "'Space Mono', monospace" }}>{selected} / USD</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 52, fontWeight: 700, color: "#fff", lineHeight: 1 }}>${cur?.price?.toLocaleString() || "—"}</div>
            {cur?.change !== undefined && (
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 16, fontWeight: 700, color: cur.change >= 0 ? "#4ade80" : "#f87171" }}>
                {cur.change >= 0 ? "▲" : "▼"} {Math.abs(cur.change).toFixed(2)}%
              </div>
            )}
          </div>
        </div>
        <div style={{ display: "flex", gap: 32 }}>
          {[
            { label: "Market Cap", val: fmt(cur?.mcap) },
            { label: "Volume 24h", val: fmt(cur?.vol) },
            { label: "Updates", val: "Every 30s" },
          ].map((m, i) => (
            <div key={i} style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{m.label}</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{m.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Zones */}
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 12 }}>Accumulation Zones — {selected}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        {zones.map((z, i) => {
          const refHigh = cur?.price ? cur.price * 1.25 : 0;
          const pct = refHigh > 0 ? ((refHigh - (cur?.price || 0)) / refHigh) * 100 : 0;
          const isActive = pct >= z.depth;
          const targetPrice = cur?.price ? (cur.price * (1 - z.depth / 100)).toFixed(2) : "—";
          return (
            <div key={i} style={{ borderRadius: 14, border: `1px solid ${isActive ? "rgba(150,40,200,0.4)" : "rgba(255,255,255,0.07)"}`, background: isActive ? "rgba(150,40,200,0.08)" : "rgba(255,255,255,0.02)", padding: "20px", transition: "all 0.2s" }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>{z.n}</div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 34, fontWeight: 700, color: "#fff", lineHeight: 1, marginBottom: 4 }}>{z.depth}%</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>Target ≈ ${targetPrice}</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: isActive ? "rgba(150,40,200,0.15)" : "rgba(255,255,255,0.05)", color: isActive ? "#C44FFF" : "rgba(255,255,255,0.3)", border: `1px solid ${isActive ? "rgba(150,40,200,0.3)" : "transparent"}` }}>
                {isActive ? "🎯 In Range" : "⏳ Waiting"}
              </div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 10 }}>{z.alloc} capital · {z.label}</div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Strategy Status", val: "Preview", sub: "No live execution" },
          { label: "Capital Configured", val: "$1,000", sub: "70% max exposure" },
          { label: "Orders (Simulated)", val: "4", sub: "Last 90 days" },
          { label: "Est. PnL (Sim.)", val: "+6.3%", sub: "On deployed capital", color: "#4ade80" },
        ].map((s, i) => (
          <div key={i} style={{ borderRadius: 14, border: "1px solid rgba(150,40,200,0.12)", background: "rgba(8,0,20,0.4)", padding: "18px 20px" }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: s.color || "#fff", marginBottom: 4 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Activity */}
      <div style={{ borderRadius: 14, border: "1px solid rgba(150,40,200,0.12)", overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(150,40,200,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>Recent Activity</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "'Space Mono', monospace" }}>Simulated only</span>
        </div>
        <div style={{ padding: "48px 20px", textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.2)" }}>
          No live orders yet — configure your strategy to get started
        </div>
      </div>

      {/* CTAs */}
      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <button style={{ padding: "11px 24px", borderRadius: 10, background: "rgba(150,40,200,0.25)", border: "1px solid rgba(150,40,200,0.5)", color: "#C44FFF", fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: "0.5px" }}>Configure the bot</button>
        <button style={{ padding: "11px 24px", borderRadius: 10, background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: "0.5px" }}>How it works</button>
      </div>
    </div>
  );
}

function PlaceholderPage({ label, sub }) {
  return (
    <div style={{ padding: "40px 48px" }}>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(180,79,255,0.8)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: 12 }}>Coming soon</div>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 36, fontWeight: 700, color: "#fff", marginBottom: 32 }}>{label}</h1>
      <div style={{ padding: "60px 40px", borderRadius: 20, border: "1px dashed rgba(150,40,200,0.2)", background: "rgba(150,40,200,0.03)", textAlign: "center" }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.25)", marginBottom: 10 }}>Under construction</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.2)" }}>{sub}</div>
      </div>
    </div>
  );
}

const PAGES = {
  dashboard: () => <DashboardContent />,
  strategy:  () => <PlaceholderPage label="Strategy Library" sub="Purchase and manage your trading strategies here." />,
  "dca-bots": () => <DcaBotPage />,
  settings:  () => <PlaceholderPage label="Settings" sub="Manage your account and preferences here." />,
};

export default function DashboardLayout() {
  const [activePage, setActivePage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const PageComponent = PAGES[activePage];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; }
        body { background: #000000; color: #fff; font-family: 'Inter', sans-serif; overflow: hidden; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(150,40,200,0.3); border-radius: 2px; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }

        .db-layout { display: flex; height: 100vh; width: 100vw; overflow: hidden; }

        .db-sidebar {
          width: ${collapsed ? "64px" : "220px"};
          min-width: ${collapsed ? "64px" : "220px"};
          height: 100vh;
          background: rgba(5,0,12,0.98);
          border-right: 1px solid rgba(150,40,200,0.15);
          display: flex; flex-direction: column;
          transition: width 0.25s ease, min-width 0.25s ease;
          overflow: hidden;
          flex-shrink: 0;
          z-index: 10;
        }

        .db-logo {
          display: flex; align-items: center; gap: 10px;
          padding: ${collapsed ? "16px 0" : "16px 20px"};
          justify-content: ${collapsed ? "center" : "flex-start"};
          border-bottom: 1px solid rgba(150,40,200,0.1);
          min-height: 60px;
        }
        .db-logo-text {
          font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 700; color: #fff;
          white-space: nowrap;
          opacity: ${collapsed ? 0 : 1};
          transition: opacity 0.15s;
        }

        .db-nav { flex: 1; padding: 12px 8px; display: flex; flex-direction: column; gap: 2px; overflow-y: auto; }

        .db-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: ${collapsed ? "10px 0" : "10px 12px"};
          justify-content: ${collapsed ? "center" : "flex-start"};
          border-radius: 10px; cursor: pointer;
          transition: all 0.2s;
          border: 1px solid transparent;
          color: rgba(255,255,255,0.4);
          font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 500;
          white-space: nowrap;
        }
        .db-nav-item:hover { color: rgba(255,255,255,0.8); background: rgba(150,40,200,0.08); }
        .db-nav-item.active { color: #C44FFF; background: rgba(150,40,200,0.12); border-color: rgba(150,40,200,0.2); }
        .db-nav-item svg { flex-shrink: 0; }
        .db-nav-label { opacity: ${collapsed ? 0 : 1}; transition: opacity 0.15s; overflow: hidden; }

        .db-collapse { padding: 12px 8px; border-top: 1px solid rgba(150,40,200,0.1); }
        .db-collapse-btn {
          display: flex; align-items: center; gap: 8px;
          padding: ${collapsed ? "9px 0" : "9px 12px"};
          justify-content: ${collapsed ? "center" : "flex-start"};
          border-radius: 10px; cursor: pointer;
          border: 1px solid rgba(255,255,255,0.08);
          background: transparent; color: rgba(255,255,255,0.35);
          font-family: 'Space Mono', monospace; font-size: 10px; font-weight: 700;
          transition: all 0.2s; width: 100%;
        }
        .db-collapse-btn:hover { color: rgba(255,255,255,0.7); border-color: rgba(150,40,200,0.3); }
        .db-collapse-label { opacity: ${collapsed ? 0 : 1}; transition: opacity 0.15s; white-space: nowrap; }

        .db-main { flex: 1; height: 100vh; overflow-y: auto; position: relative; z-index: 1; }

        .db-topbar {
          position: sticky; top: 0; z-index: 5;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 48px; height: 52px;
          background: rgba(0,0,0,0.85); backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(150,40,200,0.1);
        }
        .db-topbar-title { font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.45); }
        .db-avatar { width: 30px; height: 30px; border-radius: 50%; background: rgba(150,40,200,0.2); border: 1px solid rgba(150,40,200,0.4); display: flex; align-items: center; justify-content: center; font-family: 'Space Mono', monospace; font-size: 10px; font-weight: 700; color: #C44FFF; }

        @media(max-width:768px){
          .db-sidebar { display: none; }
          .db-topbar { padding: 0 16px; }
        }
      `}</style>

      <div className="db-layout">
        {/* BG */}
        <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          {STARS.map(s => <div key={s.id} style={{ position: "absolute", width: s.size, height: s.size, background: "#fff", borderRadius: "50%", top: s.top, left: s.left, opacity: s.opacity }} />)}
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 50% 40% at 20% 0%, rgba(150,40,200,0.06) 0%, transparent 70%)" }} />
        </div>

        {/* SIDEBAR */}
        <aside className="db-sidebar">
          <div className="db-logo">
            <img src="/logodfs.png" alt="Djune Frost" style={{ width: 30, height: 30, objectFit: "contain", flexShrink: 0 }} />
            <span className="db-logo-text">Djune Frost</span>
          </div>

          <nav className="db-nav">
            {NAV_ITEMS.map(item => (
              <div key={item.id} className={`db-nav-item${activePage === item.id ? " active" : ""}`} onClick={() => setActivePage(item.id)}>
                {item.icon}
                <span className="db-nav-label">{item.label}</span>
              </div>
            ))}
          </nav>

          <div className="db-collapse">
            <button className="db-collapse-btn" onClick={() => setCollapsed(!collapsed)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {collapsed ? <polyline points="9 18 15 12 9 6"/> : <polyline points="15 18 9 12 15 6"/>}
              </svg>
              <span className="db-collapse-label">{collapsed ? "" : "Collapse"}</span>
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="db-main">
          <div className="db-topbar">
            <span className="db-topbar-title">{NAV_ITEMS.find(i => i.id === activePage)?.label}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'Space Mono', monospace" }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block", boxShadow: "0 0 6px #4ade80", animation: "blink 2s infinite" }} />
                Live
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "'Space Mono', monospace" }}>@djunefrost</div>
              <div className="db-avatar">DF</div>
            </div>
          </div>

          <PageComponent />
        </main>
      </div>
    </>
  );
}
