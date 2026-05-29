import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import ServicesList from "./ServicesList";

export default async function ServicesPage() {
  // Get current salon (mocking the first one for MVP)
  const cookieStore = await cookies();
  const salonId = cookieStore.get("currentSalonId")?.value;
  const salon = salonId ? await prisma.salon.findUnique({ where: { id: salonId } }) : null;
  
  if (!salon) {
    return <div>Salloni nuk u gjet. Ju lutem regjistroni një sallon së pari.</div>;
  }

  const services = await prisma.service.findMany({
    where: { salonId: salon.id },
    orderBy: { name: 'asc' }
  });

  return <ServicesList initialServices={services} salonId={salon.id} />;
}
