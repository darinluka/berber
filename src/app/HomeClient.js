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
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
    facebook: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    tiktok: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ),
    youtube: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    twitter: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
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
  const [visibleCount, setVisibleCount] = useState(6);
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
      {/* Hero Section */}
      <section style={{
        padding: "8rem 0 6rem",
        textAlign: "center",
        background: "radial-gradient(circle at center, var(--surface) 0%, var(--background) 100%)",
        borderBottom: "1px solid var(--border)",
        marginBottom: "2rem"
      }}>
        <div className="container">
          <h1 style={{ fontSize: "clamp(2.5rem, 8vw, 4rem)", marginBottom: "1.5rem", lineHeight: 1.1, fontWeight: 800, letterSpacing: "-0.02em" }}>
            Gjej Berberin Tënd <br />
            <span style={{ color: "var(--primary)" }}>Ideal</span>
          </h1>
          <p className="text-muted" style={{ fontSize: "1.25rem", maxWidth: "700px", margin: "0 auto 3rem", lineHeight: 1.6 }}>
            Eksploroni sallonet më të mira, lexoni vlerësimet dhe rezervoni takimin tuaj të radhës në pak sekonda.
          </p>

          <div className="flex justify-center gap-4">
            <div className="card search-container-mobile" style={{
              display: "flex", padding: "0.5rem", background: "var(--surface)",
              borderRadius: "var(--radius-full)", border: "1px solid var(--border)",
              width: "100%", maxWidth: "600px", boxShadow: "var(--shadow-lg)"
            }}>
              <input
                type="text"
                placeholder="Kërko sallonin ose qytetin..."
                style={{ flex: 1, background: "none", border: "none", outline: "none", color: "var(--foreground)", padding: "0 1.5rem", fontSize: "1.1rem" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="search-buttons-container" style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={handleNearMe}
                  className={`btn ${isNearMeActive ? "btn-primary" : "btn-secondary"} search-btn-mobile`}
                  style={{
                    borderRadius: "var(--radius-full)", padding: "0.6rem 1.25rem",
                    display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem",
                    border: isNearMeActive ? "2px solid rgba(255,255,255,0.2)" : "1px solid var(--border)",
                    boxShadow: isNearMeActive ? "0 0 15px var(--primary)" : "none", whiteSpace: "nowrap"
                  }}
                >
                  📍 {isNearMeActive ? "Më Afër" : "Afër Meje"}
                </button>
                <button className="btn btn-primary search-btn-mobile" style={{ borderRadius: "var(--radius-full)", padding: "0.6rem 1.5rem", fontSize: "0.9rem" }}>Kërko</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="container" style={{ padding: "4rem 0 4rem" }} ref={resultsRef}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "20px", width: "100%" }}>
          <div>
            <h2 style={{ fontSize: "clamp(1.75rem, 5vw, 2.25rem)", fontWeight: 700, margin: 0 }}>
              {searchTerm ? `Rezultatet për "${searchTerm}"` : "Sallonet e Rekomanduara"}
            </h2>
            <p className="text-muted" style={{ marginTop: "0.5rem", margin: "0.5rem 0 0" }}>Zgjidhni sallonin që ju përshtatet më shumë.</p>
          </div>
        </div>

        {visibleSalons.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md-grid-cols-3" style={{ padding: "0 1rem", gap: "10px" }}>
              {visibleSalons.map((salon) => {
                const socialLinks = [
                  { key: "instagram", url: salon.instagram },
                  { key: "facebook",  url: salon.facebook  },
                  { key: "tiktok",    url: salon.tiktok    },
                  { key: "youtube",   url: salon.youtube   },
                  { key: "twitter",   url: salon.twitter   },
                ].filter(s => s.url);

                return (
                  <div key={salon.id} style={{ position: "relative" }}>
                    <Link href={`/salon/${salon.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                      <div className="card salon-card-hover" style={{
                        padding: 0, overflow: "hidden", height: "100%",
                        display: "flex", flexDirection: "column",
                        border: "1px solid var(--border)",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                        cursor: "pointer"
                      }}>
                        {/* Cover Image */}
                        <div style={{
                          height: "240px",
                          background: `url(${salon.coverImage || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800"}) center/cover`,
                          position: "relative"
                        }}>
                          {salon.isFeatured && (
                            <div style={{
                              position: "absolute", top: "1rem", left: "1rem",
                              background: "var(--primary)", color: "white",
                              padding: "0.4rem 1rem", borderRadius: "var(--radius-full)",
                              fontSize: "0.7rem", fontWeight: 800, boxShadow: "0 4px 12px rgba(194, 149, 69, 0.4)"
                            }}>
                              ⭐ FEATURED
                            </div>
                          )}

                          {/* Social Media Icons on image */}
                          {socialLinks.length > 0 && (
                            <div
                              style={{
                                position: "absolute", bottom: "0.75rem", right: "0.75rem",
                                display: "flex", gap: "0.4rem",
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
                                    width: "32px", height: "32px", borderRadius: "50%",
                                    background: socialColors[key],
                                    color: "#fff",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                                    transition: "transform 0.15s, box-shadow 0.15s",
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
                        </div>

                        <div style={{ padding: "2rem", flex: 1, display: "flex", flexDirection: "column" }}>
                          <h3 style={{ fontSize: "1.5rem", marginBottom: "0.75rem", fontWeight: 700 }}>{salon.name}</h3>
                          <p className="text-muted" style={{ fontSize: "0.95rem", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            📍 {salon.address || "Tiranë, Shqipëri"}
                            {isNearMeActive && userLocation && salon.lat && salon.lng && (
                              <span style={{ color: "var(--primary)", fontWeight: 600, marginLeft: "auto" }}>
                                ({calculateDistance(userLocation.lat, userLocation.lng, salon.lat, salon.lng).toFixed(1)} km)
                              </span>
                            )}
                          </p>
                          <div className="flex justify-between items-center mt-auto" style={{ borderTop: "1px solid var(--border)", paddingTop: "1.5rem" }}>
                            <span style={{ fontWeight: 700, color: "var(--primary)", fontSize: "1rem" }}>Rezervo Tani →</span>
                            <span className="text-muted" style={{ fontSize: "0.85rem" }}>{salon.hours || "09:00 - 21:00"}</span>
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
                  style={{ padding: "1rem 3rem", fontSize: "1.1rem", borderRadius: "var(--radius-full)" }}
                  onClick={() => setVisibleCount(prev => prev + 6)}
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
              <button className="btn btn-secondary" onClick={() => setSearchTerm("")}>Pastro kërkimin</button>
              <Link href="/admin/salons" className="btn btn-primary">Paneli i Adminit</Link>
            </div>
          </div>
        )}
      </section>

      {/* Map Section */}
      <section className="container" style={{ marginBottom: "8rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "2.25rem", fontWeight: 700 }}>Harta e Salloneve</h2>
          <p className="text-muted">Gjeni sallonin më të afërt në hartë.</p>
        </div>
        <Map salons={filteredSalons} userLocation={userLocation} isNearMeActive={isNearMeActive} />
      </section>
    </div>
  );
}
