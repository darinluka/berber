"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getGlobalSettings() {
  try {
    // Sigurohemi që prisma nuk është undefined
    if (!prisma) {
      console.error("Prisma is not initialized in settings action");
      return null;
    }

    let settings = await prisma.globalSettings.findUnique({
      where: { id: "global" }
    });
    
    if (!settings) {
      settings = await prisma.globalSettings.create({
        data: { id: "global" }
      });
    }
    return settings;
  } catch (error) {
    console.error("Error fetching settings:", error);
    return null;
  }
}

export async function updateGlobalSettings(data) {
  try {
    // Sanitize data to remove id and updatedAt before upsert
    const { id, updatedAt, ...cleanData } = data;
    
    await prisma.globalSettings.upsert({
      where: { id: "global" },
      update: cleanData,
      create: { id: "global", ...cleanData }
    });
    revalidatePath("/");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating settings:", error);
    return { success: false, error: error.message };
  }
}
