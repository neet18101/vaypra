// DISABLED — Dispatch feature removed
// import { createClient } from "@/utils/supabase/server";
// import DispatchesContent from "./DispatchesContent";
//
// export default async function DispatchesPage() {
//   let dispatches = [];
//   let branches = [];
//   let products = [];
//
//   try {
//     const supabase = await createClient();
//     const [dispatchesRes, branchesRes, productsRes] = await Promise.all([
//       supabase.from("dispatches").select("*, dispatch_items(*, products(*))").order("dispatch_date", { ascending: false }),
//       supabase.from("branches").select("*").order("name"),
//       supabase.from("products").select("*").order("name"),
//     ]);
//     if (dispatchesRes.data) dispatches = dispatchesRes.data;
//     if (branchesRes.data) branches = branchesRes.data;
//     if (productsRes.data) products = productsRes.data;
//   } catch (e) {}
//
//   return <DispatchesContent dispatches={dispatches} branches={branches} products={products} />;
// }

export default function DispatchesPage() {
  return null;
}
