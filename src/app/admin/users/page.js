import { prisma } from "@/lib/prisma";

export const dynamic = " force-dynamic;
import UsersList from "./UsersList";

export default async function AdminUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    }
  });

  return <UsersList initialUsers={users} />;
}
