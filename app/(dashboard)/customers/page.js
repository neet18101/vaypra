import { createClient } from "@/utils/supabase/server";
import CustomersContent from "./CustomersContent";

export default async function CustomersPage() {
  let customers = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("customers")
      .select("*")
      .order("name");
    if (data) customers = data;
  } catch (e) {}

  return <CustomersContent customers={customers} />;
}
