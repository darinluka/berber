"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updatePassword(email, newPassword) {
  try {
    // In a real app, we would hash the password here
    // For this MVP/Demo, we store it as is (per user's current setup)
    await prisma.user.update({
      where: { email },
      data: { password: newPassword }
    });
    
    return { success: true };
  } catch (error) {
    console.error("Password update error:", error);
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
