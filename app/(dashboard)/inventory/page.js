import { createClient } from "@/utils/supabase/server";
import InventoryContent from "./InventoryContent";

export default async function InventoryPage() {
  let products = [];
  let categories = [];
  let branches = [];

  try {
    const supabase = await createClient();
    const [productsRes, categoriesRes, branchesRes] = await Promise.all([
      supabase.from("products").select("*").order("name", { ascending: true }),
      supabase.from("categories").select("*").order("name"),
      supabase.from("branches").select("*").order("name"),
    ]);
    if (productsRes.data) products = productsRes.data;
    if (categoriesRes.data) categories = categoriesRes.data;
    if (branchesRes.data) branches = branchesRes.data;
  } catch (e) {}

  return <InventoryContent products={products} categories={categories} branches={branches} />;
}
