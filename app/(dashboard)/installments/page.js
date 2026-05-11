import { createClient } from "@/utils/supabase/server";
import InstallmentsContent from "./InstallmentsContent";

export default async function InstallmentsPage() {
  let installments = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("installments")
      .select("*")
      .order("next_due_date");
    if (data) installments = data;
  } catch (e) {}

  return <InstallmentsContent installments={installments} />;
}
