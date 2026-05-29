import { PrismaClient } from "../generated/client";

// Detyrojmë Next.js të rifreskojë lidhjen duke ndryshuar emrin e singleton
const createNewPrismaClient = () => {
  console.log("🔄 Duke krijuar lidhjen e re me Prisma (Custom Path)...");
  return new PrismaClient({
    log: ["query", "error", "warn"],
  });
};

const globalForDb = global;

export const prisma = globalForDb.prismaInstance || createNewPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForDb.prismaInstance = prisma;
}
