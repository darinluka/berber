import { cookies } from "next/headers";
import { getFinances } from "@/app/actions/finance";
import { prisma } from "@/lib/prisma";

export const dynamic = " force-dynamic;
import FinanceList from "./FinanceList";

export default async function FinancePage() {
  const cookieStore = await cookies();
  const salonId = cookieStore.get("currentSalonId")?.value;
  const salon = salonId ? await prisma.salon.findUnique({ where: { id: salonId } }) : null;
  const finances = salon ? await getFinances(salon.id) : [];

  return (
    <div className="fade-in">
      <FinanceList initialFinances={finances} salonId={salon?.id} />
    </div>
  );
}
