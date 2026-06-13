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


function PnlStack({ images }) {
  const [hovered, setHovered] = useState(null);
  const total = images.length;
  const CARD_W = 380;
  const OFFSET_X = 22;
  const OFFSET_Y = 38;
  const totalH = CARD_W * 0.56 + (total - 1) * OFFSET_Y + 120;

  return (
    <div style={{ position: "relative", width: CARD_W + (total - 1) * OFFSET_X, height: totalH }}>
      {[...images].reverse().map((file, ri) => {
        const i = total - 1 - ri;
        const isHovered = hovered === i;
        return (
          <div key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              position: "absolute",
              top: i * OFFSET_Y,
              left: i * OFFSET_X,
              width: CARD_W,
              borderRadius: 14,
              overflow: "hidden",
              border: isHovered ? "1px solid rgba(255,255,255,0.22)" : "1px solid rgba(255,255,255,0.1)",
              boxShadow: isHovered ? "0 20px 50px rgba(0,0,0,0.9)" : "0 8px 32px rgba(0,0,0,0.8)",
              zIndex: i + 1,
              transform: `translateY(${isHovered ? -80 : 0}px)`,
              transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease, border-color 0.3s ease",
              cursor: "pointer",
            }}
          >
            <img src={`/${file}`} alt={`Trade ${i + 1}`} style={{ width: "100%", height: "auto", display: "block" }} />
          </div>
        );
      })}
    </div>
  );
}

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
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "2px", fontFamily: "'Space Mono', monospace" }}>LIVE TRADE</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <button onClick={prev} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(13,15,26,0.8)", color: "#fff", fontSize: 14, cursor: "pointer", zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)" }}>←</button>
      <button onClick={next} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(13,15,26,0.8)", color: "#fff", fontSize: 14, cursor: "pointer", zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(10px)" }}>→</button>
      <div style={{ position: "absolute", bottom: -20, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
        {TRADE_IMAGES.map((_, i) => (
          <div key={i} onClick={() => setCurrent(i)} style={{ width: i === current ? 16 : 5, height: 5, borderRadius: 3, background: i === current ? "#cc0000" : "rgba(255,255,255,0.15)", cursor: "pointer", transition: "all 0.3s" }} />
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
    <div style={{ position: "relative", flex: 1, minWidth: 0, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
      <img src={`/${templateImg}`} alt={token} style={{ width: "100%", height: "auto", display: "block" }} />
      <div style={{ position: "absolute", inset: 0, padding: "8% 7%" }}>
        <div style={{ position: "absolute", top: "28%", left: "7%", display: "flex", alignItems: "center", gap: 10 }}>
          <img src={logo} width={28} height={28} style={{ borderRadius: "50%" }} alt={token} />
          <div style={{ fontFamily: "'Space Mono', monospace", fontSize: "clamp(11px,1.8vw,15px)", color: "#fff", letterSpacing: 1 }}>
            {amount.toFixed(3)} <span style={{ opacity: 0.5 }}>${token}</span>
          </div>
        </div>
        <div style={{ position: "absolute", top: "45%", left: "7%", fontFamily: "'Cinzel', serif", fontSize: "clamp(28px,5vw,48px)", color: isPos ? "#4ade80" : "#f87171", letterSpacing: 1 }}>
          {isPos ? "+" : ""}{pnlPct.toFixed(1)}%
        </div>
        <div style={{ position: "absolute", bottom: "12%", left: "7%", display: "flex", gap: "clamp(16px,4vw,40px)" }}>
          {[
            { label: "Avg Entry", val: `$${avgEntry.toLocaleString()}` },
            { label: "Current", val: `$${currentPrice?.toLocaleString() || "—"}` },
            { label: "PnL", val: `${isPos ? "+" : ""}$${pnlUsd.toFixed(0)}`, color: isPos ? "#4ade80" : "#f87171" },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: "clamp(9px,1.5vw,11px)", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{s.label}</div>
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

        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-12px)} }
        @keyframes pulseRed { 0%,100%{opacity:0.15} 50%{opacity:0.3} }
        @keyframes twinkle { 0%,100%{opacity:var(--op)} 50%{opacity:calc(var(--op)*0.3)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }

        .hero { display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 128px 24px 40px; text-align: center; position: relative; overflow: hidden; }
        .hero-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px); background-size: 60px 60px; mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%); }
        .hero-badge { display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04); font-size: 12px; color: rgba(255,255,255,0.45); letter-spacing: 0.5px; margin-bottom: 24px; font-family: 'Space Mono', monospace; text-transform: uppercase; animation: fadeUp 0.8s ease both; }
        .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #cc0000; box-shadow: 0 0 8px #cc0000; animation: blink 2s infinite; }
        .hero-title { font-family: 'Cinzel', serif; font-size: clamp(60px, 10vw, 130px); line-height: 0.95; letter-spacing: -2px; margin-bottom: 20px; font-weight: 900; animation: fadeUp 0.8s 0.15s ease both; }
        .hero-title .outline { -webkit-text-stroke: 1.5px rgba(255,255,255,0.12); color: transparent; }
        .hero-sub { font-size: clamp(14px, 2vw, 17px); color: rgba(255,255,255,0.3); max-width: 500px; line-height: 1.7; margin-bottom: 36px; font-weight: 300; animation: fadeUp 0.8s 0.25s ease both; }
.ticker { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; animation: fadeUp 0.8s 0.35s ease both; }
        .ticker-item { display: flex; align-items: center; gap: 10px; padding: 9px 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.07); background: rgba(13,15,26,0.7); backdrop-filter: blur(10px); }
        .ticker-sym { font-family: 'Space Mono', monospace; font-size: 12px; font-weight: 700; color: #fff; }
        .ticker-price { font-family: 'Space Mono', monospace; font-size: 12px; color: rgba(255,255,255,0.4); }
        .ticker-change { font-size: 11px; font-weight: 600; padding: 2px 7px; border-radius: 6px; }
        .ticker-change.up { background: rgba(74,222,128,0.1); color: #4ade80; }
        .ticker-change.down { background: rgba(248,113,113,0.1); color: #f87171; }

        .section { padding: 60px 48px; max-width: 1400px; margin: 0 auto; }
        .section-label { font-family: 'Space Mono', monospace; font-size: 10px; color: rgba(255,255,255,0.22); letter-spacing: 3px; text-transform: uppercase; margin-bottom: 16px; }
        .section-title { font-family: 'Cinzel', serif; font-size: clamp(40px, 5vw, 72px); letter-spacing: 1px; line-height: 1; margin-bottom: 16px; font-weight: 700; }
        .perf-cards { display: flex; gap: 20px; margin-top: 48px; }
        .bot-header { text-align: center; margin-bottom: 72px; }
        .coming-soon-banner { margin-top: 72px; padding: 32px; border: 1px dashed rgba(255,255,255,0.08); border-radius: 16px; text-align: center; background: rgba(255,255,255,0.02); }
        .coming-soon-title { font-family: 'Cinzel', serif; font-size: 32px; letter-spacing: 2px; color: rgba(255,255,255,0.35); margin-bottom: 8px; font-weight: 700; }
        .coming-soon-desc { font-size: 14px; color: rgba(255,255,255,0.2); font-weight: 300; }
        .footer { border-top: 1px solid rgba(255,255,255,0.06); padding: 32px 48px; display: flex; align-items: center; justify-content: space-between; }
        .divider { width: 100%; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent); }

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
      <div style={{ position: "fixed", inset: 0, zIndex: 0, background: "radial-gradient(ellipse 120% 80% at 50% 0%, #110b0b 0%, #0d0f1a 40%, #080a14 100%)", pointerEvents: "none" }}>
        {STARS.map(s => (
          <div key={s.id} style={{ position: "absolute", width: s.size, height: s.size, background: "#fff", borderRadius: "50%", top: s.top, left: s.left, opacity: s.opacity, animation: `twinkle ${3 + (s.id % 4)}s ${s.delay} ease-in-out infinite`, "--op": s.opacity }} />
        ))}
        {/* Subtle red vignette top */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(120,0,0,0.08) 0%, transparent 70%)" }} />
      </div>

      {/* NAV */}
      <nav className="nav">
        <a href="/" className="nav-logo">DJUNE <span>FROST</span></a>
        <div className="nav-links">
          <a href="/" className="nav-link active">Home</a>
          <a href="/dca-bots" className="nav-link">DCA Bots</a>
          <a href="/strategy" className="nav-link">Strategy</a>
        </div>
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
        <p className="hero-sub">Trader, Strategy builder, Bots creator, Building smarter ways to trade, CEO of Pangeon</p>

      </section>

      <div className="divider" />

      {/* PERF CARDS */}
      <section className="section" style={{ position: "relative", zIndex: 1, paddingTop: 40 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div className="section-label">Live Performance</div>
          <div className="section-title">DCA BOT RESULTS</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.25)", maxWidth: 480, margin: "0 auto", fontWeight: 300 }}>Real accumulation from our zone-based DCA bot. Prices update live.</div>
        </div>
        <div className="perf-cards">
          <PerfCard token="SOL" templateImg="dcasolana.png" logo="https://assets.coingecko.com/coins/images/4128/small/solana.png" avgEntry={81} deployed={450} currentPrice={solPrice?.price} />
          <PerfCard token="SPCX" templateImg="dcaspcx.png" logo="https://wsrv.nl/?w=32&h=32&url=https%3A%2F%2Fs3-symbol-logo.tradingview.com%2Fspacex.svg&dpr=2&quality=80" avgEntry={162} deployed={500} currentPrice={null} />
          <PerfCard token="NVDA" templateImg="dcanvda.png" logo="https://wsrv.nl/?w=32&h=32&url=https%3A%2F%2Fxstocks-metadata.backed.fi%2Flogos%2Ftokens%2FNVDAx.png&dpr=2&quality=80" avgEntry={114} deployed={500} currentPrice={null} />
        </div>
      </section>

      <div className="divider" />

      {/* PNL HIGHLIGHTS */}
      <section style={{ padding: "60px 0", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div className="section-label">Trading Results</div>
          <div className="section-title">PnL HIGHLIGHTS</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.25)", maxWidth: 480, margin: "0 auto", fontWeight: 300 }}>A selection of recent closed trades.</div>
        </div>
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 48px", marginBottom: 80 }}>
          <TradeCarousel />
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 80, width: "100%", paddingLeft: 0, paddingRight: 0 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", flex: 1 }}>
            <PnlStack images={["lighter1.png","lighter2.png","lighter3.png","lighter4.png","lighter5.png"]} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-start", flex: 1 }}>
            <PnlStack images={["pacifica1.png","pacifica2.png","pacifica3.png","pacifica4.png","pacifica5.png"]} />
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 80, width: "100%", marginTop: 80 }}>
          <div style={{ display: "flex", justifyContent: "flex-end", flex: 1 }}>
            <PnlStack images={["pacifica7.png","pacifica8.png","pacifica9.png","pacifica10.png"]} />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-start", flex: 1 }}>
            <PnlStack images={["pacifica11.png","pacifica12.png","pacifica13.png","pacifica14.png"]} />
          </div>
        </div>
      </section>

      {/* BUILT BY */}
      <section style={{ padding: "40px 48px", textAlign: "center", borderTop: "1px solid rgba(255,255,255,0.05)", position: "relative", zIndex: 1 }}>
        <img src="/armedcat.png" alt="Djune Frost" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(255,255,255,0.08)", display: "block", margin: "0 auto 16px" }} />
        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "rgba(255,255,255,0.22)", letterSpacing: "0.5px" }}>Built by Djune Frost</div>
        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "rgba(255,255,255,0.15)", marginTop: 6, letterSpacing: 1 }}>CEO of Pangeon · Builder · Trader</div>
      </section>

      {/* FOOTER */}
      <footer className="footer" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.3)", letterSpacing: 2 }}>DJUNE FROST</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.15)", fontFamily: "'Space Mono', monospace" }}>© 2026 · Powered by Pangeon DEX</div>
        <a href="https://pangeon.xyz" style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", textDecoration: "none", fontFamily: "'DM Sans', sans-serif" }}>Pangeon DEX ↗</a>
      </footer>
    </>
  );
}
