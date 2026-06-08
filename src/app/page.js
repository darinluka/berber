import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import HomeClient from "./HomeClient";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
export default async function Home() {
  const salonsRaw = await prisma.salon.findMany({
    where: { isApproved: true },
    include: {
      reviews: true
    },
    orderBy: [
      { isFeatured: 'desc' },
      { name: 'asc' }
    ]
  });

  const salons = salonsRaw.map(salon => {
    const reviews = salon.reviews || [];
    const avgRating = reviews.length > 0
      ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
      : 4.8;
    return {
      ...salon,
      rating: avgRating,
      reviewsCount: reviews.length
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        <HomeClient initialSalons={salons} />
      </main>

      <Footer />
    </div>
  );
}
