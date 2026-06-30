"use client";
import { useState } from "react";

const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i, top: `${(i * 37 + 11) % 100}%`, left: `${(i * 53 + 7) % 100}%`,
  size: i % 5 === 0 ? 2.5 : i % 3 === 0 ? 1.5 : 1,
  opacity: ((i * 17 + 3) % 6) * 0.04 + 0.03,
}));

const STRATEGIES = [
  {
    file: "zigzag.png",
    name: "ZigZag Strategy",
    description: "Structure Pro is a professional market structure engine that automatically maps swing highs and swing lows on any chart, in real time, without repainting. Unlike classic ZigZag tools that silently redraw their pivots, Structure Pro freezes every confirmed pivot permanently and clearly separates it from the still-forming leg. Each pivot is automatically tagged with its structure label — HH, HL, LH, LL — giving you an instant read on whether the market is bullish or bearish. The BOS signal confirms trend continuation when price breaks a key level, while the CHoCH signal warns you of a potential reversal before the trend officially flips. A real-time dashboard shows you the overall structure, the active leg direction, the developing leg size in %, and the exact price level that would confirm the next pivot. Six built-in alerts fire on bar close — never mid-candle — so every signal is a settled fact before you act on it. Compatible with crypto, stocks and indices on any timeframe, Structure Pro is the foundation of the Djune Frost Strategy system — because before you trade the signal, you need to know the direction.",
    tag: "Indicator",
    date: "2026",
  }
];



export default function StrategyPage() {

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #000000; color: #fff; font-family: 'Inter', sans-serif; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #000000; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .nav { position: fixed; top: 12px; left: 50%; transform: translateX(-50%); z-index: 100; width: calc(100% - 280px); max-width: 1000px; }
        .nav-pill { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; background: rgba(8,0,20,0.92); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.1); border-radius: 50px; padding: 4px 8px 4px 14px; box-shadow: 0 4px 30px rgba(0,0,0,0.4); height: 44px; width: 100%; }
        .nav-links { display: flex; align-items: center; gap: 2px; justify-content: center; }
        .nav-link { padding: 6px 22px; border-radius: 50px; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.75); text-decoration: none; letter-spacing: 0.5px; transition: all 0.2s; border: 1px solid transparent; white-space: nowrap; }
        .nav-link:hover { color: rgba(255,255,255,0.8); }
        .nav-link.active { color: #C44FFF; background: transparent; border-color: transparent; text-shadow: 0 0 12px rgba(180,79,255,0.8), 0 0 24px rgba(150,40,200,0.5); }
        .nav-auth { display: flex; align-items: center; gap: 8px; justify-content: flex-end; padding-right: 4px; }
        .nav-login { padding: 6px 18px; border-radius: 50px; background: transparent; border: 1px solid transparent; color: rgba(255,255,255,0.85); font-size: 11px; font-weight: 700; text-decoration: none; font-family: 'Space Mono', monospace; letter-spacing: 0.5px; white-space: nowrap; cursor: default; }
        .nav-signup { padding: 6px 18px; border-radius: 50px; background: rgba(150,40,200,0.25); border: 1px solid rgba(150,40,200,0.5); color: #D44FFF; font-size: 11px; font-weight: 700; text-decoration: none; font-family: 'Space Mono', monospace; letter-spacing: 0.5px; white-space: nowrap; cursor: default; }

        @media(max-width:768px){ .nav { padding: 0 16px; } .nav-links { gap: 2px; } .nav-link { padding: 6px 10px; font-size: 10px; } .page-wrap { padding: 0 16px !important; } .strat-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* BG */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, background: "radial-gradient(ellipse 120% 80% at 50% 0%, #0a0008 0%, #000000 40%, #000000 100%)", pointerEvents: "none" }}>
        {STARS.map(s => <div key={s.id} style={{ position: "absolute", width: s.size, height: s.size, background: "#fff", borderRadius: "50%", top: s.top, left: s.left, opacity: s.opacity }} />)}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(150,40,200,0.07) 0%, transparent 70%)" }} />
      </div>
      {/* NAV */}
      <nav className="nav">
        <div className="nav-pill">
          <img src="/logodfs.png" alt="Djune Frost" style={{ height: 36, width: "auto", objectFit: "contain", flexShrink: 0, marginRight: 8 }} />
          <div className="nav-links">
            <a href="/" className="nav-link">Home</a>
            <a href="/dca-bots" className="nav-link">DCA Bots</a>
            <a href="/strategy" className="nav-link active">Strategy</a>
          </div>
          <div className="nav-auth"><span className="nav-login">Log in</span><span className="nav-signup">Sign up</span></div>
        </div>
      </nav>

      <div style={{ position: "relative", zIndex: 1, paddingTop: 120, paddingBottom: 100 }}>
        <div className="page-wrap" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px" }}>

          {/* Header */}
          <div style={{ marginBottom: 56 }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.8)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: 16 }}>Chart Analysis</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(48px, 6vw, 80px)", fontWeight: 900, lineHeight: 0.95, letterSpacing: "-1px", marginBottom: 20 }}>
              <div>TRADING <span style={{ WebkitTextStroke: "1.5px rgba(150,40,200,0.5)", color: "transparent" }}>STRATEGY</span></div>
            </div>
            <div style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", maxWidth: 520, lineHeight: 1.7, fontWeight: 300 }}>
              Real setups shared from TradingView. Zone-based entries, structured exits, and on-chain context — posted regularly.
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {STRATEGIES.map((item, i) => (
              <div key={i} style={{ borderRadius: 20, border: "1px solid rgba(150,40,200,0.2)", background: "rgba(8,0,20,0.6)", overflow: "hidden", backdropFilter: "blur(12px)", boxShadow: "0 8px 40px rgba(100,20,160,0.15)" }}>
                <div style={{ padding: "24px 28px", borderBottom: "1px solid rgba(150,40,200,0.12)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, fontWeight: 700, color: "#fff" }}>{item.name}</span>
                    <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, background: "rgba(150,40,200,0.15)", border: "1px solid rgba(150,40,200,0.3)", color: "#C44FFF", fontFamily: "'Space Mono', monospace", letterSpacing: "0.5px" }}>{item.tag}</span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontFamily: "'Space Mono', monospace", marginLeft: "auto" }}>{item.date}</span>
                  </div>
                  {item.description ? (
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.7, fontWeight: 300 }}>{item.description}</p>
                  ) : (
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.25)", lineHeight: 1.7, fontStyle: "italic" }}>Description coming soon...</p>
                  )}
                </div>
                <div style={{ overflow: "hidden" }}>
                  <img src={`/${item.file}`} alt={item.name} style={{ width: "100%", height: "auto", display: "block", transition: "transform 0.4s ease" }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "28px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: 2 }}>DJUNE FROST</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontFamily: "'Space Mono', monospace" }}>© 2026 · Powered by Pangeon DEX</div>
        <a href="https://pangeon.xyz" style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", textDecoration: "none" }}>Pangeon DEX ↗</a>
      </footer>
    </>
  );
}
