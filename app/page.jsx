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

const STARS = Array.from({ length: 50 }, (_, i) => ({
  id: i, top: `${(i * 37 + 11) % 100}%`, left: `${(i * 53 + 7) % 100}%`,
  size: i % 4 === 0 ? 2 : 1, opacity: ((i * 17 + 3) % 6) * 0.04 + 0.04,
}));

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
            <div key={i} onClick={() => setCurrent(i)} style={{ position: "absolute", left: "50%", top: 0, width: cardW, height: cardH, marginLeft: -cardW/2, borderRadius: 16, overflow: "hidden", border: i === current ? "1px solid rgba(255,255,255,0.25)" : "1px solid rgba(255,255,255,0.07)", cursor: i === current ? "default" : "pointer", transition: "all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)", boxShadow: i === current ? "0 24px 80px rgba(0,0,0,0.8)" : "none", ...style }}>
              <img src={`/${t.file}`} alt={t.token} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              {i === current && (
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 16px", background: "linear-gradient(transparent, rgba(0,0,0,0.85))", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: isMobile ? 12 : 14, fontWeight: 600, color: "#fff" }}>{t.token}</span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "1px" }}>LIVE TRADE</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button onClick={prev} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 14, cursor: "pointer", zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)" }}>←</button>
      <button onClick={next} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 14, cursor: "pointer", zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)" }}>→</button>
      <div style={{ position: "absolute", bottom: -20, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
        {TRADE_IMAGES.map((_, i) => (
          <div key={i} onClick={() => setCurrent(i)} style={{ width: i === current ? 16 : 5, height: 5, borderRadius: 3, background: i === current ? "#fff" : "rgba(255,255,255,0.2)", cursor: "pointer", transition: "all 0.3s" }} />
        ))}
      </div>
    </div>
  );
}

function PerfCard({ token, templateImg, logo, avgEntry, deployed, currentPrice }) {
  const amount = deployed / avgEntry;
  const pnlPct = currentPrice ? ((currentPrice - avgEntry) / avgEntry) * 100 : 0;
  const pnlUsd = currentPrice ? (amount * currentPrice) - deployed : 0;
  const isPos = pnlPct >= 0;

  return (
    <div style={{ position: "relative", flex: 1, minWidth: 0, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
      <img src={`/${templateImg}`} alt={token} style={{ width: "100%", height: "auto", display: "block" }} />
      <div style={{ position: "absolute", inset: 0, padding: "8% 7%" }}>
        <div style={{ position: "absolute", top: "28%", left: "7%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <img src={logo} width={28} height={28} style={{ borderRadius: "50%" }} alt={token} />
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "clamp(11px, 1.8vw, 15px)", color: "#fff", letterSpacing: 1, lineHeight: 1 }}>
              {amount.toFixed(3)} <span style={{ opacity: 0.6 }}>${token}</span> accumulated
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", top: "45%", left: "7%" }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(28px, 5vw, 48px)", color: isPos ? "#4ade80" : "#f87171", letterSpacing: 1, lineHeight: 1 }}>
            {isPos ? "+" : ""}{pnlPct.toFixed(1)}%
          </div>
        </div>
        <div style={{ position: "absolute", bottom: "12%", left: "7%", display: "flex", gap: "clamp(16px, 4vw, 40px)" }}>
          {[
            { label: "Avg Entry", val: `$${avgEntry.toLocaleString()}` },
            { label: "Current",   val: `$${currentPrice?.toLocaleString() || "—"}` },
            { label: "PnL",       val: `${isPos ? "+" : ""}$${pnlUsd.toFixed(0)}`, color: isPos ? "#4ade80" : "#f87171" },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: "clamp(9px, 1.5vw, 11px)", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "clamp(12px, 2vw, 16px)", fontWeight: 600, color: s.color || "#fff" }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DjuneFrostPage() {
  const [solPrice, setSolPrice] = useState(null);
  const [hypePrice, setHypePrice] = useState(null);
  const [btcPrice, setBtcPrice] = useState(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const [solRes, hypeRes, btcRes] = await Promise.all([
          fetch("/api/prices?id=solana"),
          fetch("/api/prices?id=hyperliquid"),
          fetch("/api/prices?id=bitcoin"),
        ]);
        const solData = await solRes.json();
        const hypeData = await hypeRes.json();
        const btcData = await btcRes.json();
        setSolPrice({ price: solData.solana?.usd, change: solData.solana?.usd_24h_change });
        setHypePrice({ price: hypeData.hyperliquid?.usd, change: hypeData.hyperliquid?.usd_24h_change });
        setBtcPrice({ price: btcData.bitcoin?.usd, change: btcData.bitcoin?.usd_24h_change });
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
        body { background: #181510; color: #fff; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #181510; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 2px; }

        .nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 0 48px; height: 64px; background: rgba(24,21,16,0.92); backdrop-filter: blur(24px); border-bottom: 1px solid rgba(255,255,255,0.06); }
        .nav-logo { font-family: 'Cinzel', serif; font-size: 18px; font-weight: 700; color: #fff; text-decoration: none; letter-spacing: 2px; }
        .nav-logo span { color: rgba(255,255,255,0.3); }

        .hero { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 120px 24px 80px; text-align: center; position: relative; overflow: hidden; }
        .hero-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 60px 60px; mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%); }

        .hero-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); font-size: 12px; color: rgba(255,255,255,0.45); letter-spacing: 0.5px; margin-bottom: 32px; font-family: 'Space Mono', monospace; text-transform: uppercase; }
        .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #14F195; box-shadow: 0 0 8px #14F195; animation: blink 2s infinite; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .hero-title { font-family: 'Cinzel', serif; font-size: clamp(60px, 10vw, 130px); line-height: 0.95; letter-spacing: -2px; margin-bottom: 28px; font-weight: 900; }
        .hero-title .outline { -webkit-text-stroke: 1.5px rgba(255,255,255,0.25); color: transparent; }

        .hero-sub { font-size: clamp(15px, 2vw, 18px); color: rgba(255,255,255,0.35); max-width: 520px; line-height: 1.7; margin-bottom: 48px; font-weight: 300; }

        .ticker { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
        .ticker-item { display: flex; align-items: center; gap: 10px; padding: 9px 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.07); background: rgba(255,255,255,0.03); }
        .ticker-sym { font-family: 'Space Mono', monospace; font-size: 12px; font-weight: 700; color: #fff; }
        .ticker-price { font-family: 'Space Mono', monospace; font-size: 12px; color: rgba(255,255,255,0.45); }
        .ticker-change { font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 6px; }
        .ticker-change.up { background: rgba(74,222,128,0.1); color: #4ade80; }
        .ticker-change.down { background: rgba(248,113,113,0.1); color: #f87171; }

        .section { padding: 100px 48px; max-width: 1400px; margin: 0 auto; }
        .section-label { font-family: 'Space Mono', monospace; font-size: 10px; color: rgba(255,255,255,0.22); letter-spacing: 3px; text-transform: uppercase; margin-bottom: 16px; }
        .section-title { font-family: 'Cinzel', serif; font-size: clamp(40px, 5vw, 72px); letter-spacing: 1px; line-height: 1; margin-bottom: 16px; font-weight: 700; }

        .perf-cards { display: flex; gap: 20px; margin-top: 48px; }

        .bot-header { text-align: center; margin-bottom: 72px; }
        .coming-soon-banner { margin-top: 72px; padding: 32px; border: 1px dashed rgba(255,255,255,0.1); border-radius: 16px; text-align: center; background: rgba(255,255,255,0.02); }
        .coming-soon-title { font-family: 'Cinzel', serif; font-size: 32px; letter-spacing: 2px; color: rgba(255,255,255,0.4); margin-bottom: 8px; font-weight: 700; }
        .coming-soon-desc { font-size: 14px; color: rgba(255,255,255,0.22); font-weight: 300; }

        .footer { border-top: 1px solid rgba(255,255,255,0.06); padding: 32px 48px; display: flex; align-items: center; justify-content: space-between; }

        @media(max-width:768px){
          .nav { padding: 0 16px; }
          .hero { padding: 100px 16px 60px; }
          .section { padding: 60px 16px; }
          .perf-cards { flex-direction: column; }
          .footer { flex-direction: column; gap: 16px; text-align: center; padding: 24px 16px; }
        }
      `}</style>

      {/* BG */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, background: "#181510", pointerEvents: "none" }}>
        {STARS.map(s => <div key={s.id} style={{ position: "absolute", width: s.size, height: s.size, background: "#fff", borderRadius: "50%", top: s.top, left: s.left, opacity: s.opacity }} />)}
      </div>

      {/* NAV */}
      <nav className="nav" style={{ position: "fixed", zIndex: 100 }}>
        <a href="/" className="nav-logo">DJUNE <span>FROST</span></a>
        <a href="https://pangeon.xyz" target="_blank" rel="noreferrer" style={{ padding: "8px 20px", borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none", fontFamily: "'Cinzel', serif", letterSpacing: "0.5px" }}>
          Launch Pangeon ↗
        </a>
      </nav>

      {/* HERO */}
      <section className="hero" style={{ position: "relative", zIndex: 1 }}>
        <div className="hero-grid" />
        <div className="hero-badge"><span className="hero-badge-dot" />Trader · Builder · CEO of Pangeon</div>
        <h1 className="hero-title">
          <div>DJUNE</div>
          <div className="outline">FROST</div>
        </h1>
        <p className="hero-sub">Trader, bot builder and CEO of Pangeon DEX. Zone-based DCA accumulation, automated strategies and on-chain tools — built in public.</p>
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
          {btcPrice && (
            <div className="ticker-item">
              <span className="ticker-sym">BTC</span>
              <span className="ticker-price">${btcPrice.price?.toLocaleString()}</span>
              <span className={`ticker-change ${btcPrice.change >= 0 ? "up" : "down"}`}>{btcPrice.change >= 0 ? "+" : ""}{btcPrice.change?.toFixed(2)}%</span>
            </div>
          )}
          <div className="ticker-item">
            <span className="ticker-sym" style={{ color: "rgba(255,255,255,0.3)" }}>MORE</span>
            <span className="ticker-price">SOON</span>
          </div>
        </div>
      </section>

      {/* PERF CARDS */}
      <section className="section" style={{ position: "relative", zIndex: 1, paddingTop: 10 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="section-label">Live Performance</div>
          <div className="section-title">DCA BOT RESULTS</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.28)", maxWidth: 480, margin: "0 auto", fontWeight: 300 }}>Real accumulation from our zone-based DCA bot. Prices update live.</div>
        </div>
        <div className="perf-cards">
          <PerfCard token="SOL" templateImg="dcasolana.png" logo="https://assets.coingecko.com/coins/images/4128/small/solana.png" avgEntry={81} deployed={450} currentPrice={solPrice?.price} />
          <PerfCard token="HYPE" templateImg="dcahype.png" logo="https://dd.dexscreener.com/ds-data/tokens/hyperliquid/0x0d01dc56dcaaca66ad901c959b4011ec.png" avgEntry={30} deployed={360} currentPrice={hypePrice?.price} />
          <PerfCard token="BTC" templateImg="dcabtc.png" logo="https://assets.coingecko.com/coins/images/1/small/bitcoin.png" avgEntry={67852.54} deployed={845} currentPrice={btcPrice?.price} />
        </div>
      </section>

      {/* TRADING BOT */}
      <section className="section" style={{ position: "relative", zIndex: 1 }}>
        <div className="bot-header">
          <div className="section-label">Trading Bot</div>
          <div className="section-title">REAL TRADES.<br />REAL RESULTS.</div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 18px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", fontSize: 12, fontFamily: "'Space Mono', monospace", marginBottom: 16 }}>
            ⏳ Coming End of Year 2026
          </div>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.3)", maxWidth: 520, margin: "0 auto", lineHeight: 1.7, fontWeight: 300 }}>
            Our advanced trading bot is currently in development. A preview of the kind of trades it will execute — precision entries, structured exits, maximum efficiency.
          </p>
        </div>
        <TradeCarousel />
        <div className="coming-soon-banner">
          <div className="coming-soon-title">COMING END OF YEAR</div>
          <div className="coming-soon-desc">Automated trading bot with zone-based entries, smart exits and capital protection — launching Q4 2026.</div>
        </div>
      </section>

      {/* BUILT BY */}
      <section style={{ padding: "60px 48px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.06)", position: "relative", zIndex: 1 }}>
        <img src="/armedcat.png" alt="Djune Frost" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(255,255,255,0.12)", display: "block", margin: "0 auto 16px" }} />
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.25)", letterSpacing: "0.5px" }}>Built by Djune Frost</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.15)", marginTop: 6, letterSpacing: 1 }}>CEO of Pangeon · Builder · Trader</div>
      </section>

      {/* FOOTER */}
      <footer className="footer" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: 2 }}>DJUNE FROST</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.18)", fontFamily: "'Space Mono', monospace" }}>© 2026 · Powered by Pangeon DEX</div>
        <a href="https://pangeon.xyz" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textDecoration: "none", fontFamily: "'DM Sans', sans-serif" }}>Pangeon DEX ↗</a>
      </footer>
    </>
  );
}
