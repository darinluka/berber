"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { sendBookingConfirmationEmail, sendBookingApplicationEmail, sendBookingRejectionEmail } from "@/lib/email";

export async function getBusySlots(salonId, date, barberId) {
  noStore();
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0,0,0,0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23,59,59,999);

    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      select: { closedDays: true, closedDates: true }
    });

    if (salon) {
      const dayOfWeek = startOfDay.getDay().toString();
      const closedDaysArray = salon.closedDays ? salon.closedDays.split(',') : [];
      const closedDatesArray = salon.closedDates ? salon.closedDates.split(',') : [];

      if (closedDaysArray.includes(dayOfWeek) || closedDatesArray.includes(date)) {
        return ["CLOSED"];
      }
    }

    const bookings = await prisma.booking.findMany({
      where: {
        salonId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        barberId,
        status: { in: ["APPROVED", "COMPLETED"] }
      },
      select: { date: true }
    });

    const result = bookings.map(b => {
      const d = new Date(b.date);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    });
    
    console.log(`[getBusySlots] date=${date} barberId=${barberId} -> busy:`, result);
    return result;
  } catch (error) {
    console.error("Error fetching busy slots:", error);
    return [];
  }
}

export async function createBooking(data) {
  try {
    // 1. Check or Create User (Client)
    let user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    let isExistingClient = false;
    if (user) {
      // Check if they have at least one approved or completed booking in the past
      const pastBookingsCount = await prisma.booking.count({
        where: {
          clientId: user.id,
          status: { in: ["APPROVED", "COMPLETED"] }
        }
      });
      isExistingClient = pastBookingsCount > 0;
    } else {
      user = await prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          phone: data.phone,
          password: "temporary_password", // In real app, send a reset link
          role: "CLIENT"
        }
      });
    }

    const status = isExistingClient ? "APPROVED" : "PENDING";

    // 2. Create Booking
    const booking = await prisma.booking.create({
      data: {
        date: new Date(`${data.date}T${data.time}:00`),
        salonId: data.salonId,
        serviceId: data.serviceId,
        barberId: data.barberId,
        clientId: user.id,
        status,
        notes: data.notes || ""
      }
    });

    try {
      const bookingWithDetails = await prisma.booking.findUnique({
        where: { id: booking.id },
        include: {
          client: true,
          service: true,
          barber: true,
          salon: true
        }
      });
      if (bookingWithDetails) {
        if (status === "APPROVED") {
          sendBookingConfirmationEmail(bookingWithDetails).catch(err => {
            console.error("Failed to send auto-approval booking confirmation email:", err);
          });
        } else {
          sendBookingApplicationEmail(bookingWithDetails).catch(err => {
            console.error("Failed to send booking application pending email:", err);
          });
        }
      }
    } catch (emailErr) {
      console.error("Error in email sending flow:", emailErr);
    }

    revalidatePath(`/salon/${data.salonId}`);
    revalidatePath("/dashboard", "layout");
    return { success: true, booking, isApprovedImmediately: status === "APPROVED" };
  } catch (error) {
    console.error("Error creating booking:", error);
    return { success: false, error: error.message };
  }
}
export async function getBookings(salonId) {
  try {
    return await prisma.booking.findMany({
      where: { salonId },
      include: {
        client: true,
        service: true,
        barber: true
      },
      orderBy: { date: 'desc' }
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }
}

export async function updateBookingStatus(id, status, reason = "") {
  try {
    const booking = await prisma.booking.update({
      where: { id },
      data: { status }
    });

    if (status === "APPROVED" || status === "CANCELLED") {
      try {
        const bookingWithDetails = await prisma.booking.findUnique({
          where: { id },
          include: {
            client: true,
            service: true,
            barber: true,
            salon: true
          }
        });
        if (bookingWithDetails) {
          if (status === "APPROVED") {
            sendBookingConfirmationEmail(bookingWithDetails).catch(err => {
              console.error("Failed to send booking confirmation email:", err);
            });
          } else if (status === "CANCELLED") {
            sendBookingRejectionEmail(bookingWithDetails, reason).catch(err => {
              console.error("Failed to send booking cancellation email:", err);
            });
          }
        }
      } catch (emailErr) {
        console.error("Error in email sending flow:", emailErr);
      }
    }

    revalidatePath("/dashboard", "layout");
    return { success: true, booking };
  } catch (error) {
    console.error("Error updating booking status:", error);
    return { success: false, error: error.message };
  }
}
