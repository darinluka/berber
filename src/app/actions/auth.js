"use server";

import { prisma } from "@/lib/prisma";
import { sendOtpEmail, sendSalonRegistrationEmail } from "@/lib/email";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerificationCode(email) {
  try {
    if (!email || !email.includes("@")) {
      return { success: false, error: "Email i pavlefshëm." };
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: "Ky email është regjistruar tashmë. Ju lutem identifikohuni." };
    }

    await prisma.verificationToken.updateMany({
      where: { email, used: false },
      data: { used: true },
    });

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.verificationToken.create({
      data: { email, code, expiresAt },
    });

    await sendOtpEmail(email, code);

    return { success: true };
  } catch (error) {
    console.error("[AUTH] sendVerificationCode error:", error);
    return { success: false, error: "Gabim gjatë dërgimit të kodit. Provo sërish." };
  }
}

export async function verifyOtpCode(email, code) {
  try {
    const token = await prisma.verificationToken.findFirst({
      where: {
        email,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!token) {
      return { success: false, error: "Kodi është i pasaktë ose ka skaduar." };
    }

    await prisma.verificationToken.update({
      where: { id: token.id },
      data: { used: true },
    });

    return { success: true };
  } catch (error) {
    console.error("[AUTH] verifyOtpCode error:", error);
    return { success: false, error: "Gabim gjatë verifikimit. Provo sërish." };
  }
}

export async function registerSalonOwner(data) {
  try {
    const { email, name, salonName, address, password, phone } = data;

    if (!email || !salonName) {
      return { success: false, error: "Të dhënat janë të pakompletuara." };
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: "Ky email është regjistruar tashmë. Ju lutem identifikohuni ose përdorni një email tjetër." };
    }

    const existingSalon = await prisma.salon.findFirst({
      where: { name: salonName, address },
    });
    if (existingSalon) {
      return { success: false, error: "Ky sallon është i regjistruar tashmë." };
    }

    const salon = await prisma.salon.create({
      data: {
        name: salonName,
        address: address || "",
        hours: "09:00 - 21:00",
        logo: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop",
        lat: 41.3275,
        lng: 19.8189,
      },
    });

    // Hash fjalëkalimin
    const hashedPassword = password
      ? await bcrypt.hash(password, 12)
      : await bcrypt.hash(Math.random().toString(36).slice(-12), 12);

    const user = await prisma.user.create({
      data: {
        email,
        name: name || salonName,
        password: hashedPassword,
        role: "SALON_OWNER",
        salonId: salon.id,
        phone: phone || null,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set("currentSalonId", salon.id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    cookieStore.set("currentUserId", user.id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    cookieStore.set("currentUserRole", user.role, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    // Dërgo email-in e regjistrimit të sallonit (aplikimit në pritje)
    try {
      await sendSalonRegistrationEmail(email, name || salonName, salonName);
    } catch (mailErr) {
      console.error("[AUTH] Failed to send registration email:", mailErr);
    }

    return { success: true, salonId: salon.id };
  } catch (error) {
    console.error("[AUTH] registerSalonOwner error:", error);
    return { success: false, error: error.message };
  }
}

export async function loginUser(email, password) {
  try {
    if (!email || !password) {
      return { success: false, error: "Ju lutem plotësoni të gjitha fushat." };
    }

    // Hardcoded admin login
    if (email === "admin@berber.al" && password === "admin") {
      const cookieStore = await cookies();
      cookieStore.set("currentUserRole", "ADMIN", { path: "/", maxAge: 60 * 60 * 24 * 7 });
      return { success: true, role: "ADMIN", redirectTo: "/admin" };
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { success: false, error: "Email-i ose fjalëkalimi është i pasaktë." };
    }

    // Nëse useri ka vetëm Google login, nuk ka fjalëkalim
    if (!user.password) {
      return { success: false, error: "Ky llogari është i lidhur me Google. Ju lutem hyni me Google." };
    }

    // Krahaso me bcrypt (suporton edhe plaintext fjalëkalimet e vjetra)
    let passwordMatch = false;
    if (user.password.startsWith("$2")) {
      // bcrypt hash
      passwordMatch = await bcrypt.compare(password, user.password);
    } else {
      // plaintext i vjetër — krahasoj direkt dhe hash-oj për herën tjetër
      passwordMatch = user.password === password;
      if (passwordMatch) {
        // Migrate në bcrypt
        const newHash = await bcrypt.hash(password, 12);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: newHash },
        });
      }
    }

    if (!passwordMatch) {
      return { success: false, error: "Email-i ose fjalëkalimi është i pasaktë." };
    }

    const cookieStore = await cookies();
    cookieStore.set("currentUserId", user.id, { path: "/", maxAge: 60 * 60 * 24 * 7 });
    cookieStore.set("currentUserRole", user.role, { path: "/", maxAge: 60 * 60 * 24 * 7 });
    cookieStore.set("currentUserName", user.name, { path: "/", maxAge: 60 * 60 * 24 * 7 });
    cookieStore.set("currentUserImage", user.image || "", { path: "/", maxAge: 60 * 60 * 24 * 7 });

    if (user.role === "SALON_OWNER" && user.salonId) {
      cookieStore.set("currentSalonId", user.salonId, { path: "/", maxAge: 60 * 60 * 24 * 7 });

      const salon = await prisma.salon.findUnique({ where: { id: user.salonId } });
      return {
        success: true,
        role: user.role,
        redirectTo: "/dashboard",
        salonApproved: salon?.isApproved ?? false,
        salonName: salon?.name ?? "",
      };
    }

    if (user.role === "ADMIN") {
      return { success: true, role: user.role, redirectTo: "/admin" };
    }

    return { success: true, role: user.role, redirectTo: "/" };
  } catch (error) {
    console.error("[AUTH] loginUser error:", error);
    return { success: false, error: "Gabim gjatë identifikimit. Provo sërish." };
  }
}

// Google OAuth — krijon ose gjen userin
export async function loginOrRegisterWithGoogle({ googleId, email, name, image, role, salonName }) {
  try {
    // Kërko sipas googleId ose email
    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] },
    });

    if (user) {
      // Update googleId dhe image nëse mungojnë
      if (!user.googleId || !user.image) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            googleId: user.googleId || googleId,
            image: user.image || image,
          },
        });
      }
    } else {
      // Krijoni user të ri
      const userRole = role || "CLIENT";
      let salonId = null;

      if (userRole === "SALON_OWNER" && salonName) {
        const salon = await prisma.salon.create({
          data: {
            name: salonName,
            address: "",
            hours: "09:00 - 21:00",
            logo: image || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop",
            lat: 41.3275,
            lng: 19.8189,
          },
        });
        salonId = salon.id;
      }

      user = await prisma.user.create({
        data: {
          email,
          name,
          googleId,
          image,
          password: null,
          role: userRole,
          salonId,
        },
      });
    }

    // Vendos cookies
    const cookieStore = await cookies();
    cookieStore.set("currentUserId", user.id, { path: "/", maxAge: 60 * 60 * 24 * 7 });
    cookieStore.set("currentUserRole", user.role, { path: "/", maxAge: 60 * 60 * 24 * 7 });
    cookieStore.set("currentUserName", user.name, { path: "/", maxAge: 60 * 60 * 24 * 7 });
    cookieStore.set("currentUserImage", user.image || "", { path: "/", maxAge: 60 * 60 * 24 * 7 });

    if (user.role === "SALON_OWNER" && user.salonId) {
      cookieStore.set("currentSalonId", user.salonId, { path: "/", maxAge: 60 * 60 * 24 * 7 });
      const salon = await prisma.salon.findUnique({ where: { id: user.salonId } });
      return {
        success: true,
        role: user.role,
        redirectTo: "/dashboard",
        salonApproved: salon?.isApproved ?? false,
        salonName: salon?.name ?? "",
        isNew: !user.googleId,
      };
    }

    if (user.role === "ADMIN") {
      return { success: true, role: user.role, redirectTo: "/admin" };
    }

    return { success: true, role: user.role, redirectTo: "/", isNew: false };
  } catch (error) {
    console.error("[AUTH] loginOrRegisterWithGoogle error:", error);
    return { success: false, error: error.message };
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("currentUserId")?.value;
    if (!userId) return null;
    return await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, image: true, salonId: true },
    });
  } catch {
    return null;
  }
}

export async function logoutUser() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("currentUserId");
    cookieStore.delete("currentUserRole");
    cookieStore.delete("currentSalonId");
    cookieStore.delete("currentUserName");
    cookieStore.delete("currentUserImage");
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}
