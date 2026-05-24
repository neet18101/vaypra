import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getOrgId } from "@/utils/getOrgId";

export async function GET() {
  const supabase = await createClient();
  const { user, orgId } = await getOrgId();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .order("date", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request) {
  const supabase = await createClient();
  const { user, orgId } = await getOrgId();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { data, error } = await supabase
    .from("invoices")
    .insert({ ...body, organization_id: orgId })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
