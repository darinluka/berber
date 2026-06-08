import Link from "next/link";
import styles from "./salon.module.css";
import { ThemeToggle } from "../../components/ThemeToggle";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/auth";

export const dynamic = "force-dynamic";
import SalonClient from "./SalonClient";
import { notFound } from "next/navigation";
import Logo from "../../components/Logo";
import Footer from "../../components/Footer";
import HeroSlider from "./HeroSlider";

export default async function SalonPage({ params }) {
  const { id } = await params;

  const [salonRaw, currentUser] = await Promise.all([
    prisma.salon.findUnique({
      where: { id },
      include: {
        services: true,
        users: {
          where: { role: "BARBER" }
        },
        inventory: true,
        reviews: {
          orderBy: { createdAt: "desc" }
        }
      }
    }),
    getCurrentUser()
  ]);

  if (!salonRaw) {
    notFound();
  }

  const reviews = salonRaw.reviews || [];
  const avgRating = reviews.length > 0
    ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
    : 4.8;

  const salon = {
    ...salonRaw,
    rating: avgRating,
    reviewsCount: reviews.length
  };

  return (
    <div className={styles.salonPage}>
      {/* Navbar */}
      <nav style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 100, 
        backgroundColor: 'var(--background)', 
        borderBottom: '1px solid var(--border)' 
      }}>
        <div className="container flex items-center justify-between" style={{ padding: '0.75rem 1.5rem' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Logo initialTitle="Berber.al" />
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/" className="text-muted" style={{ fontSize: '0.9rem' }}>← Faqja Kryesore</Link>
          </div>
        </div>
      </nav>
      
      {/* Premium Hero Slider */}
      <HeroSlider salon={salon} />

      <SalonClient 
        salon={salon} 
        services={salon.services} 
        barbers={salon.users} 
        currentUser={currentUser}
        reviews={reviews}
      />

      <Footer />
    </div>
  );
}
