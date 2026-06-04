"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./salon.module.css";
import { getBusySlots, createBooking } from "@/app/actions/bookings";

export default function SalonClient({ salon, services, barbers }) {
  const [step, setStep] = useState(1);
  const dateScrollRef = useRef(null);

  const scrollDates = (direction) => {
    if (dateScrollRef.current) {
      dateScrollRef.current.scrollBy({ left: direction === 'left' ? -150 : 150, behavior: 'smooth' });
    }
  };
  const [loading, setLoading] = useState(false);
  const [busySlots, setBusySlots] = useState([]);
  const [approvedImmediately, setApprovedImmediately] = useState(false);
  
  const [bookingData, setBookingData] = useState({
    barber: "",
    barberId: "",
    service: "",
    serviceId: "",
    date: "",
    time: "",
    name: "",
    phone: "",
    email: ""
  });

  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", 
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", 
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", 
    "18:00", "18:30", "19:00", "19:30", "20:00"
  ];

  useEffect(() => {
    if (bookingData.date && bookingData.barberId) {
      const fetchBusy = async () => {
        const slots = await getBusySlots(salon.id, bookingData.date, bookingData.barberId);
        setBusySlots(slots);
      };
      fetchBusy();
    }
  }, [bookingData.date, bookingData.barberId, salon.id]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await createBooking({
      ...bookingData,
      salonId: salon.id
    });

    if (result.success) {
      setApprovedImmediately(result.isApprovedImmediately || false);
      setStep(5);
    } else {
      alert("Gabim gjatë rezervimit: " + result.error);
    }
    setLoading(false);
  };

  return (
    <div className={`${styles.mainGrid} container`}>
      <style dangerouslySetInnerHTML={{__html: `
        .service-card-left {
          background-color: var(--surface) !important;
          border: 1px solid var(--border) !important;
          border-radius: var(--radius-md) !important;
          padding: 1.25rem 1.5rem !important;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.3s ease;
        }
        .service-card-left:hover {
          border-color: var(--primary) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.3);
        }
        .barber-card-left {
          background-color: var(--surface) !important;
          border: 1px solid var(--border) !important;
          border-radius: var(--radius-lg) !important;
          padding: 1.25rem !important;
          text-align: center;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .barber-card-left:hover {
          border-color: var(--primary) !important;
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.4);
        }
        .barber-photo-bw {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: grayscale(100%) brightness(0.85);
          transition: all 0.5s ease;
        }
        .barber-card-left:hover .barber-photo-bw {
          filter: grayscale(0%) brightness(1);
        }
        
        .booking-input-dark {
          width: 100%;
          padding: 1rem !important;
          background: var(--surface) !important;
          border: 1px solid var(--border) !important;
          border-radius: var(--radius-md) !important;
          color: #fff !important;
          outline: none;
          transition: border-color 0.2s;
        }
        .booking-input-dark:focus {
          border-color: var(--primary) !important;
        }
      `}} />

      {/* Left Side: Info, Gallery, Services, Team */}
      <div className={styles.infoSide}>
        {/* Rreth Nesh */}
        <div className={styles.infoCard}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={styles.sectionTitle} style={{ margin: 0, fontFamily: 'var(--font-serif)', fontWeight: 500 }}>Rreth Nesh</h2>
            {(() => {
              const todayStr = new Date().toISOString().split('T')[0];
              const todayDayOfWeek = new Date().getDay().toString();
              const closedDaysArray = salon.closedDays ? salon.closedDays.split(',') : [];
              const closedDatesArray = salon.closedDates ? salon.closedDates.split(',') : [];
              const isClosedToday = closedDaysArray.includes(todayDayOfWeek) || closedDatesArray.includes(todayStr);

              return isClosedToday ? (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700, border: '1px solid var(--error)' }}>
                  🔴 Sot është mbyllur
                </div>
              ) : null;
            })()}
          </div>
          <p className="text-muted" style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>
            {salon.description || `Mirësevini në ${salon.name}. Ne ofrojmë shërbimet më cilësore për kujdesin tuaj në një ambient modern dhe profesional. Stafi ynë është i kualifikuar për të realizuar çdo kërkesë tuajën me saktësi dhe stil. Trajtime moderne, prerje klasike dhe kujdes maksimal ndaj detajeve.`}
          </p>
        </div>

        {/* Galeria - Added 3 photo grid as requested by screenshot */}
        <div className={styles.infoCard}>
          <h2 className={styles.sectionTitle} style={{ fontFamily: 'var(--font-serif)', fontWeight: 500 }}>Galeria</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '15px', marginTop: '1.5rem' }}>
            {/* Large vertical image */}
            <div style={{ height: '350px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' }}>
              <img 
                src={salon.heroImage1 || salon.coverImage || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800"} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                alt="Gallery Large" 
              />
            </div>
            {/* Two smaller images stacked vertically */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', height: '350px' }}>
              <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }}>
                <img 
                  src={salon.heroImage2 || "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=600"} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  alt="Gallery Small 1" 
                />
              </div>
              <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }}>
                <img 
                  src={salon.heroImage3 || "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?w=600"} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  alt="Gallery Small 2" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Shërbimet Tona - Upgraded 2-column list with gold prices */}
        <div className={styles.infoCard}>
          <h2 className={styles.sectionTitle} style={{ fontFamily: 'var(--font-serif)', fontWeight: 500 }}>Shërbimet</h2>
          <div className="grid md-grid-cols-2 gap-4 mt-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
            {services.map((srv, idx) => (
              <div key={idx} className="service-card-left">
                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: 500, color: '#fff', fontFamily: 'var(--font-heading)' }}>{srv.name}</h4>
                  <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>⏱ {srv.duration} min</p>
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', fontFamily: 'var(--font-serif)' }}>{srv.price} L</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ekipi (Ekipi i Berberëve) - Added Grayscale Barber Cards */}
        {barbers && barbers.length > 0 && (
          <div className={styles.infoCard}>
            <h2 className={styles.sectionTitle} style={{ fontFamily: 'var(--font-serif)', fontWeight: 500 }}>Ekipi</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginTop: '1.5rem' }}>
              {barbers.map((barber, idx) => {
                const roles = ["Master Barber", "Senior Stylist", "Specialist Mjekre"];
                const roleText = roles[idx % roles.length];
                return (
                  <div key={idx} className="barber-card-left">
                    <div style={{
                      width: '100%',
                      height: '210px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      marginBottom: '1rem',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.4)'
                    }}>
                      <img 
                        src={barber.image || "https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=300"} 
                        alt={barber.name} 
                        className="barber-photo-bw"
                      />
                    </div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', margin: 0 }}>{barber.name}</h4>
                    <p className="text-primary" style={{ fontSize: '0.8rem', fontWeight: 600, marginTop: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--primary)' }}>
                      {roleText}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Produktet */}
        {salon.inventory && salon.inventory.length > 0 && (
          <div className={styles.infoCard}>
            <h2 className={styles.sectionTitle} style={{ fontFamily: 'var(--font-serif)', fontWeight: 500 }}>Produktet Tona</h2>
            <div className="grid gap-4 mt-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              {salon.inventory.map((prod, idx) => (
                <div key={idx} className={styles.serviceItemStatic} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{prod.name}</h4>
                    <p className="text-muted mt-2" style={{ fontSize: '0.85rem' }}>
                      Stoku: {prod.stock > 0 ? `${prod.stock} copë` : "Mungon"}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center">
                    <span style={{ 
                      fontSize: '0.75rem', 
                      padding: '0.2rem 0.6rem', 
                      borderRadius: '20px',
                      background: prod.stock > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: prod.stock > 0 ? 'var(--success)' : 'var(--error)',
                      fontWeight: 700
                    }}>
                      {prod.stock > 0 ? "Në Stok" : "Së Shpejti"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Side: Sticky Booking Flow (Preserved Steps & Logics, Upgraded visual design) */}
      <div className={styles.bookingSide}>
        <div className={styles.bookingCard} style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)' }}>
          <h2 style={{ marginBottom: '0.5rem', textAlign: 'center', fontSize: '1.65rem', fontFamily: 'var(--font-serif)', fontWeight: 500 }}>Rezervo Tani</h2>
          <p className="text-muted" style={{ textAlign: 'center', fontSize: '0.85rem', marginBottom: '2.5rem' }}>Zgjidh ditën dhe orarin që të përshtatet.</p>
          
          {/* Step Indicators */}
          <div className="flex justify-between mb-10" style={{ position: 'relative', padding: '0 10px' }}>
            {[1, 2, 3, 4].map(s => (
              <div 
                key={s} 
                style={{ 
                  width: '35px', height: '35px', borderRadius: '50%', 
                  background: step >= s ? 'var(--primary)' : 'var(--secondary)',
                  color: step >= s ? '#000' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.9rem', fontWeight: 800, zIndex: 2,
                  transition: 'all 0.3s ease',
                  border: step === s ? '4px solid rgba(212, 175, 55, 0.25)' : 'none'
                }}
              >
                {s}
              </div>
            ))}
            <div style={{ position: 'absolute', top: '17px', left: '10px', right: '10px', height: '2px', background: 'var(--border)', zIndex: 1 }}></div>
          </div>

          {step === 1 && (
            <div className="fade-in">
              <h3 className="mb-6 text-center" style={{ fontSize: '1.15rem', color: 'var(--primary)', fontWeight: 600 }}>Zgjidh Shërbimin</h3>
              <div className="grid gap-3">
                {services.map((srv, idx) => (
                  <div 
                    key={idx} 
                    className={`${styles.serviceItem} ${bookingData.serviceId === srv.id ? styles.serviceItemActive : ""}`}
                    onClick={() => {
                      setBookingData({...bookingData, service: srv.name, serviceId: srv.id});
                      setStep(2);
                    }}
                    style={{ 
                      cursor: 'pointer', 
                      padding: '1.25rem',
                      background: bookingData.serviceId === srv.id ? 'rgba(212, 175, 55, 0.1)' : 'var(--secondary)',
                      borderColor: bookingData.serviceId === srv.id ? 'var(--primary)' : 'var(--border)',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span style={{ fontWeight: 600, color: '#fff' }}>{srv.name}</span>
                      <strong className="text-primary" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem' }}>{srv.price} L</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="fade-in">
              <h3 className="mb-6 text-center" style={{ fontSize: '1.15rem', color: 'var(--primary)', fontWeight: 600 }}>Zgjidh Berberin</h3>
              <div className="grid grid-cols-2 gap-4">
                {barbers.map((barber, idx) => (
                  <div 
                    key={idx} 
                    className={`${styles.barberItem} ${bookingData.barberId === barber.id ? styles.barberActive : ""} text-center`}
                    onClick={() => {
                      setBookingData({...bookingData, barber: barber.name, barberId: barber.id});
                      setStep(3);
                    }}
                    style={{ 
                      cursor: 'pointer',
                      background: bookingData.barberId === barber.id ? 'rgba(212, 175, 55, 0.08)' : 'var(--secondary)',
                      borderColor: bookingData.barberId === barber.id ? 'var(--primary)' : 'var(--border)'
                    }}
                  >
                    <div 
                      className={styles.barberCircle} 
                      style={{ 
                        backgroundImage: `url(${barber.image || "https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=200"})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        border: bookingData.barberId === barber.id ? '2px solid var(--primary)' : '2px solid transparent'
                      }}
                    ></div>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>{barber.name}</p>
                    <p className="text-muted" style={{ fontSize: '0.75rem' }}>Master Barber</p>
                  </div>
                ))}
              </div>
              <button 
                className="btn btn-secondary mt-8" 
                style={{ width: '100%', borderRadius: 'var(--radius-full)', fontWeight: 600 }} 
                onClick={() => setStep(1)}
              >
                Mbrapa
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="fade-in">
              <h3 className="mb-6 text-center" style={{ fontSize: '1.15rem', color: 'var(--primary)', fontWeight: 600 }}>Data & Ora</h3>
              <div className="mb-6" style={{ width: '100%', overflow: 'hidden' }}>
                <style dangerouslySetInnerHTML={{__html: `
                  .date-scroll::-webkit-scrollbar { display: none; }
                `}} />
                <div className="flex items-center gap-2" style={{ width: '100%' }}>
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); scrollDates('left'); }}
                    className="flex items-center justify-center"
                    style={{ 
                      background: 'rgba(255,255,255,0.05)', 
                      border: '1px solid var(--border)', 
                      borderRadius: '50%', 
                      width: '36px', 
                      height: '36px', 
                      flexShrink: 0, 
                      color: 'var(--primary)',
                      cursor: 'pointer', 
                      zIndex: 50
                    }}
                  >
                    ←
                  </button>
                  <div 
                    ref={dateScrollRef} 
                    className="flex gap-2 pb-2 date-scroll" 
                    style={{ overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', flex: '1 1 0%', minWidth: 0, scrollBehavior: 'smooth', position: 'relative', zIndex: 1 }}
                  >
                  {Array.from({length: 14}).map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() + i);
                    const dateStr = d.toISOString().split('T')[0];
                    const isSelected = bookingData.date === dateStr;
                    const dayName = d.toLocaleDateString('sq-AL', { weekday: 'short' });
                    const dayNum = d.getDate();
                    const monthName = d.toLocaleDateString('sq-AL', { month: 'short' });
                    
                    const dayOfWeek = d.getDay().toString();
                    const closedDaysArray = salon.closedDays ? salon.closedDays.split(',') : [];
                    const closedDatesArray = salon.closedDates ? salon.closedDates.split(',') : [];
                    const isClosed = closedDaysArray.includes(dayOfWeek) || closedDatesArray.includes(dateStr);
                    
                    return (
                      <div 
                        key={i}
                        onClick={() => {
                          if (!isClosed) setBookingData({...bookingData, date: dateStr});
                        }}
                        style={{
                          flex: '0 0 calc(33.333% - 0.35rem)',
                          padding: '10px',
                          borderRadius: '8px',
                          background: isClosed ? 'var(--secondary)' : (isSelected ? 'var(--primary)' : 'var(--secondary)'),
                          color: isClosed ? 'var(--text-muted)' : (isSelected ? '#000' : 'var(--foreground)'),
                          cursor: isClosed ? 'not-allowed' : 'pointer',
                          textAlign: 'center',
                          border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                          opacity: isClosed ? 0.4 : 1,
                          transition: 'all 0.2s ease',
                          position: 'relative'
                        }}
                      >
                        <div style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'capitalize' }}>{dayName}</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, margin: '2px 0', textDecoration: isClosed ? 'line-through' : 'none' }}>{dayNum}</div>
                        {isClosed ? (
                          <div style={{ fontSize: '0.6rem', color: 'var(--error)', fontWeight: 800, textTransform: 'uppercase' }}>Mbyllur</div>
                        ) : (
                          <div style={{ fontSize: '0.7rem', opacity: 0.8, textTransform: 'capitalize' }}>{monthName}</div>
                        )}
                      </div>
                    );
                  })}
                  </div>
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); scrollDates('right'); }}
                    className="flex items-center justify-center"
                    style={{ 
                      background: 'rgba(255,255,255,0.05)', 
                      border: '1px solid var(--border)', 
                      borderRadius: '50%', 
                      width: '36px', 
                      height: '36px', 
                      flexShrink: 0, 
                      color: 'var(--primary)',
                      cursor: 'pointer', 
                      zIndex: 50
                    }}
                  >
                    →
                  </button>
                </div>
              </div>
              
              {bookingData.date ? (
                (busySlots.length === 1 && busySlots[0] === "CLOSED") ? (
                  <div className="text-center py-6" style={{ background: 'var(--secondary)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--error)', color: 'var(--error)' }}>
                    <p style={{ fontWeight: 600, fontSize: '1rem' }}>Salloni është i mbyllur sot!</p>
                  </div>
                ) : (
                  <div className={styles.timeGrid} style={{ gap: '0.5rem' }}>
                    {timeSlots.map((time, idx) => {
                      const isBusy = busySlots.includes(time);
                      const isSelected = bookingData.time === time;
                      return (
                        <button 
                          key={idx} 
                          disabled={isBusy}
                          className={`${styles.timeItem} ${isSelected ? styles.timeItemActive : ""}`}
                          style={{ 
                            cursor: isBusy ? 'not-allowed' : 'pointer', 
                            background: isBusy ? 'rgba(239, 68, 68, 0.15)' : (isSelected ? 'var(--primary)' : 'var(--secondary)'),
                            color: isBusy ? 'var(--error)' : (isSelected ? '#000' : 'var(--foreground)'),
                            border: isBusy ? '1px solid var(--error)' : (isSelected ? '1px solid var(--primary)' : '1px solid var(--border)'),
                            opacity: 1,
                            fontWeight: 600,
                            padding: isBusy ? '0.45rem 0.25rem' : '0.6rem 0.25rem',
                            fontSize: '0.85rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            lineHeight: '1.2'
                          }}
                          onClick={() => !isBusy && setBookingData({...bookingData, time})}
                        >
                          {isBusy ? (
                            <>
                              <span style={{ textDecoration: 'line-through', opacity: 0.75 }}>{time}</span>
                              <span style={{ fontSize: '0.62rem', fontWeight: 800, marginTop: '2px', color: 'var(--error)' }}>Zënë 🔴</span>
                            </>
                          ) : (
                            time
                          )}
                        </button>
                      );
                    })}
                  </div>
                )
              ) : (
                <div className="text-center py-6 text-muted" style={{ background: 'var(--secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
                  Zgjidh datën për të parë oraret.
                </div>
              )}

              <div className="flex gap-3 mt-8">
                <button 
                  className="btn btn-secondary" 
                  style={{ borderRadius: 'var(--radius-full)', fontWeight: 600 }}
                  onClick={() => setStep(2)}
                >
                  Mbrapa
                </button>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1, borderRadius: 'var(--radius-full)', fontWeight: 600 }}
                  disabled={!bookingData.date || !bookingData.time || (busySlots.length === 1 && busySlots[0] === "CLOSED")}
                  onClick={() => setStep(4)}
                >
                  Vazhdo
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <form onSubmit={handleBookingSubmit} className="fade-in">
              <h3 className="mb-6 text-center" style={{ fontSize: '1.15rem', color: 'var(--primary)', fontWeight: 600 }}>Të Dhënat Tuaja</h3>
              <div className="grid gap-4">
                <div>
                  <label className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.4rem', display: 'block' }}>Emri Mbiemri</label>
                  <input type="text" className="booking-input-dark" placeholder="Emër Mbiemër" required onChange={(e) => setBookingData({...bookingData, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.4rem', display: 'block' }}>Numri i Telefonit</label>
                  <input type="tel" className="booking-input-dark" placeholder="+355 6X XX XX XXX" required onChange={(e) => setBookingData({...bookingData, phone: e.target.value})} />
                </div>
                <div>
                  <label className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.4rem', display: 'block' }}>Email</label>
                  <input type="email" className="booking-input-dark" placeholder="email@shembull.com" required onChange={(e) => setBookingData({...bookingData, email: e.target.value})} />
                </div>
              </div>

              <div className="mt-8 p-5" style={{ background: 'var(--secondary)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--primary)' }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: '#fff' }}>Konfirmimi i rezervimit:</p>
                <div style={{ fontSize: '0.85rem', lineHeight: '1.5' }} className="text-muted">
                  <p>✂️ <strong>Shërbimi:</strong> {bookingData.service}</p>
                  <p>👤 <strong>Berberi:</strong> {bookingData.barber}</p>
                  <p>📅 <strong>Koha:</strong> {bookingData.date} në orën {bookingData.time}</p>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button type="button" className="btn btn-secondary" style={{ borderRadius: 'var(--radius-full)', fontWeight: 600 }} onClick={() => setStep(3)}>Mbrapa</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, borderRadius: 'var(--radius-full)', fontWeight: 600 }} disabled={loading}>
                  {loading ? "Duke u dërguar..." : "Dërgo Aplikimin"}
                </button>
              </div>
            </form>
          )}

          {step === 5 && (
            <div className="text-center py-10 fade-in">
              {approvedImmediately ? (
                <>
                  <div style={{ fontSize: '4.5rem', marginBottom: '1.5rem' }}>✨</div>
                  <h2 className="mb-3" style={{ fontFamily: 'var(--font-serif)', fontWeight: 500 }}>Rezervimi u Krye!</h2>
                  <p className="text-muted mb-10" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>Rezervimi juaj u konfirmua automatikisht. Njoftimi u dërgua me email. Do të shihemi së shpejti në {salon.name}.</p>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '4.5rem', marginBottom: '1.5rem' }}>📩</div>
                  <h2 className="mb-3" style={{ fontFamily: 'var(--font-serif)', fontWeight: 500 }}>Aplikimi u Dërgua!</h2>
                  <p className="text-muted mb-10" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>Aplikimi juaj për rezervim u regjistrua me sukses. Pasi të miratohet nga berberi/salloni, ju do të njoftoheni me një email konfirmimi.</p>
                </>
              )}
              <Link href="/" className="btn btn-primary" style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>Mbyll</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
