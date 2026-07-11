import { createClient } from "@/utils/supabase/server";
import InventoryContent from "./InventoryContent";

export default async function InventoryPage() {
  let products = [];
  let categories = [];
  let branches = [];
  let installedProductIds = new Set();

  try {
    const supabase = await createClient();
    const [productsRes, categoriesRes, branchesRes, installationsRes] = await Promise.all([
      supabase.from("products").select("*").order("name", { ascending: true }),
      supabase.from("categories").select("*").order("name"),
      supabase.from("branches").select("*").order("name"),
      supabase.from("installations").select("product_id"),
    ]);
    if (productsRes.data) products = productsRes.data;
    if (categoriesRes.data) categories = categoriesRes.data;
    if (branchesRes.error) console.error("[inventory] branches load failed:", branchesRes.error.message);
    if (branchesRes.data) branches = branchesRes.data;
    if (installationsRes.data) installedProductIds = new Set(installationsRes.data.map(r => r.product_id));
  } catch (e) { console.error("[inventory] page load threw:", e); }

  return <InventoryContent products={products} categories={categories} branches={branches} installedProductIds={[...installedProductIds]} />;
}
