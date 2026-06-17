import { createClient } from "@/utils/supabase/server";
import InstallationsContent from "./InstallationsContent";

export default async function InstallationsPage() {
  let installations = [];
  let products = [];
  let branches = [];

  try {
    const supabase = await createClient();
    const [installationsRes, productsRes, branchesRes] = await Promise.all([
      supabase.from("installations").select("*, products(*)").order("installation_date", { ascending: false }).limit(200),
      supabase.from("products").select("id,name,category,brand,serial_number,status,custom_fields").order("name"),
      supabase.from("branches").select("id,name,address").order("name"),
    ]);
    // Surface per-query failures instead of silently rendering a blank page —
    // a transient RLS/session error here was showing as "data sometimes
    // disappears" with no clue why.
    if (installationsRes.error) console.error("[installations] load failed:", installationsRes.error.message);
    if (productsRes.error) console.error("[installations] products load failed:", productsRes.error.message);
    if (branchesRes.error) console.error("[installations] branches load failed:", branchesRes.error.message);

    if (installationsRes.data) installations = installationsRes.data;
    if (productsRes.data) products = productsRes.data;
    if (branchesRes.data) branches = branchesRes.data;
  } catch (e) {
    console.error("[installations] page data load threw:", e);
  }

  return <InstallationsContent installations={installations} products={products} branches={branches} />;
}
