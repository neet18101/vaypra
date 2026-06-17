import { createClient } from "@/utils/supabase/server";
import DashboardContent from "./DashboardContent";

export default async function DashboardPage() {
  let stats = { totalRevenue: "₹0", totalOrders: "0", productsSold: "0", activeCustomers: "0" };
  let recentTransactions = [];
  let lifecycleCounts = { "in-stock": 0, dispatched: 0, delivered: 0, installed: 0 };

  try {
    const supabase = await createClient();
    const [invoicesRes, productsRes, customersRes] = await Promise.all([
      // Only the columns the dashboard actually uses — not select("*") on every row.
      supabase.from("invoices").select("invoice_number,customer_name,amount,type,status,date").order("date", { ascending: false }),
      supabase.from("products").select("status"),
      // Customers: we only need the count, so don't transfer any rows.
      supabase.from("customers").select("id", { count: "exact", head: true }),
    ]);

    // Surface failures instead of silently rendering an empty dashboard.
    if (invoicesRes.error) console.error("[dashboard] invoices load failed:", invoicesRes.error.message);
    if (productsRes.error) console.error("[dashboard] products load failed:", productsRes.error.message);
    if (customersRes.error) console.error("[dashboard] customers load failed:", customersRes.error.message);

    const invoices = invoicesRes.data || [];
    const products = productsRes.data || [];
    const customerCount = customersRes.count || 0;

    // Calculate lifecycle counts
    products.forEach((p) => {
      if (lifecycleCounts.hasOwnProperty(p.status)) {
        lifecycleCounts[p.status]++;
      } else {
        lifecycleCounts["in-stock"]++;
      }
    });

    if (invoices.length > 0) {
      const totalRevenue = invoices
        .filter((inv) => inv.type === "sale" && inv.status === "paid")
        .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);

      const formatIndianCurrency = (num) => {
        if (num === 0) return "₹0";
        return "₹" + num.toLocaleString("en-IN");
      };

      stats = {
        totalRevenue: formatIndianCurrency(totalRevenue),
        totalOrders: invoices.length.toLocaleString("en-IN"),
        productsSold: invoices.filter((inv) => inv.type === "sale").length.toLocaleString("en-IN"),
        activeCustomers: customerCount.toLocaleString("en-IN"),
      };

      recentTransactions = invoices.slice(0, 6).map((inv) => {
        const date = new Date(inv.date);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        let dateLabel = diffDays === 0 ? "Today" : diffDays === 1 ? "Yesterday" : `${diffDays} days ago`;
        return {
          id: inv.invoice_number,
          customer: inv.customer_name,
          amount: formatIndianCurrency(Number(inv.amount || 0)),
          status: inv.status,
          date: dateLabel,
          type: inv.type,
        };
      });
    }
  } catch (e) {
    // DB query failed — empty data will be shown
  }

  return <DashboardContent stats={stats} recentTransactions={recentTransactions} lifecycleCounts={lifecycleCounts} />;
}
