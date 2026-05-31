import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const role = cookieStore.get("currentUserRole")?.value;

  if (role !== "ADMIN") {
    redirect("/login");
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
