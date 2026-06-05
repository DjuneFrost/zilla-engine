"use client";
import { useState } from "react";

const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i, top: `${(i * 37 + 11) % 100}%`, left: `${(i * 53 + 7) % 100}%`,
  size: i % 5 === 0 ? 2.5 : i % 3 === 0 ? 1.5 : 1,
  opacity: ((i * 17 + 3) % 6) * 0.04 + 0.03,
}));

// ─── Add your TradingView screenshots here ───────────────────────────────────
// { file: "strategy1.jpg", pair: "BTC/USDT", timeframe: "4H",
//   type: "Long" | "Short", date: "Jun 2026", note: "..." }
const STRATEGIES = [];
// ─────────────────────────────────────────────────────────────────────────────

const FILTERS = ["All", "Long", "Short"];

function StrategyCard({ item }) {
  return (
    <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(13,10,10,0.6)", overflow: "hidden", backdropFilter: "blur(10px)", transition: "border-color 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}>
      <div style={{ position: "relative", aspectRatio: "16/9", background: "rgba(0,0,0,0.4)", overflow: "hidden" }}>
        <img src={`/${item.file}`} alt={item.pair} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div style={{ position: "absolute", top: 12, right: 12, padding: "4px 10px", borderRadius: 8, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 700, color: "#fff", letterSpacing: "1px" }}>
          {item.type.toUpperCase()}
        </div>
      </div>
      <div style={{ padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 16, fontWeight: 700, color: "#fff" }}>{item.pair}</div>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.35)", padding: "3px 8px", borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>{item.timeframe}</span>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.2)" }}>{item.date}</span>
          </div>
        </div>
        {item.note && <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.6, fontWeight: 300 }}>{item.note}</div>}
      </div>
    </div>
  );
}

export default function StrategyPage() {
  const [filter, setFilter] = useState("All");
  const filtered = STRATEGIES.filter(s => filter === "All" || s.type === filter);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d0f1a; color: #fff; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0d0f1a; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 0 48px; height: 64px; background: rgba(13,15,26,0.92); backdrop-filter: blur(24px); border-bottom: 1px solid rgba(255,255,255,0.06); }
        .nav-logo { font-family: 'Cinzel', serif; font-size: 18px; font-weight: 700; color: #fff; text-decoration: none; letter-spacing: 2px; }
        .nav-logo span { color: rgba(255,255,255,0.25); }
        .nav-links { display: flex; align-items: center; gap: 4px; }
        .nav-link { padding: 7px 16px; border-radius: 10px; font-family: 'Space Mono', monospace; font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.35); text-decoration: none; letter-spacing: 0.5px; transition: all 0.2s; border: 1px solid transparent; }
        .nav-link:hover { color: rgba(255,255,255,0.75); border-color: rgba(255,255,255,0.08); }
        .nav-link.active { color: #fff; background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.1); }
        @media(max-width:768px){ .nav { padding: 0 16px; } .nav-links { gap: 2px; } .nav-link { padding: 6px 10px; font-size: 10px; } .page-wrap { padding: 0 16px !important; } .strat-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* BG */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, background: "radial-gradient(ellipse 120% 80% at 50% 0%, #110b0b 0%, #0d0f1a 40%, #080a14 100%)", pointerEvents: "none" }}>
        {STARS.map(s => <div key={s.id} style={{ position: "absolute", width: s.size, height: s.size, background: "#fff", borderRadius: "50%", top: s.top, left: s.left, opacity: s.opacity }} />)}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(120,0,0,0.07) 0%, transparent 70%)" }} />
      </div>

      {/* NAV */}
      <nav className="nav">
        <a href="/" className="nav-logo">DJUNE <span>FROST</span></a>
        <div className="nav-links">
          <a href="/" className="nav-link">Home</a>
          <a href="/dca-bots" className="nav-link">DCA Bots</a>
          <a href="/strategy" className="nav-link active">Strategy</a>
        </div>
        <a href="https://pangeon.xyz" target="_blank" rel="noreferrer" style={{ padding: "8px 20px", borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none", fontFamily: "'Cinzel', serif", letterSpacing: "0.5px" }}>
          Launch Pangeon ↗
        </a>
      </nav>

      <div style={{ position: "relative", zIndex: 1, paddingTop: 120, paddingBottom: 100 }}>
        <div className="page-wrap" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px" }}>

          {/* Header */}
          <div style={{ marginBottom: 56 }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: 16 }}>Chart Analysis</div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(48px, 6vw, 80px)", fontWeight: 900, lineHeight: 0.95, letterSpacing: "-1px", marginBottom: 20 }}>
              <div>TRADING</div>
              <div style={{ WebkitTextStroke: "1.5px rgba(255,255,255,0.25)", color: "transparent" }}>STRATEGY</div>
            </div>
            <div style={{ fontSize: 15, color: "rgba(255,255,255,0.28)", maxWidth: 520, lineHeight: 1.7, fontWeight: 300 }}>
              Real setups shared from TradingView. Zone-based entries, structured exits, and on-chain context — posted regularly.
            </div>
          </div>

          {/* Filter bar */}
          {STRATEGIES.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginBottom: 40 }}>
              {FILTERS.map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{ padding: "7px 18px", borderRadius: 10, fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 700, letterSpacing: "0.5px", cursor: "pointer", transition: "all 0.2s", border: "1px solid", borderColor: filter === f ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.07)", background: filter === f ? "rgba(255,255,255,0.07)" : "transparent", color: filter === f ? "#fff" : "rgba(255,255,255,0.35)" }}>
                  {f}
                </button>
              ))}
            </div>
          )}

          {/* Grid or Empty State */}
          {filtered.length > 0 ? (
            <div className="strat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 20 }}>
              {filtered.map((item, i) => <StrategyCard key={i} item={item} />)}
            </div>
          ) : (
            <div style={{ marginTop: 48 }}>
              <div style={{ padding: "80px 40px", borderRadius: 20, border: "1px dashed rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", textAlign: "center" }}>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: 28, fontWeight: 700, color: "rgba(255,255,255,0.3)", marginBottom: 12, letterSpacing: "2px" }}>COMING SOON</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.18)", fontWeight: 300, lineHeight: 1.7, maxWidth: 380, margin: "0 auto" }}>
                  TradingView chart analyses will be posted here regularly.<br />
                  Zone-based setups, breakouts, and swing trade ideas.
                </div>
                <div style={{ marginTop: 28, display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 18px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "1px" }}>FOLLOW ON TWITTER FOR UPDATES</span>
                </div>
              </div>

              {/* Strategy Types Preview */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 24 }}>
                {[
                  { label: "Zone DCA", desc: "Entries by support/resistance zones" },
                  { label: "Breakout", desc: "Volume-confirmed structure breaks" },
                  { label: "Swing Trade", desc: "Multi-day positions, strict risk mgmt" },
                ].map((s, i) => (
                  <div key={i} style={{ padding: "24px 20px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.02)", textAlign: "center" }}>
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.35)", marginBottom: 8, letterSpacing: "1px" }}>{s.label}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.18)", fontWeight: 300, lineHeight: 1.6 }}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "28px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: 2 }}>DJUNE FROST</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.15)", fontFamily: "'Space Mono', monospace" }}>© 2026 · Powered by Pangeon DEX</div>
        <a href="https://pangeon.xyz" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textDecoration: "none" }}>Pangeon DEX ↗</a>
      </footer>
    </>
  );
}
