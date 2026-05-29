"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { useEffect } from "react";

// Fix Leaflet marker icons
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// User location icon (Red)
const userIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

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

  return (
    <div style={{ height: "500px", width: "100%", borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}>
      <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBounds salons={salons} userLocation={userLocation} isNearMeActive={isNearMeActive} />
        
        {/* User Location Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup className="premium-popup">📍 Vendodhja ime</Popup>
          </Marker>
        )}

        {/* Salon Markers */}
        {salons.map((salon, idx) => {
          const lat = salon.lat || 41.3275 + (idx * 0.002);
          const lng = salon.lng || 19.8189 + (idx * 0.002);
          return (
            <Marker key={salon.id} position={[lat, lng]} icon={icon}>
              <Popup className="premium-popup">
                <div style={{ padding: '8px', minWidth: '160px' }}>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '1.1rem', fontWeight: 800, color: '#1a1a1a' }}>{salon.name}</h3>
                  <p style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    📍 {salon.address || 'Tiranë'}
                  </p>
                  <Link 
                    href={`/salon/${salon.id}`} 
                    style={{ 
                      display: 'block', 
                      background: 'var(--primary)', 
                      color: 'white', 
                      padding: '8px 12px', 
                      borderRadius: '8px', 
                      textDecoration: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      textAlign: 'center',
                      boxShadow: '0 4px 12px rgba(194, 149, 69, 0.3)'
                    }}
                  >
                    Rezervo Tani
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
