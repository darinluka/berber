import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminOverview() {
  // Fetch real data for Super Admin
  const [salonsCount, usersCount, revenueSum, bookingsCount, pendingCount] = await Promise.all([
    prisma.salon.count(),
    prisma.user.count(),
    prisma.finance.aggregate({
      where: { type: "INCOME" },
      _sum: { amount: true }
    }),
    prisma.booking.count(),
    prisma.salon.count({ where: { isApproved: false } })
  ]);

  const recentSalons = await prisma.salon.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { users: true, bookings: true } }
    }
  });

  const stats = [
    { title: "Total Sallone", value: salonsCount.toString(), icon: "🏬", trend: `${pendingCount} në pritje`, trendColor: pendingCount > 0 ? 'var(--warning)' : 'var(--success)' },
    { title: "Total Përdorues", value: usersCount.toString(), icon: "👥", trend: "Active accounts", trendColor: 'var(--success)' },
    { title: "Total Rezervime", value: bookingsCount.toString(), icon: "📅", trend: "Të gjitha kohëve", trendColor: 'var(--primary)' },
    { title: "Të Ardhura Totale", value: `${(revenueSum._sum.amount || 0).toLocaleString()} L`, icon: "💰", trend: "Të gjitha salloneve", trendColor: 'var(--success)' },
  ];

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 style={{ fontSize: '2rem' }}>Përmbledhje Globale</h1>
          <p className="text-muted">Statistikat e platformës Berberi.al në të gjithë Shqipërinë.</p>
        </div>
        <button className="btn btn-primary">Gjenero Raport Global</button>
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="card">
            <div className="flex justify-between items-start mb-4">
              <span style={{ fontSize: '1.5rem' }}>{stat.icon}</span>
              <span style={{ fontSize: '0.75rem', color: stat.trendColor || 'var(--success)', fontWeight: 600 }}>{stat.trend}</span>
            </div>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>{stat.title}</p>
            <h2 style={{ fontSize: '1.75rem', marginTop: '0.5rem' }}>{stat.value}</h2>
          </div>
        ))}
      </div>

      <div className="grid gap-8 mt-8" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
        {/* Salon Management Preview */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3>Sallonet e Fundit të Regjistruara</h3>
            <Link href="/admin/salons" className="text-primary" style={{ fontSize: '0.875rem' }}>Shiko të gjitha →</Link>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', fontSize: '0.85rem' }} className="text-muted">
                <th style={{ padding: '1rem 0' }}>Emri i Sallonit</th>
                <th style={{ padding: '1rem 0' }}>Stafi</th>
                <th style={{ padding: '1rem 0' }}>Adresa</th>
                <th style={{ padding: '1rem 0', textAlign: 'right' }}>Veprime</th>
              </tr>
            </thead>
            <tbody>
              {recentSalons.map(salon => (
                <tr key={salon.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 0', fontWeight: 600 }}>{salon.name}</td>
                  <td style={{ padding: '1rem 0' }}>{salon._count.users} berberë</td>
                  <td style={{ padding: '1rem 0' }}>{salon.address}</td>
                  <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                    <Link href={`/admin/salons`} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                      Menaxho
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Growth Chart (Mock) */}
        <div className="card">
          <h3 className="mb-6">Rritja e Platformës</h3>
          <div className="grid gap-4 mt-8">
            {[
              { label: "Sallone", p: 65, color: 'var(--primary)' },
              { label: "Përdorues", p: 85, color: 'var(--success)' },
              { label: "Rezervime", p: 45, color: 'var(--warning)' }
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between mb-2" style={{ fontSize: '0.9rem' }}>
                  <span>{item.label}</span>
                  <span style={{ fontWeight: 600 }}>{item.p}%</span>
                </div>
                <div style={{ width: '100%', height: '12px', background: 'var(--surface-hover)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div className="fade-in" style={{ width: `${item.p}%`, height: '100%', background: item.color }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 p-4" style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>
              ℹ️ Platforma ka një rritje prej 22% krahasuar me tremujorin e kaluar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
