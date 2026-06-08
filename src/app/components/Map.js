"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { useEffect, useState } from "react";

// Fix Leaflet default marker icons (fallback, not used for custom salon pins)
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom glowing golden divIcon for salons (Recreated exactly from screenshot)
const createGoldIcon = (name, isActive) => {
  return L.divIcon({
    className: "custom-gold-marker",
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;">
        <!-- Salon Label Tag -->
        <div style="
          background: rgba(9, 8, 7, 0.9); 
          border: 1px solid ${isActive ? 'var(--primary)' : 'rgba(255, 255, 255, 0.15)'}; 
          padding: 3px 8px; 
          border-radius: 4px; 
          font-size: 0.7rem; 
          color: ${isActive ? 'var(--primary)' : '#ffffff'}; 
          font-weight: 700; 
          white-space: nowrap; 
          box-shadow: 0 4px 10px rgba(0,0,0,0.5); 
          transform: translateY(-5px);
          transition: all 0.25s ease;
        ">
          ${name}
        </div>
        <!-- Golden Glowing Dot -->
        <div style="
          width: 8px; 
          height: 8px; 
          background: var(--primary); 
          border-radius: 50%; 
          border: 2px solid #000; 
          box-shadow: 0 0 ${isActive ? '12px' : '6px'} var(--primary);
          transition: all 0.25s ease;
        "></div>
      </div>
    `,
    iconSize: [120, 50],
    iconAnchor: [60, 42]
  });
};

// Pulse glowing blue divIcon for user location (Just like the blue dot in screenshot)
const createBlueIcon = () => {
  return L.divIcon({
    className: "custom-user-marker",
    html: `
      <div style="display: flex; align-items: center; justify-content: center; position: relative; width: 24px; height: 24px;">
        <div style="
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgba(59, 130, 246, 0.4);
          animation: mapPulse 2s infinite ease-out;
        "></div>
        <div style="
          width: 10px;
          height: 10px;
          background: #3b82f6;
          border-radius: 50%;
          border: 2px solid #ffffff;
          box-shadow: 0 0 10px #3b82f6;
          position: relative;
          z-index: 2;
        "></div>
        <style>
          @keyframes mapPulse {
            0% { transform: scale(0.5); opacity: 1; }
            100% { transform: scale(1.8); opacity: 0; }
          }
        </style>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

function MapBounds({ salons, userLocation, isNearMeActive }) {
  const map = useMap();

  useEffect(() => {
    if (isNearMeActive && userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 14, { animate: true });
      return;
    }

    const activeSalons = salons.map((s, idx) => ({
      ...s,
      lat: s.lat || 41.3275 + (idx * 0.002),
      lng: s.lng || 19.8189 + (idx * 0.002)
    }));
    
    if (activeSalons.length > 0) {
      const bounds = L.latLngBounds(activeSalons.map(s => [s.lat, s.lng]));
      if (activeSalons.length === 1) {
        map.setView([activeSalons[0].lat, activeSalons[0].lng], 15);
      } else {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [salons, userLocation, isNearMeActive, map]);

  return null;
}

export default function Map({ salons, userLocation, isNearMeActive }) {
  // Center of Tirana
  const position = [41.3275, 19.8189];

  // Set the first salon as selected/active by default to match screenshot overlay
  const [selectedSalon, setSelectedSalon] = useState(salons[0] || null);

  useEffect(() => {
    if (salons && salons.length > 0 && !selectedSalon) {
      setSelectedSalon(salons[0]);
    }
  }, [salons]);

  return (
    <div style={{ 
      height: "500px", 
      width: "100%", 
      borderRadius: "var(--radius-lg)", 
      overflow: "hidden", 
      border: "1px solid var(--border)", 
      boxShadow: "var(--shadow-lg)",
      position: "relative" /* Critical for absolute floating card overlay */
    }}>
      {/* Leaflet Map container */}
      <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
        {/* Sleek CartoDB Dark Matter Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapBounds salons={salons} userLocation={userLocation} isNearMeActive={isNearMeActive} />
        
        {/* User Location Marker (Pulsing Blue) */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={createBlueIcon()}>
            <Popup className="premium-popup">📍 Vendodhja ime</Popup>
          </Marker>
        )}

        {/* Salon Markers (Glowing Gold Circles + floating Name tags) */}
        {salons.map((salon, idx) => {
          const lat = salon.lat || 41.3275 + (idx * 0.002);
          const lng = salon.lng || 19.8189 + (idx * 0.002);
          const isActive = selectedSalon?.id === salon.id;

          return (
            <Marker 
              key={salon.id} 
              position={[lat, lng]} 
              icon={createGoldIcon(salon.name, isActive)}
              eventHandlers={{
                click: () => {
                  setSelectedSalon(salon);
                }
              }}
            >
              {/* Optional fallback popup on double-click, otherwise card overlay handles click */}
            </Marker>
          );
        })}
      </MapContainer>

      {/* Elegant Floating Card Overlay in the bottom-left corner of the map (Recreated EXACTLY from screenshot) */}
      {selectedSalon && (
        <div style={{
          position: "absolute",
          bottom: "1.25rem",
          left: "1.25rem",
          zIndex: 1000, /* Must overlay Leaflet map elements */
          background: "rgba(19, 16, 14, 0.92)",
          border: "1px solid rgba(212, 175, 55, 0.25)",
          borderRadius: "12px",
          width: "280px",
          padding: "1rem",
          boxShadow: "0 15px 30px rgba(0, 0, 0, 0.7)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          animation: "mapCardIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards"
        }}>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes mapCardIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}} />
          {/* Card Cover Image */}
          <div style={{
            width: "55px",
            height: "55px",
            borderRadius: "6px",
            overflow: "hidden",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            flexShrink: 0
          }}>
            <img 
              src={selectedSalon.coverImage || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200"} 
              alt={selectedSalon.name} 
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          {/* Card Info & Details */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{ 
              fontSize: "0.95rem", 
              fontWeight: 600, 
              color: "#fff", 
              margin: 0, 
              overflow: "hidden", 
              textOverflow: "ellipsis", 
              whiteSpace: "nowrap",
              fontFamily: "var(--font-heading)"
            }}>
              {selectedSalon.name}
            </h4>
            <p style={{ 
              fontSize: "0.75rem", 
              color: "rgba(255,255,255,0.6)", 
              margin: "2px 0 6px 0",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}>
              📍 {selectedSalon.address || "Tiranë, Shqipëri"}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.7rem", color: "var(--primary)", fontWeight: 700 }}>
              <span>⭐ {selectedSalon.rating || "4.8"}</span>
              <span style={{ color: "rgba(255,255,255,0.25)" }}>•</span>
              <span style={{ color: "rgba(255,255,255,0.5)" }}>Master Barber</span>
            </div>
          </div>
          {/* Gold Pill Booking Button */}
          <Link 
            href={`/salon/${selectedSalon.id}`}
            style={{
              padding: "0.45rem 0.85rem",
              background: "var(--primary)",
              color: "#000",
              borderRadius: "20px",
              fontSize: "0.75rem",
              fontWeight: 800,
              textDecoration: "none",
              boxShadow: "0 4px 10px rgba(212, 175, 55, 0.25)",
              flexShrink: 0,
              textAlign: "center"
            }}
          >
            Rezervo
          </Link>
        </div>
      )}
    </div>
  );
}
