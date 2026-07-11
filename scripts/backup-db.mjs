import { writeFileSync, mkdirSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse .env.local manually
const envPath = join(__dirname, "../.env.local");
const envVars = {};
try {
  readFileSync(envPath, "utf8").split("\n").forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) envVars[m[1].trim()] = m[2].trim();
  });
} catch { /* file not found */ }

const BASE_URL = envVars["NEXT_PUBLIC_SUPABASE_URL"]  || process.env["NEXT_PUBLIC_SUPABASE_URL"];
const SKEY     = envVars["SUPABASE_SERVICE_ROLE_KEY"] || process.env["SUPABASE_SERVICE_ROLE_KEY"];

if (!BASE_URL || !SKEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const HEADERS = {
  "apikey": SKEY,
  "Authorization": `Bearer ${SKEY}`,
  "Content-Type": "application/json",
};

const TABLES = [
  "organizations",
  "organization_members",
  "profiles",
  "categories",
  "products",
  "customers",
  "invoices",
  "installments",
  "branches",
  "dispatches",
  "dispatch_items",
  "installations",
  "print_templates",
];

async function fetchTable(table) {
  let rows = [];
  let from  = 0;
  const PAGE = 1000;

  while (true) {
    const res = await fetch(
      `${BASE_URL}/rest/v1/${table}?select=*&offset=${from}&limit=${PAGE}`,
      { headers: HEADERS }
    );
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(`${table}: ${res.status} ${msg}`);
    }
    const data = await res.json();
    rows = rows.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return rows;
}

async function backupAll() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const backupDir = join(__dirname, "../backup");
  mkdirSync(backupDir, { recursive: true });

  const backup = { exported_at: new Date().toISOString(), tables: {} };
  let totalRows = 0;

  for (const table of TABLES) {
    try {
      const rows = await fetchTable(table);
      backup.tables[table] = rows;
      totalRows += rows.length;
      console.log(`  ✓ ${table}: ${rows.length} rows`);
    } catch (err) {
      console.warn(`  ✗ ${table}: ${err.message}`);
      backup.tables[table] = [];
    }
  }

  const outFile = join(backupDir, `backup_${timestamp}.json`);
  writeFileSync(outFile, JSON.stringify(backup, null, 2), "utf8");

  console.log(`\nBackup saved → ${outFile}`);
  console.log(`Total rows: ${totalRows}`);
}

backupAll().catch((err) => {
  console.error("Backup failed:", err);
  process.exit(1);
});
