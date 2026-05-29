import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getBookings } from "@/app/actions/bookings";
import CalendarView from "./CalendarView";

export default async function CalendarPage() {
  const cookieStore = await cookies();
  const salonId = cookieStore.get("currentSalonId")?.value;
  const salon = salonId ? await prisma.salon.findUnique({ where: { id: salonId } }) : null;
  
  if (!salon) {
    return <div>Salloni nuk u gjet. Ju lutem regjistroni një sallon së pari.</div>;
  }

  const bookings = await getBookings(salon.id);
  const services = await prisma.service.findMany({
    where: { salonId: salon.id },
    orderBy: { name: 'asc' }
  });
  const staff = await prisma.user.findMany({
    where: { salonId: salon.id, role: "BARBER" },
    orderBy: { name: 'asc' }
  });

  return (
    <CalendarView 
      initialBookings={bookings} 
      services={services} 
      staff={staff} 
      salonId={salon.id} 
    />
  );
}
