"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/app/actions/auth";

export async function updatePassword(email, newPassword) {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });
    
    return { success: true };
  } catch (error) {
    console.error("Password update error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateUserAvatar(email, imageBase64) {
  try {
    await prisma.user.update({
      where: { email },
      data: { image: imageBase64 }
    });
    return { success: true };
  } catch (error) {
    console.error("Avatar update error:", error);
    return { success: false, error: error.message };
  }
}

export async function getUserByEmail(email) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });
    return { success: true, user };
  } catch (error) {
    console.error("Fetch user error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateUserByAdmin(id, data) {
  try {
    const updateData = {
      name: data.name,
      email: data.email,
      role: data.role,
    };

    // Only update password if a new one was provided
    if (data.password && data.password.trim().length > 0) {
      updateData.password = data.password.trim();
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
      }
    });

    revalidatePath("/admin/users");
    return { success: true, user };
  } catch (error) {
    console.error("Admin user update error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteUserByAdmin(id) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return { success: false, error: "Ju nuk jeni i autorizuar për të kryer këtë veprim." };
    }

    if (currentUser.id === id) {
      return { success: false, error: "Ju nuk mund të fshini veten tuaj." };
    }

    // Fshi rezervimet (Booking) e lidhura me përdoruesin fillimisht për të shmangur foreign key error
    await prisma.$transaction([
      prisma.booking.deleteMany({
        where: {
          OR: [
            { clientId: id },
            { barberId: id }
          ]
        }
      }),
      prisma.user.delete({
        where: { id }
      })
    ]);

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Admin user delete error:", error);
    return { success: false, error: error.message };
  }
}
