"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./salon.module.css";

export default function HeroSlider({ salon }) {
  const images = [
    salon.heroImage1,
    salon.heroImage2,
    salon.heroImage3,
  ].filter(Boolean);

  // If no images, use a default
  if (images.length === 0) {
    images.push(salon.logo || "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80");
  }

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Auto slide
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <section className={styles.hero}>
      {images.map((img, idx) => (
        <div 
          key={idx}
          className={styles.heroImage} 
          style={{ 
            backgroundImage: `linear-gradient(to bottom, rgba(9, 8, 7, 0.4) 0%, rgba(9, 8, 7, 0.95) 100%), url(${img})`,
            opacity: idx === currentIndex ? 1 : 0,
            transition: 'opacity 0.8s ease-in-out',
            zIndex: idx === currentIndex ? 1 : 0
          }}
        ></div>
      ))}
      <div className={styles.heroOverlay}></div>
      
      {images.length > 1 && (
        <div className={styles.sliderNav}>
          <button onClick={prevSlide} className={styles.sliderArrow}>←</button>
          <button onClick={nextSlide} className={styles.sliderArrow}>→</button>
        </div>
      )}

      <div className={`${styles.heroContent} container`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <Link href="/#sallonet" style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '0.9rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            ← Të gjithë sallonet
          </Link>
          <span style={{ 
            background: 'var(--primary)', 
            color: '#000', 
            padding: '0.2rem 0.6rem', 
            borderRadius: '4px', 
            fontSize: '0.65rem', 
            fontWeight: 700, 
            letterSpacing: '0.1em' 
          }}>
            PREMIUM
          </span>
        </div>
        <h1 className={styles.title} style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 500, marginBottom: '1.25rem' }}>
          {salon.name}
        </h1>
        <div className={styles.meta} style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', flexWrap: 'wrap', opacity: 0.9 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>⭐ <strong style={{ color: 'var(--primary)' }}>{salon.rating || 4.9}</strong> • {salon.reviewsCount || 234} vlerësime</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>📍 {salon.address || "Rruga Myslym Shyri, Tiranë"}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>🕒 {salon.hours || "09:00 - 21:00"}</span>
        </div>
        
        {images.length > 1 && (
          <div className="flex gap-2 mt-8">
            {images.map((_, idx) => (
              <div 
                key={idx} 
                onClick={() => setCurrentIndex(idx)}
                style={{ 
                  width: idx === currentIndex ? '30px' : '10px', 
                  height: '4px', 
                  background: idx === currentIndex ? 'var(--primary)' : 'rgba(255,255,255,0.3)',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              ></div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
