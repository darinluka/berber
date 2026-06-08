"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function getDashboardReviews() {
  try {
    const cookieStore = await cookies();
    let salonId = cookieStore.get("currentSalonId")?.value;
    
    if (!salonId) {
      const firstSalon = await prisma.salon.findFirst();
      salonId = firstSalon?.id;
    }
    
    if (!salonId) {
      return { success: true, reviews: [] };
    }

    const reviews = await prisma.review.findMany({
      where: { salonId },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, reviews };
  } catch (error) {
    console.error("Error fetching dashboard reviews:", error);
    return { success: false, error: error.message };
  }
}

export async function createReview(data) {
  try {
    const { rating, comment, clientName, clientId, salonId } = data;

    if (!rating || rating < 1 || rating > 5) {
      return { success: false, error: "Vlerësimi duhet të jetë midis 1 dhe 5 yjeve." };
    }

    if (!clientName || clientName.trim().length === 0) {
      return { success: false, error: "Ju lutem shkruani emrin dhe mbiemrin tuaj." };
    }

    if (!salonId) {
      return { success: false, error: "ID e sallonit mungon." };
    }

    const review = await prisma.review.create({
      data: {
        rating: parseInt(rating, 10),
        comment: comment ? comment.trim() : null,
        clientName: clientName.trim(),
        clientId: clientId || null,
        salonId,
      },
    });

    // Revalidate relevant pages
    revalidatePath("/");
    revalidatePath(`/salon/${salonId}`);
    revalidatePath("/dashboard/reviews");

    return { success: true, review };
  } catch (error) {
    console.error("Error creating review:", error);
    return { success: false, error: error.message };
  }
}

export async function getSalonReviews(salonId) {
  try {
    const reviews = await prisma.review.findMany({
      where: { salonId },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, reviews };
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return { success: false, error: error.message };
  }
}
