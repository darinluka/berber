"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getStaff(salonId) {
  try {
    const staff = await prisma.user.findMany({
      where: {
        role: "BARBER",
        salonId: salonId
      },
      include: {
        barberBookings: true
      }
    });

    return staff.map(s => ({
      id: s.id,
      name: s.name,
      role: "Barber", // We could add a more specific role field to User model
      email: s.email,
      phone: s.phone || "I panjohur",
      bookings: s.barberBookings.length,
      rating: 4.8, // Mock for now
      status: "Aktiv",
      image: "https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=200",
      salary: "60,000 L"
    }));
  } catch (error) {
    console.error("Error fetching staff:", error);
    return [];
  }
}
