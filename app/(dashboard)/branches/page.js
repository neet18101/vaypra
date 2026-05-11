import { createClient } from "@/utils/supabase/server";
import BranchesContent from "./BranchesContent";

export default async function BranchesPage() {
  let branches = [];

  try {
    const supabase = await createClient();
    const { data } = await supabase.from("branches").select("*");
    if (data) branches = data;
  } catch (e) {}

  return <BranchesContent branches={branches} />;
}
