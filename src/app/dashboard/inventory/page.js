import { cookies } from "next/headers";
import { getInventory } from "@/app/actions/inventory";
import { prisma } from "@/lib/prisma";
import InventoryList from "./InventoryList";

export default async function InventoryPage() {
  const cookieStore = await cookies();
  const salonId = cookieStore.get("currentSalonId")?.value;
  const salon = salonId ? await prisma.salon.findUnique({ where: { id: salonId } }) : null;
  const inventory = salon ? await getInventory(salon.id) : [];

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 style={{ fontSize: '2rem' }}>Inventari i Produkteve</h1>
          <p className="text-muted">Menaxhoni stokun dhe furnizimet e sallonit.</p>
        </div>
        <button className="btn btn-primary">+ Shto Produkt të Ri</button>
      </div>

      <InventoryList initialInventory={inventory} />
    </div>
  );
}
