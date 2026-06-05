"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("./components/Map"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "500px", background: "var(--surface)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      Duke ngarkuar hartën...
    </div>
  ),
});

// Social media SVG icons
function SocialIcon({ type }) {
  const icons = {
    instagram: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
    facebook: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    tiktok: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ),
    youtube: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    twitter: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  };
  return icons[type] || null;
}

const socialColors = {
  instagram: "#E1306C",
  facebook: "#1877F2",
  tiktok: "#010101",
  youtube: "#FF0000",
  twitter: "#000000",
};

export default function HomeClient({ initialSalons }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [isNearMeActive, setIsNearMeActive] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);
  const resultsRef = useRef(null);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleNearMe = () => {
    if (isNearMeActive) { setIsNearMeActive(false); return; }
    if (!navigator.geolocation) { alert("Gjeolokacioni nuk mbështetet nga shfletuesi juaj."); return; }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setIsNearMeActive(true);
        if (resultsRef.current) resultsRef.current.scrollIntoView({ behavior: "smooth" });
      },
      () => alert("Nuk mund të merrnim lokacionin tuaj. Ju lutem kontrolloni lejet e shfletuesit.")
    );
  };

  let filteredSalons = initialSalons.filter(salon =>
    salon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (salon.address || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isNearMeActive && userLocation) {
    filteredSalons = [...filteredSalons].sort((a, b) => {
      if (!a.lat || !a.lng) return 1;
      if (!b.lat || !b.lng) return -1;
      return calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng)
           - calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
    });
  }

  const visibleSalons = filteredSalons.slice(0, visibleCount);

  return (
    <div className="fade-in">
      <style dangerouslySetInnerHTML={{__html: `
        .hero-title-serif {
          font-family: var(--font-serif) !important;
          font-weight: 900 !important;
          font-size: clamp(2.6rem, 7vw, 4.5rem) !important;
          line-height: 1.15 !important;
          letter-spacing: -0.01em;
        }
        .text-gold-outline {
          color: var(--primary);
          position: relative;
          display: inline-block;
          font-style: italic;
          font-weight: 900 !important;
        }
        .hero-subtitle {
          color: var(--primary);
          font-family: var(--font-heading);
          font-weight: 700;
          font-size: 0.95rem;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }
        .hero-desc {
          color: rgba(255, 255, 255, 0.85);
          font-size: 1.25rem;
          max-width: 650px;
          margin: 0 auto 3rem;
          line-height: 1.6;
          font-weight: 500;
        }
        .search-pill-container {
          display: flex;
          align-items: center;
          padding: 0.5rem;
          background: rgba(19, 16, 14, 0.85);
          border-radius: var(--radius-full);
          border: 1px solid rgba(212, 175, 55, 0.3);
          width: 100%;
          max-width: 620px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transition: all 0.3s ease;
        }
        .search-pill-container:focus-within {
          border-color: var(--primary);
          box-shadow: 0 20px 40px rgba(212, 175, 55, 0.2);
        }
        .search-magnifier {
          color: var(--primary);
          margin-left: 1.25rem;
          flex-shrink: 0;
          opacity: 0.9;
        }
        .search-input-pill {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: #ffffff;
          padding: 0 1rem;
          font-size: 1.05rem;
          font-weight: 500;
        }
        .search-input-pill::placeholder {
          color: rgba(255,255,255,0.45);
        }
        
        .section-badge {
          color: var(--primary);
          font-family: var(--font-heading);
          font-weight: 800;
          font-size: 0.8rem;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
          display: block;
        }
        .section-title-serif {
          font-family: var(--font-serif);
          font-size: clamp(2rem, 5vw, 2.75rem);
          font-weight: 800 !important;
          margin-top: 0.25rem;
          line-height: 1.2;
        }
        .section-title-serif span {
          color: var(--primary);
          font-weight: 800 !important;
        }
        
        .editorial-card {
          background-color: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 0;
          overflow: hidden;
          height: 480px;
          display: flex;
          flex-direction: column;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
          position: relative;
        }
        .editorial-card:hover {
          transform: translateY(-8px);
          border-color: rgba(212, 175, 55, 0.45);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 1px rgba(212, 175, 55, 0.3);
        }
        .editorial-card-image-wrapper {
          position: absolute;
          inset: 0;
          overflow: hidden;
          z-index: 1;
        }
        .editorial-card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .editorial-card:hover .editorial-card-image {
          transform: scale(1.08);
        }
        .editorial-card-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(9, 8, 7, 0.1) 0%, rgba(9, 8, 7, 0.35) 45%, rgba(9, 8, 7, 0.95) 100%);
          z-index: 2;
        }
        .card-glass-badge-left {
          position: absolute;
          top: 1.25rem;
          left: 1.25rem;
          background: rgba(9, 8, 7, 0.85);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(212, 175, 55, 0.35);
          color: var(--primary);
          padding: 0.35rem 0.75rem;
          border-radius: 4px;
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          z-index: 5;
        }
        .card-glass-badge-right {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          background: rgba(9, 8, 7, 0.85);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #ffffff;
          padding: 0.35rem 0.65rem;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          z-index: 5;
        }

        .service-static-card {
          background-color: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.3s ease;
          position: relative;
        }
        .service-static-card:hover {
          border-color: var(--primary);
          transform: translateY(-4px);
        }
        .service-icon-box {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-sm);
          background: rgba(212, 175, 55, 0.08);
          border: 1px solid rgba(212, 175, 55, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          margin-bottom: 1.25rem;
          font-size: 1.25rem;
        }
        .service-price-serif {
          font-family: var(--font-serif);
          font-size: 1.75rem;
          font-weight: 800 !important;
          color: var(--primary);
          margin-top: 1rem;
        }

        /* Responsive Mobile Layout Tweaks */
        @media (max-width: 768px) {
          .hero-section-mobile {
            padding: 7rem 0 5rem !important;
          }
          #sherbimet, #sallonet, #harta {
            padding: 3.5rem 1rem !important;
          }
          .editorial-card {
            height: 410px !important;
          }
          .editorial-card-gradient {
            background: linear-gradient(to bottom, rgba(9, 8, 7, 0.05) 0%, rgba(9, 8, 7, 0.4) 35%, rgba(9, 8, 7, 0.98) 100%) !important;
          }
          .card-glass-badge-left {
            top: 1rem !important;
            left: 1rem !important;
          }
          .card-glass-badge-right {
            top: 1rem !important;
            right: 1rem !important;
          }
        }
        @media (min-width: 768px) {
          .service-static-card {
            padding: 2rem !important;
          }
        }
      `}} />

      {/* Hero Section */}
      <section 
        className="hero-section-mobile"
        style={{
          padding: "9rem 0 7rem",
          borderBottom: "1px solid var(--border)",
          position: "relative",
          background: "#090807"
        }}
      >
        <div className="container" style={{ position: "relative", zIndex: 5 }}>
          <div className="hero-grid">
            <div className="hero-text-container">
              <p className="hero-subtitle" style={{ color: 'var(--primary)', letterSpacing: '0.25em', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 800, marginBottom: '1.25rem' }}>
                Mjeshtëri e Vërtetë
              </p>
              <h1 style={{ fontSize: 'clamp(2.5rem, 5.5vw, 4rem)', lineHeight: 1.15, marginBottom: '1.5rem', fontWeight: 800 }}>
                Ku Tradita <br />
                Takon Stilin <span className="text-gold-serif-italic">Modern</span>
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6, maxWidth: '520px', marginBottom: '2.5rem' }}>
                Nga prerjet klasike deri te trendet më të fundit, platforma jonë ju ndihmon të gjeni profesionistët më të mirë dhe të rezervoni terminin tuaj pa pritje.
              </p>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Link href="#sallonet" className="btn btn-primary" style={{ padding: "0.9rem 2.2rem", borderRadius: "var(--radius-sm)", fontWeight: 700, fontSize: "0.95rem" }}>
                  Rezervo Tani
                </Link>
                <Link 
                  href="#sallonet" 
                  style={{ 
                    display: "inline-flex", 
                    alignItems: "center", 
                    gap: "0.5rem", 
                    color: "#ffffff", 
                    fontWeight: 700, 
                    fontSize: "0.95rem", 
                    marginLeft: "2rem", 
                    textDecoration: "none", 
                    transition: "color 0.2s" 
                  }} 
                  onMouseEnter={e => e.currentTarget.style.color = "var(--primary)"} 
                  onMouseLeave={e => e.currentTarget.style.color = "#ffffff"}
                >
                  Shiko Sallonet <span style={{ color: "var(--primary)" }}>→</span>
                </Link>
              </div>
            </div>

            <div className="hero-collage-container">
              <div className="hero-collage-wrapper">
                <img 
                  src="https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800" 
                  alt="Luxury Barbershop Interior" 
                  className="hero-img-main" 
                />
                <div className="hero-img-sub-wrapper">
                  <img 
                    src="https://images.unsplash.com/photo-1593702295094-aec22597af65?w=400" 
                    alt="Barber Tools Close-Up" 
                    className="hero-img-sub" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="container" style={{ padding: "6rem 0" }} id="sherbimet">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3.5rem", width: "100%", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span className="section-badge">Shërbimet</span>
            <h2 className="section-title-serif">Shërbime të Kërkuara</h2>
            <p className="text-muted" style={{ marginTop: "0.5rem" }}>Nga prerjet klasike tek trajtimet moderne</p>
          </div>
          <Link href="#sallonet" className="text-muted" style={{ fontSize: "0.9rem", color: "var(--primary)", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.25rem" }}>
            Shiko Shërbimet <span style={{ transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateX(3px)"} onMouseLeave={e => e.currentTarget.style.transform = "none"}>→</span>
          </Link>
        </div>
        
        <div className="services-grid-luxury">
          {[
            { num: "01", name: "Prerje Flokësh", desc: "Një prerje e personalizuar që përshtatet me tiparet dhe stilin tuaj." },
            { num: "02", name: "Rrojë & Mjekër", desc: "Rrojë klasike me peshqir të ngrohtë dhe stilim profesional mjekre." },
            { num: "03", name: "Stilime Flokësh", desc: "Nga stilet klasike tek ato moderne, stilim profesional për çdo rast." },
            { num: "04", name: "Larje & Stilim", desc: "Larje me produkte premium dhe stilim i plotë për flokët tuaj." },
            { num: "05", name: "Masazh Koke", desc: "Masazh relaksues i kokës që nxit qarkullimin dhe redukton stresin." },
            { num: "06", name: "Trajtime Fytyre", desc: "Pastrim i thellë, hidrati dhe kujdes i dedikuar për lëkurën." }
          ].map((item, idx) => (
            <div key={idx} className="service-card-luxury">
              <div className="service-card-top">
                <span className="service-number-gold">{item.num}</span>
                <h3 className="service-card-title">{item.name}</h3>
                <p className="service-card-desc">{item.desc}</p>
              </div>
              <Link href="#sallonet" className="service-card-link">
                Gjej sallon <span>→</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended Salons Section */}
      <section className="container" style={{ padding: "6rem 0" }} ref={resultsRef} id="sallonet">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem", width: "100%", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span className="section-badge">Gjej berberin tënd</span>
            <h2 className="section-title-serif">
              {searchTerm ? (
                <>Rezultatet për <span>"{searchTerm}"</span></>
              ) : (
                <>Sallonet e <span>Rekomanduara</span></>
              )}
            </h2>
          </div>
          {!searchTerm && (
            <Link href="#sallonet" className="text-muted" style={{ fontSize: "0.9rem", color: "var(--primary)", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.25rem" }}>
              Shiko të gjithë <span style={{ transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateX(3px)"} onMouseLeave={e => e.currentTarget.style.transform = "none"}>→</span>
            </Link>
          )}
        </div>

        {/* Search Bar - Integrated right above cards grid */}
        <div className="flex justify-center" style={{ marginBottom: "4rem", width: "100%" }}>
          <div className="search-pill-container search-container-mobile">
            <span className="search-magnifier">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              type="text"
              className="search-input-pill"
              placeholder="Kërko sallonin, rrugën, ose qytetin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="search-buttons-container" style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={handleNearMe}
                className={`btn ${isNearMeActive ? "btn-primary" : "btn-secondary"} search-btn-mobile`}
                style={{
                  borderRadius: "var(--radius-full)", padding: "0.6rem 1.35rem",
                  display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem",
                  border: isNearMeActive ? "2px solid rgba(255,255,255,0.2)" : "1px solid rgba(212, 175, 55, 0.15)",
                  boxShadow: isNearMeActive ? "0 0 15px var(--primary)" : "none", whiteSpace: "nowrap",
                  fontWeight: 700
                }}
              >
                📍 {isNearMeActive ? "Më Afër" : "Afër Meje"}
              </button>
              <button 
                className="btn btn-primary search-btn-mobile" 
                style={{ borderRadius: "var(--radius-full)", padding: "0.6rem 1.75rem", fontSize: "0.9rem", fontWeight: 700 }}
              >
                Kërko
              </button>
            </div>
          </div>
        </div>

        {visibleSalons.length > 0 ? (
          <>
            <div className="salons-grid-luxury">
              {visibleSalons.map((salon, index) => {
                const socialLinks = [
                  { key: "instagram", url: salon.instagram },
                  { key: "facebook",  url: salon.facebook  },
                  { key: "tiktok",    url: salon.tiktok    },
                  { key: "youtube",   url: salon.youtube   },
                  { key: "twitter",   url: salon.twitter   },
                ].filter(s => s.url);

                const badges = ["PREMIUM", "KLASIK", "MODERN"];
                const badgeText = salon.isFeatured ? "PREMIUM" : badges[index % badges.length];

                return (
                  <div key={salon.id} style={{ position: "relative" }}>
                    <Link href={`/salon/${salon.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                      <div className="salon-card-luxury">
                        {/* Cover Image Wrapper */}
                        <div className="salon-card-media">
                          <img 
                            src={salon.coverImage || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800"} 
                            alt={salon.name}
                            className="salon-card-img"
                          />
                        </div>

                        {/* Top Badges */}
                        <div className="salon-card-badge-left">
                          {badgeText}
                        </div>
                        <div className="salon-card-badge-right">
                          ⭐ {salon.rating || "4.8"}
                        </div>

                        {/* Social Media Icons */}
                        {socialLinks.length > 0 && (
                          <div
                            style={{
                              position: "absolute",
                              top: "4rem",
                              right: "1rem",
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.4rem",
                              zIndex: 10
                            }}
                            onClick={(e) => e.preventDefault()}
                          >
                            {socialLinks.map(({ key, url }) => (
                              <a
                                key={key}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={key.charAt(0).toUpperCase() + key.slice(1)}
                                style={{
                                  width: "26px",
                                  height: "26px",
                                  borderRadius: "50%",
                                  background: "rgba(9, 8, 7, 0.75)",
                                  border: "1px solid rgba(255, 255, 255, 0.15)",
                                  color: socialColors[key] || "#fff",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                                  transition: "transform 0.15s",
                                  flexShrink: 0,
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.2)"; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                              >
                                <SocialIcon type={key} />
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Card Content */}
                        <div className="salon-card-content">
                          <h3 className="salon-card-title">
                            {salon.name}
                          </h3>
                          <p className="salon-card-address">
                            {salon.address || "Rruga Myslym Shyri, Tiranë"}
                          </p>
                          <div className="salon-card-footer">
                            <span className="salon-card-hours">{salon.hours || "09:00 - 21:00"}</span>
                            <span className="salon-card-link">
                              Rezervo →
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>

            {visibleCount < filteredSalons.length && (
              <div className="flex justify-center mt-12">
                <button
                  className="btn btn-secondary"
                  style={{ padding: "0.9rem 2.5rem", fontSize: "1rem", borderRadius: "var(--radius-full)", fontWeight: 700 }}
                  onClick={() => setVisibleCount(prev => prev + 8)}
                >
                  Shiko më shumë sallone 💈
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="card" style={{ padding: "6rem 2rem", textAlign: "center", background: "var(--surface)", border: "2px dashed var(--border)" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>💈</div>
            <h2 style={{ marginBottom: "1rem" }}>Nuk u gjet asnjë sallon</h2>
            <p className="text-muted" style={{ maxWidth: "500px", margin: "0 auto 2.5rem", fontSize: "1.1rem" }}>
              Për momentin nuk ka sallone të aprovuara që përputhen me kërkimin tuaj.
              Nëse jeni admin, kontrolloni seksionin e aprovimeve.
            </p>
            <div className="flex justify-center gap-4">
              {initialSalons.length > 0 && (
                <>
                  <button className="btn btn-secondary" onClick={() => setSearchTerm("")}>Pastro kërkimin</button>
                  <Link href="/admin/salons" className="btn btn-primary">Paneli i Adminit</Link>
                </>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Quote Section */}
      <section className="quote-section">
        <div className="container">
          <p className="quote-text-serif">
            "Flokët nuk janë thjesht pamje, por pjesë e identitetit tënd."
          </p>
          <div className="quote-image-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=1200&q=80" 
              alt="Luxury Lounge Area" 
              className="quote-image" 
            />
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="container" style={{ padding: "6rem 0", borderTop: "1px solid rgba(212, 175, 55, 0.05)" }} id="harta">
        <div className="map-grid-luxury">
          <div>
            <span className="section-badge">Harta</span>
            <h2 className="section-title-serif" style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)", marginBottom: "1.5rem" }}>
              Gjeni sallonin më të <span>afërt</span>
            </h2>
            <p className="text-muted" style={{ fontSize: "1.05rem", lineHeight: "1.6", marginBottom: "2.5rem", maxWidth: "480px" }}>
              Harta jonë ju ndihmon të gjeni sallonin më të afërt dhe të rezervoni direkt. Aktivizoni lokacionin tuaj për të parë sallonet në kohë reale rreth jush.
            </p>
            <button 
              onClick={handleNearMe} 
              className="btn btn-primary"
              style={{ borderRadius: "var(--radius-sm)", padding: "1rem 2.2rem", fontSize: "0.95rem", fontWeight: 700 }}
            >
              Kërko në Hartë
            </button>
          </div>
          <div>
            <Map salons={filteredSalons} userLocation={userLocation} isNearMeActive={isNearMeActive} />
          </div>
        </div>
      </section>
    </div>
  );
}
