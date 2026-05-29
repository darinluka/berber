import { getCustomers } from "@/app/actions/customers";
import CRMList from "./CRMList";

export default async function CRMPage() {
  const customers = await getCustomers();

  return <CRMList initialCustomers={customers} />;
}
