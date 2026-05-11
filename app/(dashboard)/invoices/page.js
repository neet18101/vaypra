import { createClient } from "@/utils/supabase/server";
import InvoicesContent from "./InvoicesContent";

export default async function InvoicesPage() {
  let invoices = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("invoices")
      .select("*")
      .order("date", { ascending: false });
    if (data) invoices = data;
  } catch (e) {}

  return <InvoicesContent invoices={invoices} />;
}
