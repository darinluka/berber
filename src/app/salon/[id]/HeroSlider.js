"use client";

import { useState, useEffect } from "react";
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
            backgroundImage: `url(${img})`,
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
        <span className={styles.badge}>E Hapur</span>
        <h1 className={styles.title}>{salon.name}</h1>
        <div className={styles.meta}>
          <span>📍 {salon.address}</span>
          <span>⭐ 4.9 (120 Vlerësime)</span>
          <span>📞 {salon.phone || "+355 69 XX XX XXX"}</span>
        </div>
        
        {images.length > 1 && (
          <div className="flex gap-2 mt-6">
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
