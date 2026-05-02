"use client";
import { useState, useEffect, useRef } from "react";

const TRADE_IMAGES = [
  { file: "ethtrade1.jpg", token: "ETH" },
  { file: "ethtrade2.jpg", token: "ETH" },
  { file: "ethtrade3.jpg", token: "ETH" },
  { file: "ethtrade4.jpg", token: "ETH" },
  { file: "ethtrade5.jpg", token: "ETH" },
  { file: "ethtrade6.jpg", token: "ETH" },
  { file: "dogetrade.jpg", token: "DOGE" },
  { file: "pepetrade.jpg", token: "PEPE" },
  { file: "hypetrade.jpg", token: "HYPE" },
];

function TradeCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const autoRef = useRef(null);
  const total = TRADE_IMAGES.length;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const prev = () => setCurrent(c => (c - 1 + total) % total);
  const next = () => setCurrent(c => (c + 1) % total);

  useEffect(() => {
    if (isPaused) return;
    autoRef.current = setInterval(() => setCurrent(c => (c + 1) % total), 3000);
    return () => clearInterval(autoRef.current);
  }, [isPaused, total]);

  const getStyle = (i) => {
    const diff = ((i - current + total) % total);
    const normalizedDiff = diff > total / 2 ? diff - total : diff;
    if (normalizedDiff === 0) return { transform: "translateX(0%) scale(1) rotateY(0deg)", zIndex: 10, opacity: 1, filter: "none" };
    if (Math.abs(normalizedDiff) === 1) return { transform: `translateX(${normalizedDiff * (isMobile ? 80 : 65)}%) scale(${isMobile ? 0.7 : 0.78}) rotateY(${-normalizedDiff * 25}deg)`, zIndex: 8, opacity: isMobile ? 0.4 : 0.7, filter: "brightness(0.6)" };
    if (Math.abs(normalizedDiff) === 2) return { transform: `translateX(${normalizedDiff * (isMobile ? 90 : 75)}%) scale(${isMobile ? 0.5 : 0.58}) rotateY(${-normalizedDiff * 30}deg)`, zIndex: 6, opacity: 0, filter: "brightness(0.4)" };
    return { transform: `translateX(${normalizedDiff * 80}%) scale(0.4)`, zIndex: 1, opacity: 0, filter: "brightness(0.2)" };
  };

  const cardW = isMobile ? 280 : 480;
  const cardH = isMobile ? 200 : 320;

  return (
    <div style={{ position: "relative", width: "100%", height: cardH + 20, perspective: "1200px", cursor: "grab" }}
      onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <div style={{ position: "relative", width: "100%", height: cardH, transformStyle: "preserve-3d" }}>
        {TRADE_IMAGES.map((t, i) => {
          const style = getStyle(i);
          return (
            <div key={i} onClick={() => setCurrent(i)} style={{ position: "absolute", left: "50%", top: 0, width: cardW, height: cardH, marginLeft: -cardW/2, borderRadius: 16, overflow: "hidden", border: i === current ? "1px solid rgba(255,255,255,0.3)" : "1px solid rgba(255,255,255,0.07)", cursor: i === current ? "default" : "pointer", transition: "all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)", boxShadow: i === current ? "0 24px 80px rgba(0,0,0,0.8)" : "none", ...style }}>
              <img src={`/${t.file}`} alt={t.token} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              {i === current && (
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 16px", background: "linear-gradient(transparent, rgba(0,0,0,0.85))", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: isMobile ? 12 : 14, fontWeight: 600, color: "#fff" }}>{t.token}</span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "1px" }}>LIVE TRADE</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button onClick={prev} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 14, cursor: "pointer", zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)" }}>←</button>
      <button onClick={next} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.15)", background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 14, cursor: "pointer", zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)" }}>→</button>
      <div style={{ position: "absolute", bottom: -20, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
        {TRADE_IMAGES.map((_, i) => (
          <div key={i} onClick={() => setCurrent(i)} style={{ width: i === current ? 16 : 5, height: 5, borderRadius: 3, background: i === current ? "#fff" : "rgba(255,255,255,0.2)", cursor: "pointer", transition: "all 0.3s" }} />
        ))}
      </div>
    </div>
  );
}

// ── PERF CARD ──────────────────────────────────────────
function PerfCard({ token, templateImg, logo, avgEntry, deployed, currentPrice }) {
  const amount = deployed / avgEntry;
  const pnlPct = currentPrice ? ((currentPrice - avgEntry) / avgEntry) * 100 : 0;
  const pnlUsd = currentPrice ? (amount * currentPrice) - deployed : 0;
  const isPos = pnlPct >= 0;

  return (
    <div style={{ position: "relative", flex: 1, minWidth: 0, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
      {/* Template image en fond */}
      <img src={`/${templateImg}`} alt={token} style={{ width: "100%", height: "auto", display: "block" }} />

      {/* Overlay avec les données */}
      <div style={{ position: "absolute", inset: 0, padding: "8% 7%" }}>

        {/* Logo token + montant */}
        <div style={{ position: "absolute", top: "28%", left: "7%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <img src={logo} width={28} height={28} style={{ borderRadius: "50%" }} alt={token} />
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(13px, 2vw, 17px)", color: "#fff", letterSpacing: 1, lineHeight: 1 }}>
                {amount.toFixed(3)} <span style={{ opacity: 0.6 }}>${token}</span> accumulated
              </div>
            </div>
          </div>
        </div>

        {/* PnL % en gros */}
        <div style={{ position: "absolute", top: "45%", left: "7%" }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(28px, 5vw, 48px)", color: isPos ? "#4ade80" : "#f87171", letterSpacing: 1, lineHeight: 1 }}>
            {isPos ? "+" : ""}{pnlPct.toFixed(1)}%
          </div>
        </div>

        {/* Stats en bas */}
        <div style={{ position: "absolute", bottom: "12%", left: "7%", display: "flex", gap: "clamp(16px, 4vw, 40px)" }}>
          <div>
            <div style={{ fontSize: "clamp(9px, 1.5vw, 11px)", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Avg Entry</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "clamp(12px, 2vw, 16px)", fontWeight: 600, color: "#fff" }}>${avgEntry}</div>
          </div>
          <div>
            <div style={{ fontSize: "clamp(9px, 1.5vw, 11px)", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Current</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "clamp(12px, 2vw, 16px)", fontWeight: 600, color: "#fff" }}>${currentPrice?.toFixed(2) || "—"}</div>
          </div>
          <div>
            <div style={{ fontSize: "clamp(9px, 1.5vw, 11px)", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>PnL</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "clamp(12px, 2vw, 16px)", fontWeight: 600, color: isPos ? "#4ade80" : "#f87171" }}>
              {isPos ? "+" : ""}${pnlUsd.toFixed(0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [solPrice, setSolPrice] = useState(null);
  const [hypePrice, setHypePrice] = useState(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const [solRes, hypeRes] = await Promise.all([
          fetch("/api/prices?id=solana"),
          fetch("/api/prices?id=hyperliquid"),
        ]);
        const solData = await solRes.json();
        const hypeData = await hypeRes.json();
        setSolPrice({ price: solData.solana?.usd, change: solData.solana?.usd_24h_change });
        setHypePrice({ price: hypeData.hyperliquid?.usd, change: hypeData.hyperliquid?.usd_24h_change });
      } catch {}
    };
    fetchPrices();
    const iv = setInterval(fetchPrices, 30000);
    return () => clearInterval(iv);
  }, []);

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
        .hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 120px 24px 80px; text-align: center; position: relative; overflow: hidden; }
        .hero-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px); background-size: 60px 60px; mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%); }
        .hero-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.04); font-size: 12px; color: rgba(255,255,255,0.5); letter-spacing: 0.5px; margin-bottom: 32px; }
        .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #fff; animation: blink 2s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        .hero-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(72px, 12vw, 160px); line-height: 0.9; letter-spacing: -2px; margin-bottom: 28px; }
        .hero-title .outline { -webkit-text-stroke: 1.5px rgba(255,255,255,0.7); color: transparent; }
        .hero-sub { font-size: clamp(15px, 2vw, 18px); color: rgba(255,255,255,0.4); max-width: 520px; line-height: 1.7; margin-bottom: 48px; font-weight: 400; }
        .ticker { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
        .ticker-item { display: flex; align-items: center; gap: 10px; padding: 10px 18px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.03); }
        .ticker-sym { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 600; color: #fff; }
        .ticker-price { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: rgba(255,255,255,0.5); }
        .ticker-change { font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 6px; }
        .ticker-change.up { background: rgba(255,255,255,0.08); color: #fff; }
        .ticker-change.down { background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.4); }
        .perf-section { padding: 100px 48px 60px; max-width: 1200px; margin: 0 auto; }
        .perf-cards { display: flex; gap: 20px; }
        .bot-section { padding: 80px 48px; max-width: 1200px; margin: 0 auto; }
        .bot-header { text-align: center; margin-bottom: 72px; }
        .bot-label { font-size: 11px; color: rgba(255,255,255,0.25); letter-spacing: 3px; text-transform: uppercase; margin-bottom: 16px; }
        .bot-title { font-family: 'Bebas Neue', sans-serif; font-size: clamp(48px, 6vw, 80px); letter-spacing: 1px; line-height: 1; margin-bottom: 20px; }
        .bot-badge { display: inline-flex; align-items: center; gap: 8px; padding: 8px 20px; border-radius: 20px; border: 1px solid rgba(255,165,0,0.3); background: rgba(255,165,0,0.06); color: rgba(255,165,0,0.8); font-size: 13px; font-weight: 600; margin-bottom: 20px; }
        .bot-desc { font-size: 15px; color: rgba(255,255,255,0.35); max-width: 520px; margin: 0 auto; line-height: 1.7; }
        .coming-soon-banner { margin-top: 72px; padding: 32px; border: 1px dashed rgba(255,165,0,0.2); border-radius: 16px; text-align: center; background: rgba(255,165,0,0.02); }
        .coming-soon-title { font-family: 'Bebas Neue', sans-serif; font-size: 36px; letter-spacing: 2px; color: rgba(255,165,0,0.7); margin-bottom: 8px; }
        .coming-soon-desc { font-size: 14px; color: rgba(255,255,255,0.25); }
        .footer { border-top: 1px solid rgba(255,255,255,0.06); padding: 32px 48px; display: flex; align-items: center; justify-content: space-between; }
        .footer-logo { font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 3px; color: rgba(255,255,255,0.4); }
        .footer-copy { font-size: 12px; color: rgba(255,255,255,0.2); }
        .footer-link { font-size: 12px; color: rgba(255,255,255,0.3); text-decoration: none; }
        .footer-link:hover { color: #fff; }
        @media(max-width:768px){
          .ze-nav { padding: 0 16px; }
          .hero { padding: 100px 16px 60px; }
          .perf-section { padding: 60px 16px; }
          .perf-cards { flex-direction: column; }
          .bot-section { padding: 60px 16px 80px; }
          .footer { flex-direction: column; gap: 16px; text-align: center; padding: 24px 16px; }
        }
      `}</style>

      {/* NAV */}
      <nav className="ze-nav">
        <a href="/" className="ze-logo">ZILLA <span>ENGINE</span></a>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 12, color: "rgba(255,255,255,0.25)", fontSize: 13, fontWeight: 500, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
          🔒 Zilla Engine
        </div>
        <a href="https://pangeon.xyz" target="_blank" rel="noreferrer" style={{ padding: "8px 20px", borderRadius: 8, background: "#fff", color: "#080808", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
          Launch App ↗
        </a>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-grid" />
        <div className="hero-badge"><span className="hero-badge-dot" />Structure-based DCA — Now in Beta</div>
        <h1 className="hero-title"><div>ZILLA</div><div className="outline">ENGINE</div></h1>
        <p className="hero-sub">Zone-based accumulation bot for Solana and HyperLiquid tokens. Buy the dips systematically. Protect your capital. Let the market come to you.</p>
        <div className="ticker">
          {solPrice && (
            <div className="ticker-item">
              <span className="ticker-sym">SOL</span>
              <span className="ticker-price">${solPrice.price?.toFixed(2)}</span>
              <span className={`ticker-change ${solPrice.change >= 0 ? "up" : "down"}`}>{solPrice.change >= 0 ? "+" : ""}{solPrice.change?.toFixed(2)}%</span>
            </div>
          )}
          {hypePrice && (
            <div className="ticker-item">
              <span className="ticker-sym">HYPE</span>
              <span className="ticker-price">${hypePrice.price?.toFixed(2)}</span>
              <span className={`ticker-change ${hypePrice.change >= 0 ? "up" : "down"}`}>{hypePrice.change >= 0 ? "+" : ""}{hypePrice.change?.toFixed(2)}%</span>
            </div>
          )}
          <div className="ticker-item">
            <span className="ticker-sym" style={{ color: "rgba(255,255,255,0.4)" }}>MORE</span>
            <span className="ticker-price">COMING SOON</span>
          </div>
        </div>
        <div style={{ marginTop: 48, padding: "20px 40px", border: "1px dashed rgba(255,255,255,0.12)", borderRadius: 14, textAlign: "center" }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: 8 }}>More info coming soon</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.15)" }}>Performance results, strategy details and full launch incoming.</div>
        </div>
      </section>

      {/* PERF CARDS */}
      <section className="perf-section">
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: 3, textTransform: "uppercase", marginBottom: 12 }}>Live Performance</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(40px, 5vw, 64px)", letterSpacing: 1, lineHeight: 1, marginBottom: 12 }}>DCA BOT RESULTS</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", maxWidth: 480, margin: "0 auto" }}>Real accumulation from our zone-based DCA bot. Prices update live.</div>
        </div>
        <div className="perf-cards">
          <PerfCard token="SOL" templateImg="dcasolana.png" logo="https://assets.coingecko.com/coins/images/4128/small/solana.png" avgEntry={81} deployed={450} currentPrice={solPrice?.price} />
          <PerfCard token="HYPE" templateImg="dcahype.png" logo="https://dd.dexscreener.com/ds-data/tokens/hyperliquid/0x0d01dc56dcaaca66ad901c959b4011ec.png" avgEntry={30} deployed={360} currentPrice={hypePrice?.price} />
        </div>
      </section>

      {/* TRADING BOT SECTION */}
      <section className="bot-section">
        <div className="bot-header">
          <div className="bot-label">Trading Bot</div>
          <h2 className="bot-title">REAL TRADES.<br />REAL RESULTS.</h2>
          <div className="bot-badge">⏳ Coming End of Year 2026</div>
          <p className="bot-desc">Our advanced trading bot is currently in development. A preview of the kind of trades it will execute — precision entries, structured exits, maximum efficiency.</p>
        </div>
        <TradeCarousel />
        <div className="coming-soon-banner">
          <div className="coming-soon-title">COMING END OF YEAR</div>
          <div className="coming-soon-desc">Automated trading bot with zone-based entries, smart exits and capital protection — launching Q4 2026.</div>
        </div>
      </section>

      {/* BUILT BY */}
      <section style={{ padding: "60px 48px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <img src="/armedcat.png" alt="Builder" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.15)", display: "block", margin: "0 auto 16px" }} />
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.3)", letterSpacing: "0.5px" }}>Built by your favorite cat </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-logo">ZILLA ENGINE</div>
        <div className="footer-copy">© 2026 Zilla Engine. Powered by Pangeon DEX.</div>
        <a href="https://pangeon.xyz" className="footer-link">Pangeon DEX</a>
      </footer>
    </>
  );
}
