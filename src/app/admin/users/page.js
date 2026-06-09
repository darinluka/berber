import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/app/actions/auth";

export const dynamic = "force-dynamic";
import UsersList from "./UsersList";

export default async function AdminUsers() {
  const currentUser = await getCurrentUser();
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

  return <UsersList initialUsers={users} currentUserId={currentUser?.id} />;
}
