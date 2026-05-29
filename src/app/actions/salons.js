"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { sendSalonApprovalEmail } from "@/lib/email";
 
export async function getSalon() {
  try {
    const cookieStore = await cookies();
    const salonId = cookieStore.get("currentSalonId")?.value;
    
    const salon = salonId
      ? await prisma.salon.findUnique({ where: { id: salonId } })
      : await prisma.salon.findFirst();

    return { success: true, salon };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function createSalon(data) {
  try {
    // Check for existing salon by name and address
    const existing = await prisma.salon.findFirst({
      where: {
        name: data.name,
        address: data.address
      }
    });

    if (existing) {
      return { success: false, error: "Një sallon me këtë emër dhe adresë është i regjistruar tashmë." };
    }

    const salon = await prisma.salon.create({
      data: {
        name: data.name,
        address: data.address,
        hours: data.hours || "09:00 - 21:00",
        logo: data.logo || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop",
        lat: data.lat || 41.3275,
        lng: data.lng || 19.8189,
      }
    });

    // Set cookie so dashboard knows which salon is active
    const cookieStore = await cookies();
    cookieStore.set("currentSalonId", salon.id, { path: "/", maxAge: 60 * 60 * 24 * 365 });

    revalidatePath("/admin/salons");
    revalidatePath("/");
    return { success: true, salon };
  } catch (error) {
    console.error("Error creating salon:", error);
    return { success: false, error: error.message };
  }
}

export async function updateSalon(id, data) {
  try {
    const salon = await prisma.salon.update({
      where: { id },
      data: {
        name: data.name,
        address: data.address,
        hours: data.hours,
        logo: data.logo ?? null,
        coverImage: data.coverImage ?? null,
        lat: data.lat,
        lng: data.lng,
        heroImage1: data.heroImage1,
        heroImage2: data.heroImage2,
        heroImage3: data.heroImage3,
        whatsapp: data.whatsapp ?? null,
        closedDays: data.closedDays ?? null,
        closedDates: data.closedDates ?? null,
        instagram: data.instagram ?? null,
        facebook: data.facebook ?? null,
        tiktok: data.tiktok ?? null,
        youtube: data.youtube ?? null,
        twitter: data.twitter ?? null,
      }
    });
    revalidatePath("/admin/salons");
    revalidatePath(`/salon/${id}`);
    revalidatePath("/");
    return { success: true, salon };
  } catch (error) {
    console.error("Error updating salon:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteSalon(id) {
  try {
    await prisma.salon.delete({
      where: { id }
    });
    revalidatePath("/admin/salons");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error deleting salon:", error);
    return { success: false, error: error.message };
  }
}

export async function approveSalon(id, isApproved) {
  try {
    const salon = await prisma.salon.update({
      where: { id },
      data: { isApproved }
    });

    if (isApproved) {
      // Gjej pronarin e sallonit të lidhur me këtë ID
      const owner = await prisma.user.findFirst({
        where: {
          salonId: id,
          role: "SALON_OWNER"
        }
      });
      if (owner && owner.email) {
        await sendSalonApprovalEmail(owner.email, salon.name);
      }
    }

    revalidatePath("/admin/salons");
    revalidatePath("/");
    return { success: true, salon };
  } catch (error) {
    console.error("Error approving salon:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleFeaturedSalon(id, isFeatured) {
  try {
    const salon = await prisma.salon.update({
      where: { id },
      data: { isFeatured }
    });
    revalidatePath("/admin/salons");
    revalidatePath("/");
    return { success: true, salon };
  } catch (error) {
    console.error("Error featuring salon:", error);
    return { success: false, error: error.message };
  }
}
