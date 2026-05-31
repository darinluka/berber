"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

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
      role: "Barber", // We could add a more specific role field to User model if needed later
      email: s.email,
      phone: s.phone || "I panjohur",
      bookings: s.barberBookings.length,
      rating: 4.8, // Mock for now
      status: "Aktiv",
      image: s.image || "https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=200",
      salary: "60,000 L"
    }));
  } catch (error) {
    console.error("Error fetching staff:", error);
    return [];
  }
}

export async function createStaff(data, salonId) {
  try {
    const email = data.email || `barber_${Math.random().toString(36).substring(2, 8)}@berber.al`;
    
    // Default dummy password for staff created without one
    const hashedPassword = await bcrypt.hash("barber1234", 10);
    
    const newStaff = await prisma.user.create({
      data: {
        name: data.name,
        email: email,
        password: hashedPassword,
        role: "BARBER",
        salonId: salonId,
        image: data.image || null,
        // Optional custom role string if we add it to the schema, for now just saved in DB as BARBER
      }
    });

    revalidatePath("/dashboard/staff");
    return { success: true, staff: newStaff };
  } catch (error) {
    console.error("Error creating staff:", error);
    return { success: false, error: "Nuk mund të krijohet stafi. (Sigurohuni që emaili nuk ekziston tashmë)" };
  }
}

export async function updateStaff(id, data, salonId) {
  try {
    const updated = await prisma.user.updateMany({
      where: { id: id, salonId: salonId }, // ensure the salon owns this staff
      data: {
        name: data.name,
        image: data.image || null,
      }
    });

    revalidatePath("/dashboard/staff");
    return { success: updated.count > 0 };
  } catch (error) {
    console.error("Error updating staff:", error);
    return { success: false, error: "Nuk u arrit përditësimi i stafit." };
  }
}
