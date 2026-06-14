import { NextResponse } from "next/server";

// EMAIL DISABLED — SMTP not configured yet.
// Uncomment the full implementation below when SMTP credentials are ready.

export async function POST(_req) {
  return NextResponse.json({ ok: false, message: "Email sending is currently disabled." }, { status: 503 });
}

// ── Full implementation (commented out) ──────────────────────────────────────
// import nodemailer from "nodemailer";
// import { createClient } from "@/utils/supabase/server";
//
// const SMTP_PORT = Number(process.env.SMTP_PORT) || 465;
// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: SMTP_PORT,
//   secure: SMTP_PORT === 465,
//   auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
//   connectionTimeout: 8_000,
//   greetingTimeout:   5_000,
//   socketTimeout:     10_000,
// });
//
// export async function POST(req) {
//   try {
//     const supabase = await createClient();
//     const { data: { user } } = await supabase.auth.getUser();
//     if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//
//     const { to, subject, html, installationId } = await req.json();
//     if (!to || !html) return NextResponse.json({ error: "Missing to or html" }, { status: 400 });
//
//     await transporter.sendMail({
//       from: process.env.SMTP_FROM || "support@rangayancreations.com",
//       to,
//       subject: subject || "Installation Report — Rangayan Creations",
//       html,
//     });
//
//     if (installationId) {
//       const now = new Date().toISOString();
//       const { data: inst } = await supabase.from("installations").select("custom_fields").eq("id", installationId).single();
//       const cf = inst?.custom_fields || {};
//       await supabase.from("installations").update({ custom_fields: { ...cf, report_emailed_at: now, report_emailed_to: to } }).eq("id", installationId);
//     }
//
//     return NextResponse.json({ ok: true });
//   } catch (err) {
//     console.error("Email send failed:", err.message);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }
