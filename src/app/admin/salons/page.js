import { prisma } from "@/lib/prisma";
import SalonsList from "./SalonsList";

export const dynamic = "force-dynamic";

export default async function AdminSalons() {
  const salons = await prisma.salon.findMany({
    include: {
      _count: {
        select: { users: true, bookings: true }
      }
    }
  });

  return <SalonsList initialSalons={salons} />;
}
