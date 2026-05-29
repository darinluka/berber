import { cookies } from "next/headers";
import { getStaff } from "@/app/actions/staff";
import { prisma } from "@/lib/prisma";

export const dynamic = " force-dynamic;
import StaffList from "./StaffList";

export default async function StaffPage() {
  const cookieStore = await cookies();
  const salonId = cookieStore.get("currentSalonId")?.value;
  const salon = salonId ? await prisma.salon.findUnique({ where: { id: salonId } }) : null;
  const staff = salon ? await getStaff(salon.id) : [];

  return <StaffList initialStaff={staff} salonId={salon?.id} />;
}
