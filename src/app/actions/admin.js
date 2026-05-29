"use server";

import { prisma } from "@/lib/prisma";

export async function getGlobalReportData(startDate, endDate) {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const [salons, users, bookings, finances] = await Promise.all([
      prisma.salon.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { id: true, name: true, createdAt: true, address: true }
      }),
      prisma.user.findMany({
        where: { createdAt: { gte: start, lte: end } },
        select: { id: true, name: true, email: true, role: true, createdAt: true }
      }),
      prisma.booking.findMany({
        where: { date: { gte: start, lte: end } },
        include: {
          salon: { select: { name: true } },
          service: { select: { name: true, price: true } }
        }
      }),
      prisma.finance.findMany({
        where: { date: { gte: start, lte: end } },
        include: {
          salon: { select: { name: true } }
        }
      })
    ]);

    return { success: true, data: { salons, users, bookings, finances } };
  } catch (error) {
    console.error("Global report error:", error);
    return { success: false, error: error.message };
  }
}
