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
      {/* Left Side: Info and Services */}
      <div className={styles.infoSide}>
        <div className={styles.infoCard}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Rreth Nesh</h2>
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
          <p className="text-muted" style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
            {salon.description || `Mirësevini në ${salon.name}. Ne ofrojmë shërbimet më cilësore për kujdesin tuaj në një ambient modern dhe profesional. Stafi ynë është i kualifikuar për të realizuar çdo kërkesë tuajën me saktësi dhe stil.`}
          </p>
        </div>

        <div className={styles.infoCard}>
          <h2 className={styles.sectionTitle}>Shërbimet Tona</h2>
          <div className="grid gap-4 mt-6">
            {services.map((srv, idx) => (
              <div key={idx} className={styles.serviceItemStatic}>
                <div className="flex justify-between items-center">
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{srv.name}</h4>
                  <span className="text-primary" style={{ fontWeight: 700, fontSize: '1.25rem' }}>{srv.price} L</span>
                </div>
                <p className="text-muted mt-2" style={{ fontSize: '0.95rem' }}>{srv.description || "Përjetoni cilësinë maksimale në këtë shërbim profesional."}</p>
                <div className="mt-4 flex items-center gap-4 text-muted" style={{ fontSize: '0.85rem' }}>
                  <span>⏱ {srv.duration} min</span>
                  <span>•</span>
                  <span>Sterilizim i plotë</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {salon.inventory && salon.inventory.length > 0 && (
          <div className={styles.infoCard}>
            <h2 className={styles.sectionTitle}>Produktet Tona</h2>
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

      {/* Right Side: Sticky Booking Flow */}
      <div className={styles.bookingSide}>
        <div className={styles.bookingCard}>
          <h2 style={{ marginBottom: '2rem', textAlign: 'center', fontSize: '1.75rem' }}>Aplikim për Rezervim</h2>
          
          {/* Step Indicators */}
          <div className="flex justify-between mb-10" style={{ position: 'relative', padding: '0 10px' }}>
            {[1, 2, 3, 4].map(s => (
              <div 
                key={s} 
                style={{ 
                  width: '35px', height: '35px', borderRadius: '50%', 
                  background: step >= s ? 'var(--primary)' : 'var(--surface-hover)',
                  color: step >= s ? 'white' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.9rem', fontWeight: 700, zIndex: 2,
                  transition: 'all 0.3s ease',
                  border: step === s ? '4px solid rgba(194, 149, 69, 0.2)' : 'none'
                }}
              >
                {s}
              </div>
            ))}
            <div style={{ position: 'absolute', top: '17px', left: '10px', right: '10px', height: '2px', background: 'var(--border)', zIndex: 1 }}></div>
          </div>

          {step === 1 && (
            <div className="fade-in">
              <h3 className="mb-6 text-center" style={{ fontSize: '1.25rem' }}>Zgjidh Shërbimin</h3>
              <div className="grid gap-3">
                {services.map((srv, idx) => (
                  <div 
                    key={idx} 
                    className={`${styles.serviceItem} ${bookingData.serviceId === srv.id ? styles.serviceItemActive : ""}`}
                    onClick={() => {
                      setBookingData({...bookingData, service: srv.name, serviceId: srv.id});
                      setStep(2);
                    }}
                    style={{ cursor: 'pointer', padding: '1rem' }}
                  >
                    <div className="flex justify-between items-center">
                      <span style={{ fontWeight: 500 }}>{srv.name}</span>
                      <strong className="text-primary">{srv.price} L</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="fade-in">
              <h3 className="mb-6 text-center" style={{ fontSize: '1.25rem' }}>Zgjidh Berberin</h3>
              <div className="grid grid-cols-2 gap-4">
                {barbers.map((barber, idx) => (
                  <div 
                    key={idx} 
                    className={`${styles.barberItem} ${bookingData.barberId === barber.id ? styles.barberActive : ""} text-center`}
                    onClick={() => {
                      setBookingData({...bookingData, barber: barber.name, barberId: barber.id});
                      setStep(3);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div 
                      className={styles.barberCircle} 
                      style={{ 
                        backgroundImage: `url(${barber.image || "https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=200"})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    ></div>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600 }}>{barber.name}</p>
                    <p className="text-muted" style={{ fontSize: '0.75rem' }}>Master Barber</p>
                  </div>
                ))}
              </div>
              <button className="btn btn-secondary mt-8" style={{ width: '100%' }} onClick={() => setStep(1)}>Mbrapa</button>
            </div>
          )}

          {step === 3 && (
            <div className="fade-in">
              <h3 className="mb-6 text-center" style={{ fontSize: '1.25rem' }}>Data & Ora</h3>
              <div className="mb-6" style={{ width: '100%', overflow: 'hidden' }}>
                <style dangerouslySetInnerHTML={{__html: `
                  .date-scroll::-webkit-scrollbar { display: none; }
                `}} />
                <div className="flex items-center gap-2" style={{ width: '100%' }}>
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); scrollDates('left'); }}
                    className="flex items-center justify-center"
                    style={{ background: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '50%', width: '40px', height: '40px', flexShrink: 0, transition: 'all 0.2s', cursor: 'pointer', zIndex: 50, position: 'relative' }}
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
                          borderRadius: '12px',
                          background: isClosed ? 'var(--surface)' : (isSelected ? 'var(--primary)' : 'var(--surface-hover)'),
                          color: isClosed ? 'var(--text-muted)' : (isSelected ? 'white' : 'var(--text)'),
                          cursor: isClosed ? 'not-allowed' : 'pointer',
                          textAlign: 'center',
                          border: isSelected ? '2px solid rgba(255,255,255,0.2)' : '1px solid var(--border)',
                          opacity: isClosed ? 0.5 : 1,
                          transition: 'all 0.2s ease',
                          position: 'relative'
                        }}
                      >
                        <div style={{ fontSize: '0.8rem', opacity: 0.8, textTransform: 'capitalize' }}>{dayName}</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 700, margin: '4px 0', textDecoration: isClosed ? 'line-through' : 'none' }}>{dayNum}</div>
                        {isClosed ? (
                          <div style={{ fontSize: '0.65rem', color: 'var(--error)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mbyllur</div>
                        ) : (
                          <div style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'capitalize' }}>{monthName}</div>
                        )}
                      </div>
                    );
                  })}
                  </div>
                  <button 
                    type="button"
                    onClick={(e) => { e.preventDefault(); scrollDates('right'); }}
                    className="flex items-center justify-center"
                    style={{ background: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '50%', width: '40px', height: '40px', flexShrink: 0, transition: 'all 0.2s', cursor: 'pointer', zIndex: 50, position: 'relative' }}
                  >
                    →
                  </button>
                </div>
              </div>
              
              {bookingData.date ? (
                (busySlots.length === 1 && busySlots[0] === "CLOSED") ? (
                  <div className="text-center py-6" style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--error)', color: 'var(--error)' }}>
                    <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>Salloni është i mbyllur në këtë datë!</p>
                    <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', opacity: 0.8 }}>Ju lutem zgjidhni një datë tjetër për të parë oraret e lira.</p>
                  </div>
                ) : (
                  <div className={styles.timeGrid}>
                    {timeSlots.map((time, idx) => {
                      const isBusy = busySlots.includes(time);
                      return (
                        <button 
                          key={idx} 
                          disabled={isBusy}
                          className={`${styles.timeItem} ${bookingData.time === time ? styles.timeItemActive : ""}`}
                          style={{ 
                            cursor: isBusy ? 'not-allowed' : 'pointer', 
                            background: isBusy ? '#ef4444' : (bookingData.time === time ? '#16a34a' : '#22c55e'),
                            color: 'white',
                            border: bookingData.time === time ? '2px solid white' : 'none',
                            opacity: isBusy ? 0.6 : 1,
                            fontWeight: 600
                          }}
                          onClick={() => !isBusy && setBookingData({...bookingData, time})}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                )
              ) : (
                <div className="text-center py-6 text-muted" style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)' }}>
                  Ju lutem zgjidhni datën për të parë oraret e lira.
                </div>
              )}

              <div className="flex gap-4 mt-8">
                <button className="btn btn-secondary" onClick={() => setStep(2)}>Mbrapa</button>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1 }}
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
              <h3 className="mb-6 text-center" style={{ fontSize: '1.25rem' }}>Të Dhënat Tuaja</h3>
              <div className="grid gap-4">
                <div>
                  <label className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.4rem', display: 'block' }}>Emri Mbiemri</label>
                  <input type="text" className="card" style={{ width: '100%', padding: '1rem' }} placeholder="Emër Mbiemër" required onChange={(e) => setBookingData({...bookingData, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.4rem', display: 'block' }}>Numri i Telefonit</label>
                  <input type="tel" className="card" style={{ width: '100%', padding: '1rem' }} placeholder="+355 6X XX XX XXX" required onChange={(e) => setBookingData({...bookingData, phone: e.target.value})} />
                </div>
                <div>
                  <label className="text-muted" style={{ fontSize: '0.8rem', marginBottom: '0.4rem', display: 'block' }}>Email</label>
                  <input type="email" className="card" style={{ width: '100%', padding: '1rem' }} placeholder="email@shembull.com" required onChange={(e) => setBookingData({...bookingData, email: e.target.value})} />
                </div>
              </div>

              <div className="mt-8 p-5" style={{ background: 'var(--background)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--primary)' }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Konfirmimi:</p>
                <div style={{ fontSize: '0.85rem' }} className="text-muted">
                  <p>✂️ {bookingData.service}</p>
                  <p>👤 {bookingData.barber}</p>
                  <p>📅 {bookingData.date} në {bookingData.time}</p>
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button type="button" className="btn btn-secondary" onClick={() => setStep(3)}>Mbrapa</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                  {loading ? "Duke u dërguar..." : "Dërgo Aplikimin"}
                </button>
              </div>
            </form>
          )}

          {step === 5 && (
            <div className="text-center py-10 fade-in">
              {approvedImmediately ? (
                <>
                  <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>✨</div>
                  <h2 className="mb-3">Rezervimi u Krye!</h2>
                  <p className="text-muted mb-10">Rezervimi juaj u konfirmua automatikisht. Njoftimi u dërgua me email. Do të shihemi së shpejti në {salon.name}.</p>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '5rem', marginBottom: '1.5rem' }}>📩</div>
                  <h2 className="mb-3">Aplikimi u Dërgua!</h2>
                  <p className="text-muted mb-10">Aplikimi juaj për rezervim u regjistrua me sukses. Pasi të miratohet nga berberi/salloni, ju do të njoftoheni me një email konfirmimi.</p>
                </>
              )}
              <Link href="/" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>Mbyll</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
