"use client";

import { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import startOfMonth from "date-fns/startOfMonth";
import endOfMonth from "date-fns/endOfMonth";
import endOfWeek from "date-fns/endOfWeek";
import addDays from "date-fns/addDays";
import isSameMonth from "date-fns/isSameMonth";
import isSameDay from "date-fns/isSameDay";
import subMonths from "date-fns/subMonths";
import addMonths from "date-fns/addMonths";
import sq from "date-fns/locale/sq";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";
import { createBooking, updateBookingStatus } from "@/app/actions/bookings";

const locales = { "sq": sq };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

export default function CalendarView({ initialBookings, services, staff, salonId }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", serviceId: "", barberId: "", date: "", time: "", notes: ""
  });

  const [currentView, setCurrentView] = useState("week");

  // On mount, if mobile, switch to day view
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setCurrentView("day");
    }
  }, []);

  // Transform Prisma bookings to Calendar events
  const events = initialBookings.map(b => {
    const startDate = new Date(b.date);
    const endDate = new Date(startDate.getTime() + (b.service.duration * 60000));
    return {
      id: b.id,
      title: `${b.service.name} - ${b.client.name}`,
      start: startDate,
      end: endDate,
      status: b.status,
      client: b.client.name,
      barber: b.barber.name,
      service: b.service.name,
      price: `${b.service.price} L`,
      notes: b.notes || "S'ka shënime"
    };
  });

  const eventStyleGetter = (event) => {
    let color = 'var(--primary)';
    if (event.status === 'PENDING') color = 'var(--warning)';
    if (event.status === 'APPROVED') color = 'var(--primary)';
    if (event.status === 'COMPLETED') color = 'var(--success)';
    if (event.status === 'CANCELLED') color = 'var(--error)';
    return { 
      style: { 
        backgroundColor: 'var(--surface)', 
        borderRadius: '6px', 
        border: '1px solid var(--border)',
        borderLeft: `4px solid ${color}`,
        color: 'var(--foreground)', 
        display: 'block',
        boxShadow: 'var(--shadow-sm)'
      } 
    };
  };

  const CustomEvent = ({ event }) => {
    let color = 'var(--primary)';
    if (event.status === 'PENDING') color = 'var(--warning)';
    if (event.status === 'APPROVED') color = 'var(--primary)';
    if (event.status === 'COMPLETED') color = 'var(--success)';
    if (event.status === 'CANCELLED') color = 'var(--error)';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '2px 4px' }}>
        <div style={{ fontWeight: 700, fontSize: '0.8rem', color: color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {event.client}
        </div>
        <div style={{ fontSize: '0.7rem', opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {event.service}
        </div>
        <div style={{ fontSize: '0.65rem', marginTop: 'auto', textAlign: 'right', fontWeight: 600, opacity: 0.6 }}>
          {event.barber}
        </div>
      </div>
    );
  };

  const handleStatusUpdate = async (id, status) => {
    setLoading(true);
    const result = await updateBookingStatus(id, status);
    if (result.success) window.location.reload();
    setLoading(false);
  };

  const handleAddBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await createBooking({ ...formData, salonId });
    if (result.success) window.location.reload();
    else alert("Gabim: " + result.error);
    setLoading(false);
  };

  // Mini Calendar generation
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const rows = [];
  let days = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = day;
      const formattedDate = format(cloneDay, "d");
      const isSelected = isSameDay(cloneDay, currentDate);
      const isCurrentMonth = isSameMonth(cloneDay, monthStart);
      
      days.push(
        <div 
          key={cloneDay.toISOString()} 
          onClick={() => setCurrentDate(cloneDay)}
          style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer', 
            fontSize: '0.85rem', 
            fontWeight: isSelected ? 700 : 500,
            borderRadius: '50%', 
            width: '32px', 
            height: '32px', 
            margin: 'auto',
            background: isSelected ? 'var(--primary)' : 'transparent',
            color: isSelected ? '#fff' : (!isCurrentMonth ? 'var(--muted)' : 'var(--foreground)'),
            transition: 'background 0.2s'
          }}
          className={!isSelected && isCurrentMonth ? 'hover-bg-surface' : ''}
        >
          {formattedDate}
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(<div className="grid grid-cols-7 gap-1 mb-1" key={day.toISOString()}>{days}</div>);
    days = [];
  }

  const weekDays = ["Hë", "Ma", "Më", "En", "Pr", "Sh", "Di"];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="flex justify-between items-center mb-6" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem' }}>Kalendari</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>+ Rezervim i Ri</button>
      </div>

      <div className="dashboard-calendar-layout">
        
        {/* LEFT SIDEBAR: Mini Calendar & Details */}
        <div className="calendar-sidebar">
          <div className="card mb-6" style={{ padding: '1.5rem' }}>
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} style={{ background: 'none', border: 'none', color: 'var(--foreground)', cursor: 'pointer' }}>&lt;</button>
              <h3 style={{ fontSize: '1rem', margin: 0 }}>{format(currentDate, "MMMM yyyy", { locale: sq })}</h3>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} style={{ background: 'none', border: 'none', color: 'var(--foreground)', cursor: 'pointer' }}>&gt;</button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(wd => <div key={wd} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)' }}>{wd}</div>)}
            </div>
            {rows}
          </div>

          {selectedEvent ? (
            <div className="card fade-in" style={{ padding: '1.5rem', borderLeft: `4px solid ${
                selectedEvent.status === 'COMPLETED' ? 'var(--success)' :
                selectedEvent.status === 'CANCELLED' ? 'var(--error)' :
                selectedEvent.status === 'PENDING' ? 'var(--warning)' : 'var(--primary)'
            }` }}>
              <div className="flex justify-between items-start mb-4">
                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Detajet e Rezervimit</h3>
                <button onClick={() => setSelectedEvent(null)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>×</button>
              </div>
              <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                {format(selectedEvent.start, "EEEE, d MMM yyyy • HH:mm", { locale: sq })} - {format(selectedEvent.end, "HH:mm")}
              </p>
              
              <div style={{ marginBottom: '1rem' }}>
                <p className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Klienti</p>
                <p style={{ fontWeight: 600 }}>{selectedEvent.client}</p>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <p className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Shërbimi & Çmimi</p>
                <p>{selectedEvent.service} • <span className="text-primary" style={{ fontWeight: 700 }}>{selectedEvent.price}</span></p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <p className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Berberi</p>
                <p>{selectedEvent.barber}</p>
              </div>

              <div className="grid gap-2">
                {selectedEvent.status !== 'COMPLETED' && (
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleStatusUpdate(selectedEvent.id, "COMPLETED")} disabled={loading}>
                    Përfundo Shërbimin
                  </button>
                )}
                {selectedEvent.status === 'PENDING' && (
                  <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => handleStatusUpdate(selectedEvent.id, "APPROVED")} disabled={loading}>
                    Mirato Takimin
                  </button>
                )}
                <button className="btn btn-secondary" style={{ width: '100%', color: 'var(--error)' }} onClick={() => handleStatusUpdate(selectedEvent.id, "CANCELLED")} disabled={loading}>
                  Anulo Takimin
                </button>
              </div>
            </div>
          ) : (
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center', opacity: 0.7 }}>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>Kliko një rezervim në kalendar për të parë detajet këtu.</p>
            </div>
          )}
        </div>

        {/* MAIN CALENDAR */}
        <div className="card main-calendar-container" style={{ flex: 1, padding: '1.5rem', overflow: 'hidden' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '750px' }}
            view={currentView}
            onView={setCurrentView}
            date={currentDate}
            onNavigate={setCurrentDate}
            views={["day", "week", "month"]}
            culture="sq"
            eventPropGetter={eventStyleGetter}
            components={{ event: CustomEvent }}
            onSelectEvent={(event) => setSelectedEvent(event)}
          />
        </div>
      </div>

      {/* Add Reservation Modal (Kept as Modal) */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="card fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem' }} onClick={e => e.stopPropagation()}>
            <h2 className="mb-6">Shto Rezervim Manual</h2>
            <form onSubmit={handleAddBooking} className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" className="card p-3" placeholder="Emri i Klientit" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}/>
                <input type="tel" className="card p-3" placeholder="Celulari" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}/>
              </div>
              <input type="email" className="card p-3" placeholder="Email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}/>
              <div className="grid grid-cols-2 gap-4">
                <select className="card p-3" required value={formData.serviceId} onChange={e => setFormData({...formData, serviceId: e.target.value})}>
                  <option value="">Zgjidh Shërbimin</option>
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} ({s.price} L)</option>)}
                </select>
                <select className="card p-3" required value={formData.barberId} onChange={e => setFormData({...formData, barberId: e.target.value})}>
                  <option value="">Zgjidh Berberin</option>
                  {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="date" className="card p-3" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}/>
                <input type="time" className="card p-3" required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})}/>
              </div>
              <textarea className="card p-3 h-24" placeholder="Shënime shtesë..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}/>
              <div className="flex gap-4 mt-6">
                <button type="button" className="btn btn-secondary flex-1" onClick={() => setIsAddModalOpen(false)}>Anulo</button>
                <button type="submit" className="btn btn-primary flex-1" disabled={loading}>{loading ? "Po ruhet..." : "Rezervo"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
