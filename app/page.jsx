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

const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  top: `${(i * 37 + 11) % 100}%`,
  left: `${(i * 53 + 7) % 100}%`,
  size: i % 5 === 0 ? 2.5 : i % 3 === 0 ? 1.5 : 1,
  opacity: ((i * 17 + 3) % 6) * 0.04 + 0.03,
  delay: `${(i * 0.3) % 4}s`,
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
    const nd = diff > total / 2 ? diff - total : diff;
    if (nd === 0) return { transform: "translateX(0%) scale(1) rotateY(0deg)", zIndex: 10, opacity: 1, filter: "none" };
    if (Math.abs(nd) === 1) return { transform: `translateX(${nd * (isMobile ? 80 : 65)}%) scale(${isMobile ? 0.7 : 0.78}) rotateY(${-nd * 25}deg)`, zIndex: 8, opacity: isMobile ? 0.4 : 0.7, filter: "brightness(0.6)" };
    if (Math.abs(nd) === 2) return { transform: `translateX(${nd * (isMobile ? 90 : 75)}%) scale(${isMobile ? 0.5 : 0.58}) rotateY(${-nd * 30}deg)`, zIndex: 6, opacity: 0, filter: "brightness(0.4)" };
    return { transform: `translateX(${nd * 80}%) scale(0.4)`, zIndex: 1, opacity: 0 };
  };

  const cardW = isMobile ? 280 : 480;
  const cardH = isMobile ? 200 : 320;

  return (
    <div style={{ position: "relative", width: "100%", height: cardH + 20, perspective: "1200px" }}
      onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <div style={{ position: "relative", width: "100%", height: cardH, transformStyle: "preserve-3d" }}>
        {TRADE_IMAGES.map((t, i) => (
          <div key={i} onClick={() => setCurrent(i)} style={{ position: "absolute", left: "50%", top: 0, width: cardW, height: cardH, marginLeft: -cardW/2, borderRadius: 16, overflow: "hidden", border: i === current ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.05)", cursor: i === current ? "default" : "pointer", transition: "all 0.5s cubic-bezier(0.25,0.46,0.45,0.94)", boxShadow: i === current ? "0 24px 80px rgba(0,0,0,0.9), 0 0 40px rgba(140,0,0,0.15)" : "none", ...getStyle(i) }}>
            <img src={`/${t.file}`} alt={t.token} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            {i === current && (
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 16px", background: "linear-gradient(transparent, rgba(0,0,0,0.9))", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: isMobile ? 12 : 14, fontWeight: 700, color: "#fff" }}>{t.token}</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.9)", letterSpacing: "2px", fontFamily: "'Space Mono', monospace" }}>LIVE TRADE</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <button onClick={prev} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(13,15,26,0.8)", color: "#fff", fontSize: 14, cursor: "pointer", zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)" }}>←</button>
      <button onClick={next} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(13,15,26,0.8)", color: "#fff", fontSize: 14, cursor: "pointer", zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)" }}>→</button>
      <div style={{ position: "absolute", bottom: -20, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
        {TRADE_IMAGES.map((_, i) => (
          <div key={i} onClick={() => setCurrent(i)} style={{ width: i === current ? 16 : 5, height: 5, borderRadius: 3, background: i === current ? "#9B30D0" : "rgba(255,255,255,0.15)", cursor: "pointer", transition: "all 0.3s" }} />
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
    <div
      style={{ position: "relative", flex: 1, minWidth: 0, borderRadius: 16, overflow: "hidden",
        border: "1px solid rgba(150,40,200,0.35)",
        boxShadow: "0 8px 32px rgba(120,30,180,0.25), 0 0 0 1px rgba(150,40,200,0.1)",
        transform: "translateY(-6px)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-12px)"; e.currentTarget.style.boxShadow = "0 20px 60px rgba(120,30,180,0.45), 0 0 30px rgba(150,40,200,0.25)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(120,30,180,0.25), 0 0 0 1px rgba(150,40,200,0.1)"; }}
    >
      <img src={`/${templateImg}`} alt={token} style={{ width: "100%", height: "auto", display: "block" }} />
      <div style={{ position: "absolute", inset: 0, padding: "8% 7%" }}>
        <div style={{ position: "absolute", top: "28%", left: "7%", display: "flex", alignItems: "center", gap: 10 }}>
          <img src={logo} width={28} height={28} style={{ borderRadius: "50%" }} alt={token} />
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "clamp(11px,1.8vw,15px)", color: "#fff", letterSpacing: 1 }}>
            {amount.toFixed(3)} <span style={{ opacity: 0.5 }}>${token}</span>
          </div>
        </div>
        <div style={{ position: "absolute", top: "45%", left: "7%", fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(28px,5vw,48px)", color: isPos ? "#4ade80" : "#f87171", letterSpacing: 1 }}>
          {isPos ? "+" : ""}{pnlPct.toFixed(1)}%
        </div>
        <div style={{ position: "absolute", bottom: "12%", left: "7%", display: "flex", gap: "clamp(16px,4vw,40px)" }}>
          {[
            { label: "Avg Entry", val: `$${avgEntry.toLocaleString()}` },
            { label: "Current", val: `$${currentPrice?.toLocaleString() || "—"}` },
            { label: "PnL", val: `${isPos ? "+" : ""}$${pnlUsd.toFixed(0)}`, color: isPos ? "#4ade80" : "#f87171" },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: "clamp(9px,1.5vw,11px)", color: "rgba(255,255,255,0.85)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "clamp(12px,2vw,16px)", fontWeight: 600, color: s.color || "#fff" }}>{s.val}</div>
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
        const [s, h, b] = await Promise.all([
          fetch("/api/prices?id=solana"),
          fetch("/api/prices?id=hyperliquid"),
          fetch("/api/prices?id=bitcoin"),
        ]);
        const sd = await s.json(); const hd = await h.json(); const bd = await b.json();
        setSolPrice({ price: sd.solana?.usd, change: sd.solana?.usd_24h_change });
        setHypePrice({ price: hd.hyperliquid?.usd, change: hd.hyperliquid?.usd_24h_change });
        setBtcPrice({ price: bd.bitcoin?.usd, change: bd.bitcoin?.usd_24h_change });
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

        .nav { position: fixed; top: 12px; left: 50%; transform: translateX(-50%); z-index: 100; width: calc(100% - 280px); max-width: 1000px; }
        .nav-pill { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; background: rgba(8,0,20,0.92); backdrop-filter: blur(24px); border: 1px solid rgba(255,255,255,0.1); border-radius: 50px; padding: 4px 8px 4px 14px; box-shadow: 0 4px 30px rgba(0,0,0,0.4); height: 44px; width: 100%; }
        .nav-links { display: flex; align-items: center; gap: 2px; justify-content: center; }
        .nav-link { padding: 6px 22px; border-radius: 50px; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.75); text-decoration: none; letter-spacing: 0.5px; transition: all 0.2s; border: 1px solid transparent; white-space: nowrap; }
        .nav-link:hover { color: rgba(255,255,255,0.8); }
        .nav-link.active { color: #C44FFF; background: transparent; border-color: transparent; text-shadow: 0 0 12px rgba(180,79,255,0.8), 0 0 24px rgba(150,40,200,0.5); }
        .nav-auth { display: flex; align-items: center; gap: 8px; justify-content: flex-end; padding-right: 4px; }
        .nav-login { padding: 6px 18px; border-radius: 50px; background: transparent; border: 1px solid transparent; color: rgba(255,255,255,0.85); font-size: 11px; font-weight: 700; text-decoration: none; font-family: 'Space Mono', monospace; letter-spacing: 0.5px; white-space: nowrap; cursor: default; }
        .nav-signup { padding: 6px 18px; border-radius: 50px; background: rgba(150,40,200,0.25); border: 1px solid rgba(150,40,200,0.5); color: #D44FFF; font-size: 11px; font-weight: 700; text-decoration: none; font-family: 'Space Mono', monospace; letter-spacing: 0.5px; white-space: nowrap; cursor: default; }

        .hero { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 128px 24px 40px; text-align: center; position: relative; overflow: hidden; }
        .hero-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(150,40,200,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(150,40,200,0.06) 1px, transparent 1px); background-size: 60px 60px; mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%); }
        .hero-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); font-size: 12px; color: rgba(255,255,255,0.85); letter-spacing: 0.5px; margin-bottom: 24px; font-family: 'Space Mono', monospace; text-transform: uppercase; animation: fadeUp 0.8s ease both; }
        .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #9B30D0; box-shadow: 0 0 8px #9B30D0; animation: blink 2s infinite; }
        .hero-title { font-family: 'Space Grotesk', sans-serif; font-size: clamp(60px, 10vw, 130px); line-height: 0.95; letter-spacing: -3px; margin-bottom: 20px; font-weight: 700; color: #fff; animation: fadeUp 0.8s 0.15s ease both; }
        .hero-title .outline { -webkit-text-stroke: 1.5px rgba(150,40,200,0.5); color: transparent; }
        .hero-sub { font-size: clamp(14px, 2vw, 17px); color: rgba(255,255,255,0.85); max-width: 500px; line-height: 1.7; margin-bottom: 36px; font-weight: 300; animation: fadeUp 0.8s 0.25s ease both; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes twinkle { 0%,100%{opacity:var(--op)} 50%{opacity:calc(var(--op)*0.3)} }
        .section { padding: 60px 48px; max-width: 1400px; margin: 0 auto; }
        .section-label { font-family: 'Space Mono', monospace; font-size: 10px; color: rgba(255,255,255,0.85); letter-spacing: 3px; text-transform: uppercase; margin-bottom: 16px; }
        .section-title { font-family: 'Space Grotesk', sans-serif; font-size: clamp(40px, 5vw, 72px); letter-spacing: 1px; line-height: 1; margin-bottom: 16px; font-weight: 700; }
        .perf-cards { display: flex; gap: 20px; margin-top: 48px; }
        .footer { border-top: 1px solid rgba(150,40,200,0.15); padding: 28px 48px; display: flex; align-items: center; justify-content: space-between; }
        .divider { width: 100%; height: 1px; background: linear-gradient(90deg, transparent, rgba(150,40,200,0.3), transparent); }

                @media(max-width:768px){
          .nav { padding: 0 16px; }
          .nav-links { gap: 2px; }
          .nav-link { padding: 6px 10px; font-size: 10px; }
          .hero { padding: 100px 16px 60px; }
          .section { padding: 60px 16px; }
          .perf-cards { flex-direction: column; }
          .footer { flex-direction: column; gap: 16px; text-align: center; padding: 24px 16px; }
        }
      `}</style>

      {/* BG */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, background: "radial-gradient(ellipse 120% 80% at 50% 0%, #0a0008 0%, #000000 40%, #000000 100%)", pointerEvents: "none" }}>
        {STARS.map(s => (
          <div key={s.id} style={{ position: "absolute", width: s.size, height: s.size, background: "#fff", borderRadius: "50%", top: s.top, left: s.left, opacity: s.opacity, animation: `twinkle ${3 + (s.id % 4)}s ${s.delay} ease-in-out infinite`, "--op": s.opacity }} />
        ))}
        {/* Purple/pink top halo */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(160,30,180,0.35) 0%, rgba(100,20,160,0.15) 40%, transparent 70%)" }} />
        {/* Blue bottom glow */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 30% at 50% 100%, rgba(30,20,180,0.25) 0%, rgba(20,10,120,0.1) 50%, transparent 80%)" }} />
      </div>
      {/* NAV */}
      <nav className="nav">
        <div className="nav-pill">
          <img src="/logodfs.png" alt="Djune Frost" style={{ height: 36, width: "auto", objectFit: "contain", flexShrink: 0, marginRight: 8 }} />
          <div className="nav-links">
            <a href="/" className="nav-link active">Home</a>
            <a href="/dca-bots" className="nav-link">DCA Bots</a>
            <a href="/strategy" className="nav-link">Strategy</a>
          </div>
          <div className="nav-auth"><span className="nav-login">Log in</span><span className="nav-signup">Sign up</span></div>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" style={{ position: "relative", zIndex: 1 }}>
        <div className="hero-grid" />
<div className="hero-badge"><span className="hero-badge-dot" />Trader · Builder · CEO of Pangeon</div>
        <h1 className="hero-title">
          <div>DJUNE</div>
          <div className="outline">FROST</div>
        </h1>
        <p className="hero-sub">Trader, Strategy builder, Bots creator, Building smarter ways to trade, CEO of Pangeon</p>

      </section>

      <div className="divider" />

      {/* PERF CARDS */}
      <section className="section" style={{ position: "relative", zIndex: 1, paddingTop: 40 }}>
        {/* Token Logos Stack */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 36 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            {[
              { src: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png", label: "BTC" },
              { src: "https://assets.coingecko.com/coins/images/279/small/ethereum.png", label: "ETH" },
              { src: "https://assets.coingecko.com/coins/images/4128/small/solana.png", label: "SOL" },
              { src: "https://dd.dexscreener.com/ds-data/tokens/hyperliquid/0x0d01dc56dcaaca66ad901c959b4011ec.png", label: "HYPE" },
              { src: "https://wsrv.nl/?w=32&h=32&url=https%3A%2F%2Fs3-symbol-logo.tradingview.com%2Fspacex.svg&dpr=2&quality=80", label: "SPCX" },
              { src: "https://assets.lighter.xyz/fe/token/nvda.png", label: "NVDA" },
              { src: "https://assets.lighter.xyz/fe/token/hood.png", label: "HOOD" },
              { src: "https://wsrv.nl/?w=32&h=32&url=https%3A%2F%2Fs3-symbol-logo.tradingview.com%2Fapple.svg&dpr=2&quality=80", label: "AAPL" },
              { src: "https://assets.lighter.xyz/fe/token/xau.png", label: "XAU" },
              { src: "https://assets.lighter.xyz/fe/token/natgas.png", label: "NATGAS" },
            ].map((token, i) => (
              <div key={i} title={token.label} style={{ width: 34, height: 34, borderRadius: "50%", border: "2px solid rgba(10,0,20,0.9)", marginLeft: i === 0 ? 0 : -10, position: "relative", zIndex: 9 - i, overflow: "hidden", background: "rgba(20,10,40,0.9)", flexShrink: 0 }}>
                <img src={token.src} alt={token.label} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
            ))}
            <div style={{ marginLeft: 16, display: "flex", alignItems: "center" }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(255,255,255,0.75)" }}>and more...</div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="section-label">Live Performance</div>
          <div className="section-title">DCA BOT RESULTS</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", maxWidth: 480, margin: "0 auto", fontWeight: 300 }}>Real accumulation from our zone-based DCA bot. Prices update live.</div>
        </div>
        <div className="perf-cards">
          <PerfCard token="SOL" templateImg="dcasolana.png" logo="https://assets.coingecko.com/coins/images/4128/small/solana.png" avgEntry={81} deployed={450} currentPrice={solPrice?.price} />
          <PerfCard token="SPCX" templateImg="dcaspcx.png" logo="https://wsrv.nl/?w=32&h=32&url=https%3A%2F%2Fs3-symbol-logo.tradingview.com%2Fspacex.svg&dpr=2&quality=80" avgEntry={162} deployed={500} currentPrice={null} />
          <PerfCard token="NVDA" templateImg="dcanvda.png" logo="https://assets.lighter.xyz/fe/token/nvda.png" avgEntry={114} deployed={500} currentPrice={null} />
        </div>
      </section>

      <div className="divider" />

      {/* BUILT BY */}
      <section style={{ padding: "40px 48px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.05)", position: "relative", zIndex: 1 }}>
        <img src="/armedcat.png" alt="Djune Frost" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(255,255,255,0.08)", display: "block", margin: "0 auto 16px" }} />
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.85)", letterSpacing: "0.5px", marginBottom: 14 }}>Built by Djune Frost</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 14, fontFamily: "'Inter', sans-serif", letterSpacing: "1px", textTransform: "uppercase" }}>Join Me</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <a href="https://x.com/DjuneFrost" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", textDecoration: "none", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(150,40,200,0.25)"; e.currentTarget.style.borderColor = "rgba(150,40,200,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.258 5.632 5.906-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="https://www.tiktok.com/@djunefrost" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", textDecoration: "none", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(150,40,200,0.25)"; e.currentTarget.style.borderColor = "rgba(150,40,200,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.54V6.78a4.85 4.85 0 01-1.02-.09z"/></svg>
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: 2 }}>DJUNE FROST</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontFamily: "'Space Mono', monospace" }}>© 2026 · Powered by Pangeon DEX</div>
        <a href="https://pangeon.xyz" style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", textDecoration: "none", fontFamily: "'DM Sans', sans-serif" }}>Pangeon DEX ↗</a>
      </footer>
    </>
  );
}
