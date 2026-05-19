import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import InstallationReportView from "./InstallationReportView";

export default async function InstallationReportPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: installation }, { data: branches }] = await Promise.all([
    supabase.from("installations").select("*, products(*)").eq("id", id).single(),
    supabase.from("branches").select("id, name"),
  ]);

  if (!installation) notFound();

  // If nested join returned null (RLS or FK issue), fetch product separately
  if (!installation.products && installation.product_id) {
    const { data: product } = await supabase
      .from("products")
      .select("*")
      .eq("id", installation.product_id)
      .single();
    if (product) installation.products = product;
  }

  const branchName =
    (branches || []).find((b) => b.id === installation.branch_id)?.name || "";

  return (
    <InstallationReportView installation={installation} branchName={branchName} />
  );
}
