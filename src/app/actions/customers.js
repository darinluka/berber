"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { cookies } from "next/headers";

export async function getCustomers() {
  try {
    const cookieStore = await cookies();
    const salonId = cookieStore.get("currentSalonId")?.value;

    if (!salonId) return [];

    const users = await prisma.user.findMany({
      where: { role: "CLIENT", salonId },
      orderBy: { createdAt: 'desc' }
    });
    
    // Transform to match UI needs
    return users.map(u => ({
      id: u.id,
      name: u.name,
      phone: u.phone || "Pa telefon",
      email: u.email,
      visits: 0, // In real app, count bookings
      spent: "0 L",
      lastVisit: "Nuk ka"
    }));
  } catch (error) {
    console.error("Error fetching customers:", error);
    return [];
  }
}

export async function createCustomer(data) {
  try {
    const cookieStore = await cookies();
    const salonId = cookieStore.get("currentSalonId")?.value;
    
    if (!salonId) {
      return { success: false, error: "Nuk jeni identifikuar në një sallon." };
    }

    // Check if customer exists by email or phone
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { phone: data.phone }
        ]
      }
    });

    if (existing) {
      return { success: false, error: "Një klient me këtë email ose telefon ekziston tashmë." };
    }

    const user = await prisma.user.create({
      data: {
        ...data,
        salonId,
        role: "CLIENT",
        password: "temporary_password"
      }
    });
    revalidatePath("/dashboard/crm");
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function updateCustomer(id, data) {
  try {
    const user = await prisma.user.update({
      where: { id },
      data
    });
    revalidatePath("/dashboard/crm");
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function deleteCustomer(id) {
  try {
    await prisma.user.delete({ where: { id } });
    revalidatePath("/dashboard/crm");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
