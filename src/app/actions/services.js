"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getServices(salonId) {
  try {
    return await prisma.service.findMany({
      where: { salonId },
      orderBy: { name: 'asc' }
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
}

export async function createService(salonId, data) {
  try {
    const service = await prisma.service.create({
      data: {
        ...data,
        salonId
      }
    });
    revalidatePath("/dashboard/services");
    revalidatePath(`/salon/${salonId}`);
    return { success: true, service };
  } catch (error) {
    console.error("Error creating service:", error);
    return { success: false, error: error.message };
  }
}

export async function updateService(id, data) {
  try {
    const service = await prisma.service.update({
      where: { id },
      data
    });
    revalidatePath("/dashboard/services");
    return { success: true, service };
  } catch (error) {
    console.error("Error updating service:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteService(id) {
  try {
    await prisma.service.delete({
      where: { id }
    });
    revalidatePath("/dashboard/services");
    return { success: true };
  } catch (error) {
    console.error("Error deleting service:", error);
    return { success: false, error: error.message };
  }
}
