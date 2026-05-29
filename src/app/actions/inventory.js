"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getInventory(salonId) {
  try {
    const inventory = await prisma.inventory.findMany({
      where: {
        salonId: salonId
      }
    });

    return inventory.map(i => ({
      id: i.id,
      name: i.name,
      category: "Produkt",
      stock: i.stock,
      minStock: i.alertLimit,
      price: "1,200 L", // We could add price to Inventory model
      status: i.stock <= i.alertLimit ? "Low Stock" : "In Stock"
    }));
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return [];
  }
}

export async function updateStock(id, newStock) {
  try {
    const item = await prisma.inventory.update({
      where: { id },
      data: { stock: newStock }
    });
    revalidatePath("/dashboard/inventory");
    return { success: true, item };
  } catch (error) {
    console.error("Error updating stock:", error);
    return { success: false, error: error.message };
  }
}
