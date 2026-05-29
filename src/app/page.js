import { prisma } from "@/lib/prisma";
import HomeClient from "./HomeClient";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default async function Home() {
  const [salons] = await Promise.all([
    prisma.salon.findMany({
      where: { isApproved: true },
      orderBy: [
        { isFeatured: 'desc' },
        { name: 'asc' }
      ]
    }),
  ]);

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
