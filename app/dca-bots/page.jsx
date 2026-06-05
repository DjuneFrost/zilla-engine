"use client";
import { useState, useEffect } from "react";

const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i, top: `${(i * 37 + 11) % 100}%`, left: `${(i * 53 + 7) % 100}%`,
  size: i % 5 === 0 ? 2.5 : i % 3 === 0 ? 1.5 : 1,
  opacity: ((i * 17 + 3) % 6) * 0.04 + 0.03,
  delay: `${(i * 0.3) % 4}s`,
}));

function BotCard({ token, logo, avgEntry, deployed, currentPrice, config }) {
  const amount = deployed / avgEntry;
  const pnlPct = currentPrice ? ((currentPrice - avgEntry) / avgEntry) * 100 : 0;
  const pnlUsd = currentPrice ? (amount * currentPrice) - deployed : 0;
  const isPos = pnlPct >= 0;

  return (
    <div style={{ borderRadius: 20, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(13,10,10,0.6)", overflow: "hidden", backdropFilter: "blur(10px)" }}>
      {/* Header */}
      <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={logo} width={36} height={36} style={{ borderRadius: "50%" }} alt={token} />
          <div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 700, color: "#fff" }}>{token}</div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 2, letterSpacing: "1px" }}>Zone-based DCA</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#cc0000", boxShadow: "0 0 6px #cc0000", animation: "blink 2s infinite" }} />
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#fff", fontWeight: 700 }}>RUNNING</span>
        </div>
      </div>

      {/* PnL Banner */}
      <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.03)" }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.25)", marginBottom: 6, letterSpacing: "1px", textTransform: "uppercase" }}>Unrealized PnL</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 42, fontWeight: 900, color: isPos ? "#4ade80" : "#f87171", letterSpacing: "-1px", lineHeight: 1 }}>
            {isPos ? "+" : ""}{pnlPct.toFixed(1)}%
          </div>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 16, color: isPos ? "rgba(74,222,128,0.6)" : "rgba(248,113,113,0.6)", fontWeight: 700 }}>
            {isPos ? "+" : ""}${pnlUsd.toFixed(0)}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0 }}>
        {[
          { label: "Avg Entry", value: `$${avgEntry.toLocaleString()}` },
          { label: "Current Price", value: currentPrice ? `$${currentPrice.toLocaleString()}` : "—" },
          { label: "Deployed", value: `$${deployed.toLocaleString()}` },
          { label: "Accumulated", value: `${amount.toFixed(4)} ${token.split("/")[0]}` },
          { label: "Position Value", value: currentPrice ? `$${(amount * currentPrice).toFixed(0)}` : "—" },
          { label: "Entries", value: config?.entries ?? "—" },
        ].map((s, i) => (
          <div key={i} style={{ padding: "16px 20px", borderRight: i % 3 !== 2 ? "1px solid rgba(255,255,255,0.04)" : "none", borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.22)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700, color: "#fff" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Config */}
      {config ? (
        <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.3)" }}>
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.2)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 12 }}>Bot Configuration</div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {Object.entries(config).filter(([k]) => k !== "entries").map(([k, v]) => (
              <div key={k}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>{k}</div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "rgba(255,255,255,0.55)" }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ padding: "14px 24px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.2)", letterSpacing: "1px" }}>CONFIG PENDING — SEND YOUR BOT SETUP TO CONNECT</span>
        </div>
      )}
    </div>
  );
}

export default function DcaBotsPage() {
  const [solPrice, setSolPrice] = useState(null);
  const [hypePrice, setHypePrice] = useState(null);
  const [btcPrice, setBtcPrice] = useState(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const [s, h, b] = await Promise.all([
          fetch("/api/prices?id=solana"),
          fetch("/api/prices?id=hyperliquid"),
          fetch("/api/prices?id=bitcoin"),
        ]);
        const sd = await s.json(); const hd = await h.json(); const bd = await b.json();
        setSolPrice(sd.solana?.usd);
        setHypePrice(hd.hyperliquid?.usd);
        setBtcPrice(bd.bitcoin?.usd);
      } catch {}
    };
    fetchPrices();
    const iv = setInterval(fetchPrices, 30000);
    return () => clearInterval(iv);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0d0f1a; color: #fff; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0d0f1a; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 0 48px; height: 64px; background: rgba(13,15,26,0.92); backdrop-filter: blur(24px); border-bottom: 1px solid rgba(255,255,255,0.06); }
        .nav-logo { font-family: 'Cinzel', serif; font-size: 18px; font-weight: 700; color: #fff; text-decoration: none; letter-spacing: 2px; }
        .nav-logo span { color: rgba(255,255,255,0.25); }
        .nav-links { display: flex; align-items: center; gap: 4px; }
        .nav-link { padding: 7px 16px; border-radius: 10px; font-family: 'Space Mono', monospace; font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.35); text-decoration: none; letter-spacing: 0.5px; transition: all 0.2s; border: 1px solid transparent; }
        .nav-link:hover { color: rgba(255,255,255,0.75); border-color: rgba(255,255,255,0.08); }
        .nav-link.active { color: #fff; background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.1); }
        @media(max-width:768px){ .nav { padding: 0 16px; } .nav-links { gap: 2px; } .nav-link { padding: 6px 10px; font-size: 10px; } .page-wrap { padding: 0 16px !important; } }
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
          <a href="/dca-bots" className="nav-link active">DCA Bots</a>
          <a href="/strategy" className="nav-link">Strategy</a>
        </div>
        <a href="https://pangeon.xyz" target="_blank" rel="noreferrer" style={{ padding: "8px 20px", borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none", fontFamily: "'Cinzel', serif", letterSpacing: "0.5px" }}>
          Launch Pangeon ↗
        </a>
      </nav>

      <div style={{ position: "relative", zIndex: 1, paddingTop: 120, paddingBottom: 100 }}>
        <div className="page-wrap" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px" }}>
          {/* Header */}
          <div style={{ marginBottom: 64 }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: 16 }}>Automated Accumulation</div>
            <div style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(48px, 6vw, 80px)", fontWeight: 900, lineHeight: 0.95, letterSpacing: "-1px", marginBottom: 20 }}>
              <div>DCA</div>
              <div style={{ WebkitTextStroke: "1.5px rgba(255,255,255,0.25)", color: "transparent" }}>BOTS</div>
            </div>
            <div style={{ fontSize: 15, color: "rgba(255,255,255,0.28)", maxWidth: 520, lineHeight: 1.7, fontWeight: 300 }}>
              Zone-based DCA strategies accumulating{" "}
              <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>SOL</span>,{" "}
              <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>HYPE</span> and{" "}
              <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>BTC</span> in real time.
              Entries defined by market structure, not a calendar.
            </div>
          </div>

          {/* Bot Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <BotCard token="SOL" logo="https://assets.coingecko.com/coins/images/4128/small/solana.png" avgEntry={81} deployed={450} currentPrice={solPrice} config={null} />
            <BotCard token="HYPE" logo="https://dd.dexscreener.com/ds-data/tokens/hyperliquid/0x0d01dc56dcaaca66ad901c959b4011ec.png" avgEntry={30} deployed={360} currentPrice={hypePrice} config={null} />
            <BotCard token="BTC" logo="https://assets.coingecko.com/coins/images/1/small/bitcoin.png" avgEntry={67852.54} deployed={845} currentPrice={btcPrice} config={null} />
          </div>

          {/* Disclaimer */}
          <div style={{ marginTop: 48, padding: "20px 28px", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.15)", lineHeight: 1.8, letterSpacing: "0.3px" }}>
              ⚠ These results represent real positions and do not constitute financial advice. Past performance does not guarantee future results. DCA does not protect against loss in a declining market.
            </div>
          </div>
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
