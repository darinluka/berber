import Link from "next/link";
import { getSalon } from "@/app/actions/salons";
import { prisma } from "@/lib/prisma";

export const dynamic = " force-dynamic;
import TipCard from "./TipCard";
import DashboardBookingsList from "./DashboardBookingsList";

export default async function DashboardOverview() {
  const salonResult = await getSalon();
  const salon = salonResult?.salon;
  const salonId = salon?.id;

  const [
    bookingsCount,
    revenueSum,
    staffCount,
    completedBookings,
    noShows,
    bookings
  ] = await Promise.all([
    prisma.booking.count({ where: { salonId } }),
    prisma.finance.aggregate({
      where: { salonId, type: "INCOME" },
      _sum: { amount: true }
    }),
    prisma.user.count({ where: { role: "BARBER", salonId } }),
    prisma.booking.count({ where: { salonId, status: "COMPLETED" } }),
    prisma.booking.count({ where: { salonId, status: "NO_SHOW" } }),
    prisma.booking.findMany({
      where: { salonId },
      include: { client: true, service: true, barber: true },
      orderBy: { date: "desc" }
    })
  ]);

  const totalFinished = completedBookings + noShows;
  const attendanceRate =
    totalFinished > 0
      ? Math.round((completedBookings / totalFinished) * 100)
      : 100;

  const stats = [
    { title: "Rezervime",    value: bookingsCount.toString(),                          icon: "📅", color: "var(--primary)", href: "/dashboard/calendar" },
    { title: "Të Ardhurat", value: `${(revenueSum._sum.amount || 0).toLocaleString()} L`, icon: "💰", color: "var(--warning)",  href: "/dashboard/finance"  },
    { title: "Ardhja",       value: `${attendanceRate}%`,                              icon: "📈", color: "var(--success)",  href: "/dashboard/calendar" },
    { title: "Berberë",      value: staffCount.toString(),                             icon: "💈", color: "var(--primary)", href: "/dashboard/staff"    },
  ];

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 style={{ fontSize: "1.75rem" }}>
            Mirësevjen – {salon?.name || "Salloni Juaj"}
          </h1>
          <p className="text-muted">Përmbledhja e aktivitetit për sot.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/calendar"
            className="btn btn-primary"
            style={{ padding: "0.6rem 1.2rem" }}
          >
            + Rezervim i Ri
          </Link>
        </div>
      </div>

      <style>{`
        .stat-card-hover {
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
          border: 1px solid var(--border);
          cursor: pointer;
        }
        .stat-card-hover:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.08);
          border-color: var(--hover-color) !important;
        }
      `}</style>

      {/* Stat Cards – clickable */}
      <div
        className="grid grid-cols-4 gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
      >
        {stats.map((stat, i) => (
          <Link
            key={i}
            href={stat.href}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div
              className="card flex items-center gap-4 stat-card-hover"
              style={{
                "--hover-color": stat.color
              }}
            >
              <div
                style={{
                  fontSize: "1.5rem",
                  background: "rgba(128, 128, 128, 0.05)",
                  color: stat.color,
                  width: "50px",
                  height: "50px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border)",
                  flexShrink: 0,
                }}
              >
                {stat.icon}
              </div>
              <div>
                <p
                  className="text-muted"
                  style={{ fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase" }}
                >
                  {stat.title}
                </p>
                <h2 style={{ fontSize: "1.25rem" }}>{stat.value}</h2>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-8 mt-8" style={{ gridTemplateColumns: "1.5fr 1fr" }}>
        <div className="card">
          <h3 className="mb-8" style={{ fontSize: "1.1rem" }}>Performanca Javore</h3>
          <div
            style={{
              height: "200px",
              display: "flex",
              alignItems: "flex-end",
              gap: "1rem",
              paddingBottom: "1rem",
            }}
          >
            {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  background: i === 3 ? "var(--primary)" : "var(--surface-hover)",
                  height: `${h}%`,
                  borderRadius: "4px 4px 0 0",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    bottom: "-25px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: "0.7rem",
                  }}
                  className="text-muted"
                >
                  {["Hë", "Ma", "Më", "En", "Pr", "Sh", "Di"][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          <TipCard attendanceRate={attendanceRate} />

          <div className="card">
            <h3 className="mb-4" style={{ fontSize: "1.1rem" }}>Veprime të Shpejta</h3>
            <div className="grid gap-2">
              <Link href="/dashboard/services" className="btn btn-secondary text-left">
                💈 Menaxho Shërbimet
              </Link>
              <Link href="/dashboard/staff" className="btn btn-secondary text-left">
                ✂️ Menaxho Stafin
              </Link>
              <Link href="/dashboard/crm" className="btn btn-secondary text-left">
                👥 Shto Klient
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <DashboardBookingsList initialBookings={bookings} />
      </div>
    </div>
  );
}
