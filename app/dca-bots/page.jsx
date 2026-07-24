"use client";
import { useState, useEffect } from "react";

const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i, top: `${(i * 37 + 11) % 100}%`, left: `${(i * 53 + 7) % 100}%`,
  size: i % 5 === 0 ? 2.5 : i % 3 === 0 ? 1.5 : 1,
  opacity: ((i * 17 + 3) % 6) * 0.04 + 0.03,
}));

function PerfCard({ token, templateImg, logo, avgEntry, deployed, currentPrice }) {
  const amount = deployed / avgEntry;
  const pnlPct = currentPrice ? ((currentPrice - avgEntry) / avgEntry) * 100 : 0;
  const pnlUsd = currentPrice ? (amount * currentPrice) - deployed : 0;
  const isPos = pnlPct >= 0;
  return (
    <div
      style={{ position: "relative", borderRadius: 16, overflow: "hidden",
        border: "1px solid rgba(150,40,200,0.35)",
        boxShadow: "0 8px 32px rgba(120,30,180,0.25), 0 0 0 1px rgba(150,40,200,0.1)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-8px)"; e.currentTarget.style.boxShadow = "0 20px 60px rgba(120,30,180,0.45), 0 0 30px rgba(150,40,200,0.25)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(120,30,180,0.25), 0 0 0 1px rgba(150,40,200,0.1)"; }}
    >
      <img src={`/${templateImg}`} alt={token} style={{ width: "100%", height: "auto", display: "block" }} />
      <div style={{ position: "absolute", inset: 0, padding: "8% 7%" }}>
        <div style={{ position: "absolute", top: "28%", left: "7%", display: "flex", alignItems: "center", gap: 10 }}>
          <img src={logo} width={28} height={28} style={{ borderRadius: "50%" }} alt={token} />
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "clamp(11px,1.8vw,15px)", color: "#fff", letterSpacing: 1 }}>
            {amount.toFixed(3)} <span style={{ opacity: 0.5 }}>${token}</span>
          </div>
        </div>
        <div style={{ position: "absolute", top: "45%", left: "7%", fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(22px,4vw,38px)", color: isPos ? "#4ade80" : "#f87171", letterSpacing: 1 }}>
          {isPos ? "+" : ""}{pnlPct.toFixed(1)}%
        </div>
        <div style={{ position: "absolute", bottom: "12%", left: "7%", display: "flex", gap: "clamp(12px,3vw,28px)" }}>
          {[
            { label: "Avg Entry", val: `$${avgEntry.toLocaleString()}` },
            { label: "Current", val: `$${currentPrice?.toLocaleString() || "—"}` },
            { label: "PnL", val: `${isPos ? "+" : ""}$${pnlUsd.toFixed(0)}`, color: isPos ? "#4ade80" : "#f87171" },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: "clamp(8px,1.3vw,10px)", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "clamp(10px,1.6vw,13px)", fontWeight: 600, color: s.color || "#fff" }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DcaBotsPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #000000; color: #fff; font-family: 'Inter', sans-serif; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #000000; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .nav { position: fixed; top: 12px; left: 50%; transform: translateX(-50%); z-index: 100; width: calc(100% - 280px); max-width: 1000px; }
        .nav-pill { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; background: rgba(8,0,20,0.92); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.1); border-radius: 50px; padding: 4px 8px 4px 14px; box-shadow: 0 4px 30px rgba(0,0,0,0.4); height: 44px; width: 100%; }
        .nav-mobile-bar { display: none; }
        .nav-burger { display: none; }
        .nav-mobile-menu { display: none; }
        @media(max-width:768px){
          .nav { display: none; }
          .nav-mobile-bar { display: flex; align-items: center; justify-content: space-between; position: fixed; top: 0; left: 0; right: 0; height: 64px; padding: 0 20px; background: rgba(5,0,12,0.95); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(150,40,200,0.15); z-index: 200; }
          .nav-burger { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 38px; height: 38px; border-radius: 12px; background: rgba(150,40,200,0.15); border: 1px solid rgba(150,40,200,0.3); cursor: pointer; }
          .nav-mobile-menu { display: flex; flex-direction: column; gap: 4px; position: fixed; top: 72px; left: 16px; right: 16px; background: rgba(8,0,20,0.97); backdrop-filter: blur(24px); border: 1px solid rgba(150,40,200,0.25); border-radius: 20px; padding: 12px; z-index: 199; box-shadow: 0 20px 60px rgba(0,0,0,0.6); }
        }
        .nav-burger span { display: block; width: 16px; height: 1.5px; background: #fff; margin: 2px 0; border-radius: 2px; transition: all 0.25s; }
        .nav-burger.open span:nth-child(1) { transform: translateY(5.5px) rotate(45deg); }
        .nav-burger.open span:nth-child(2) { opacity: 0; }
        .nav-burger.open span:nth-child(3) { transform: translateY(-5.5px) rotate(-45deg); }
        .nav-mobile-link { padding: 14px 16px; border-radius: 12px; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.85); text-decoration: none; transition: background 0.2s; }
        .nav-mobile-link.active { color: #C44FFF; background: rgba(150,40,200,0.12); }
        .nav-mobile-auth { display: flex; gap: 8px; padding: 8px 4px 4px; margin-top: 4px; border-top: 1px solid rgba(255,255,255,0.08); }
        .nav-mobile-login { flex: 1; text-align: center; padding: 10px; border-radius: 12px; font-family: 'Space Mono', monospace; font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.7); }
        .nav-mobile-signup { flex: 1; text-align: center; padding: 10px; border-radius: 12px; background: rgba(150,40,200,0.25); border: 1px solid rgba(150,40,200,0.5); font-family: 'Space Mono', monospace; font-size: 11px; font-weight: 700; color: #D44FFF; }
        .nav-links { display: flex; align-items: center; gap: 2px; justify-content: center; }
        .nav-link { padding: 6px 22px; border-radius: 50px; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.75); text-decoration: none; letter-spacing: 0.5px; transition: all 0.2s; border: 1px solid transparent; white-space: nowrap; }
        .nav-link:hover { color: rgba(255,255,255,0.8); }
        .nav-link.active { color: #C44FFF; background: transparent; border-color: transparent; text-shadow: 0 0 12px rgba(180,79,255,0.8), 0 0 24px rgba(150,40,200,0.5); }
        .nav-auth { display: flex; align-items: center; gap: 8px; justify-content: flex-end; padding-right: 4px; }
        .nav-login { padding: 6px 18px; border-radius: 50px; background: transparent; border: 1px solid transparent; color: rgba(255,255,255,0.85); font-size: 11px; font-weight: 700; text-decoration: none; font-family: 'Space Mono', monospace; letter-spacing: 0.5px; white-space: nowrap; cursor: default; }
        .nav-signup { padding: 6px 18px; border-radius: 50px; background: rgba(150,40,200,0.25); border: 1px solid rgba(150,40,200,0.5); color: #D44FFF; font-size: 11px; font-weight: 700; text-decoration: none; font-family: 'Space Mono', monospace; letter-spacing: 0.5px; white-space: nowrap; cursor: default; }
        .dca-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }

        @media(max-width:768px){
          .page-wrap { padding: 0 16px !important; }
          .dca-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* BG */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, background: "radial-gradient(ellipse 120% 80% at 50% 0%, #0a0008 0%, #000000 40%, #000000 100%)", pointerEvents: "none" }}>
        {STARS.map(s => <div key={s.id} style={{ position: "absolute", width: s.size, height: s.size, background: "#fff", borderRadius: "50%", top: s.top, left: s.left, opacity: s.opacity }} />)}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(150,40,200,0.07) 0%, transparent 70%)" }} />
      </div>

      {/* NAV — DESKTOP */}
      <nav className="nav">
        <div className="nav-pill">
          <img src="/dfslogo3.png" alt="Djune Frost" style={{ height: 34, width: "auto", objectFit: "contain", flexShrink: 0, marginRight: 8, maxHeight: "100%" }} />
          <div className="nav-links">
            <a href="/" className="nav-link">Home</a>
            <a href="/dca-bots" className="nav-link active">DCA Bots</a>
            <a href="/strategy" className="nav-link">Strategy</a>
          </div>
          <div className="nav-auth"><span className="nav-login">Log in</span><span className="nav-signup">Sign up</span></div>
        </div>
      </nav>

      {/* NAV — MOBILE */}
      <div className="nav-mobile-bar">
        <img src="/dfslogo3.png" alt="Djune Frost" style={{ height: 30, width: "auto", objectFit: "contain" }} />
        <div className={`nav-burger${mobileOpen ? " open" : ""}`} onClick={() => setMobileOpen(!mobileOpen)}>
          <span></span><span></span><span></span>
        </div>
      </div>
      {mobileOpen && (
        <div className="nav-mobile-menu">
          <a href="/" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>Home</a>
          <a href="/dca-bots" className="nav-mobile-link active" onClick={() => setMobileOpen(false)}>DCA Bots</a>
          <a href="/strategy" className="nav-mobile-link" onClick={() => setMobileOpen(false)}>Strategy</a>
          <div className="nav-mobile-auth">
            <span className="nav-mobile-login">Log in</span>
            <span className="nav-mobile-signup">Sign up</span>
          </div>
        </div>
      )}

      <div style={{ position: "relative", zIndex: 1, paddingTop: 130, paddingBottom: 100 }}>
        <div className="page-wrap" style={{ maxWidth: 1300, margin: "0 auto", padding: "0 48px" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(200,80,255,0.9)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: 16 }}>Live Performance</div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(40px, 5vw, 72px)", fontWeight: 700, letterSpacing: "1px", lineHeight: 1, marginBottom: 16, color: "#fff" }}>DCA BOT RESULTS</div>
            <div style={{ fontSize: 15, color: "rgba(255,255,255,0.85)", maxWidth: 520, margin: "0 auto", fontWeight: 300 }}>Real accumulation from our zone-based DCA bot. Prices update live.</div>
          </div>

          {/* Cards Grid */}
          <div className="dca-grid">
            <PerfCard token="SOL" templateImg="dcasolana1.png" logo="https://assets.coingecko.com/coins/images/4128/small/solana.png" avgEntry={81} deployed={450} currentPrice={solPrice} />
            <PerfCard token="HYPE" templateImg="dcahype1.png" logo="https://dd.dexscreener.com/ds-data/tokens/hyperliquid/0x0d01dc56dcaaca66ad901c959b4011ec.png" avgEntry={30} deployed={360} currentPrice={hypePrice} />
            <PerfCard token="BTC" templateImg="dcabtc1.png" logo="https://assets.coingecko.com/coins/images/1/small/bitcoin.png" avgEntry={67852.54} deployed={845} currentPrice={btcPrice} />
            <PerfCard token="ZEC" templateImg="dcazec1.png" logo="https://assets.coingecko.com/coins/images/486/small/circle-zcash-color.png" avgEntry={50} deployed={300} currentPrice={null} />
            <PerfCard token="GOLD" templateImg="dcagold1.png" logo="https://assets.lighter.xyz/fe/token/xau.png" avgEntry={2400} deployed={400} currentPrice={null} />
            <PerfCard token="SILVER" templateImg="dcasilver1.png" logo="https://assets.lighter.xyz/fe/token/xau.png" avgEntry={28} deployed={250} currentPrice={null} />
            <PerfCard token="SPCX" templateImg="dcaspcx1.png" logo="https://wsrv.nl/?w=32&h=32&url=https%3A%2F%2Fs3-symbol-logo.tradingview.com%2Fspacex.svg&dpr=2&quality=80" avgEntry={162} deployed={500} currentPrice={null} />
            <PerfCard token="NVDA" templateImg="dcanvda1.png" logo="https://assets.lighter.xyz/fe/token/nvda.png" avgEntry={114} deployed={500} currentPrice={null} />
            <PerfCard token="AAPL" templateImg="dcaaapl1.png" logo="https://wsrv.nl/?w=32&h=32&url=https%3A%2F%2Fs3-symbol-logo.tradingview.com%2Fapple.svg&dpr=2&quality=80" avgEntry={185} deployed={400} currentPrice={null} />
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(150,40,200,0.1)", padding: "24px 48px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 1 }}>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>© 2026 Djune Frost Strategy</div>
      </footer>
    </>
  );
}
