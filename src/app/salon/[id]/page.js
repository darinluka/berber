import Link from "next/link";
import styles from "./salon.module.css";
import { ThemeToggle } from "../../components/ThemeToggle";
import { prisma } from "@/lib/prisma";
import SalonClient from "./SalonClient";
import { notFound } from "next/navigation";
import Logo from "../../components/Logo";
import Footer from "../../components/Footer";
import HeroSlider from "./HeroSlider";

export default async function SalonPage({ params }) {
  const { id } = await params;

  const salon = await prisma.salon.findUnique({
    where: { id },
    include: {
      services: true,
      users: {
        where: { role: "BARBER" }
      },
      inventory: true
    }
  });

  if (!salon) {
    notFound();
  }

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
            <Logo initialTitle="Berberi.al" />
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
      />

      <Footer />
    </div>
  );
}
