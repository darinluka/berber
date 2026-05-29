"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getFinances(salonId) {
  try {
    const finances = await prisma.finance.findMany({
      where: {
        salonId: salonId
      },
      orderBy: {
        date: 'desc'
      }
    });

    return finances.map(f => ({
      id: f.id,
      date: f.date.toISOString().split('T')[0],
      description: f.description,
      category: f.type === "INCOME" ? "Shërbim" : "Furnizim",
      amount: f.type === "INCOME" ? `+${f.amount} L` : `-${f.amount} L`,
      rawAmount: f.amount,
      type: f.type
    }));
  } catch (error) {
    console.error("Error fetching finances:", error);
    return [];
  }
}

export async function addTransaction(data) {
  try {
    const transaction = await prisma.finance.create({
      data: {
        ...data,
        date: new Date()
      }
    });
    revalidatePath("/dashboard/finance");
    return { success: true, transaction };
  } catch (error) {
    console.error("Error adding transaction:", error);
    return { success: false, error: error.message };
  }
}
export async function deleteTransaction(id) {
  try {
    await prisma.finance.delete({
      where: { id }
    });
    revalidatePath("/dashboard/finance");
    return { success: true };
  } catch (error) {
    console.error("Error deleting transaction:", error);
    return { success: false, error: error.message };
  }
}
