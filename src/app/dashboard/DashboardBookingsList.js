"use client";

import { useState } from "react";
import { updateBookingStatus } from "@/app/actions/bookings";
import { useRouter } from "next/navigation";

export default function DashboardBookingsList({ initialBookings }) {
  const router = useRouter();
  const [bookings, setBookings] = useState(initialBookings);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loadingId, setLoadingId] = useState(null);

  const handleStatusChange = async (id, newStatus) => {
    setLoadingId(id);
    const res = await updateBookingStatus(id, newStatus);
    if (res.success) {
      // Update local state
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
      // Refresh page data (updates stats cards)
      router.refresh();
    } else {
      alert("Gabim gjatë përditësimit: " + res.error);
    }
    setLoadingId(null);
  };

  // Filter bookings
  const filteredBookings = bookings.filter(b => {
    const matchesSearch = 
      b.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.client.phone && b.client.phone.includes(searchTerm)) ||
      b.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.barber.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case "COMPLETED":
        return { background: "rgba(16, 185, 129, 0.1)", color: "var(--success)" };
      case "APPROVED":
        return { background: "rgba(59, 130, 246, 0.1)", color: "var(--primary)" };
      case "PENDING":
        return { background: "rgba(245, 158, 11, 0.1)", color: "var(--warning)" };
      case "CANCELLED":
        return { background: "rgba(239, 68, 68, 0.1)", color: "var(--error)" };
      default:
        return { background: "var(--surface-hover)", color: "var(--foreground)" };
    }
  };

  const formatBookingDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("sq-AL", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const formatBookingTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("sq-AL", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="card" style={{ padding: '2rem' }}>
      <div className="flex justify-between items-center mb-6 search-container-mobile" style={{ gap: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Menaxhimi i Rezervimeve</h2>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>Aprovo ose anulo rezervimet e klientëve.</p>
        </div>

        <div className="flex gap-2 search-buttons-container" style={{ flexGrow: 1, maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Kërko klient, shërbim ose berber..."
            className="input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6" style={{ overflowX: 'auto', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
        {["ALL", "PENDING", "APPROVED", "COMPLETED", "CANCELLED"].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              fontWeight: 600,
              background: statusFilter === status ? 'var(--primary)' : 'transparent',
              color: statusFilter === status ? 'white' : 'var(--text-muted)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            {status === "ALL" && "Të gjitha"}
            {status === "PENDING" && "Në Pritje ⏳"}
            {status === "APPROVED" && "Të Miratuara ✅"}
            {status === "COMPLETED" && "Të Përfunduara 🏁"}
            {status === "CANCELLED" && "Të Anuluara ❌"}
          </button>
        ))}
      </div>

      {/* Bookings Table */}
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '1rem' }}>Klienti</th>
              <th style={{ padding: '1rem' }}>Shërbimi & Çmimi</th>
              <th style={{ padding: '1rem' }}>Berberi</th>
              <th style={{ padding: '1rem' }}>Data & Ora</th>
              <th style={{ padding: '1rem' }}>Statusi</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Veprime</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.length > 0 ? (
              filteredBookings.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover-row">
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{b.client.name}</div>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>{b.client.email}</div>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>{b.client.phone}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 500 }}>{b.service.name}</div>
                    <div className="text-primary" style={{ fontWeight: 700, fontSize: '0.85rem' }}>{b.service.price} L</div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>
                    {b.barber.name}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600 }}>{formatBookingDate(b.date)}</div>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>ora {formatBookingTime(b.date)}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '20px',
                      fontWeight: 700,
                      ...getStatusStyle(b.status)
                    }}>
                      {b.status === "PENDING" && "PENDING"}
                      {b.status === "APPROVED" && "APPROVED"}
                      {b.status === "COMPLETED" && "COMPLETED"}
                      {b.status === "CANCELLED" && "CANCELLED"}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div className="flex gap-2 justify-end">
                      {b.status === "PENDING" && (
                        <button
                          className="btn btn-primary"
                          onClick={() => handleStatusChange(b.id, "APPROVED")}
                          disabled={loadingId === b.id}
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        >
                          Mirato
                        </button>
                      )}
                      {(b.status === "PENDING" || b.status === "APPROVED") && (
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleStatusChange(b.id, "CANCELLED")}
                          disabled={loadingId === b.id}
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--error)' }}
                        >
                          Anulo
                        </button>
                      )}
                      {b.status === "APPROVED" && (
                        <button
                          className="btn btn-primary"
                          onClick={() => handleStatusChange(b.id, "COMPLETED")}
                          disabled={loadingId === b.id}
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', backgroundColor: 'var(--success)', boxShadow: 'none' }}
                        >
                          Përfundo
                        </button>
                      )}
                      {(b.status === "COMPLETED" || b.status === "CANCELLED") && (
                        <span className="text-muted" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>Mbyllur</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ padding: '3rem', textAlign: 'center' }} className="text-muted">
                  Nuk u gjet asnjë rezervim.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
