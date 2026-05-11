import { createClient } from "@/utils/supabase/server";
import InstallationsContent from "./InstallationsContent";

export default async function InstallationsPage() {
  let installations = [];
  let products = [];
  let branches = [];

  try {
    const supabase = await createClient();
    const [installationsRes, productsRes, branchesRes] = await Promise.all([
      supabase.from("installations").select("*, products(*)").order("installation_date", { ascending: false }),
      supabase.from("products").select("*").order("name"),
      supabase.from("branches").select("*").order("name"),
    ]);
    if (installationsRes.data) installations = installationsRes.data;
    if (productsRes.data) products = productsRes.data;
    if (branchesRes.data) branches = branchesRes.data;
  } catch (e) {}

  return <InstallationsContent installations={installations} products={products} branches={branches} />;
}
