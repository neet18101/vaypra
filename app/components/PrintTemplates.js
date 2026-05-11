// ===== Brand color mapping =====
const BRAND_COLORS = {
  hp: { primary: "#0096D6", secondary: "#E6F4FB", name: "HP" },
  canon: { primary: "#CC0000", secondary: "#FDECEA", name: "Canon" },
  samsung: { primary: "#1428A0", secondary: "#E8EAF6", name: "Samsung" },
  dell: { primary: "#007DB8", secondary: "#E0F2F7", name: "Dell" },
  lenovo: { primary: "#E2231A", secondary: "#FDECEA", name: "Lenovo" },
  epson: { primary: "#003399", secondary: "#E3E8F4", name: "Epson" },
  acer: { primary: "#83B81A", secondary: "#F0F7E5", name: "Acer" },
  asus: { primary: "#00539B", secondary: "#E0EEF7", name: "ASUS" },
  default: { primary: "#6C5CE7", secondary: "#EDE7F6", name: "BizFlowPro" },
};

export function getBrandTheme(brand) {
  if (!brand) return BRAND_COLORS.default;
  const key = brand.toLowerCase().trim();
  return BRAND_COLORS[key] || BRAND_COLORS.default;
}

// ===== Print template definitions =====
export const TEMPLATES = [
  {
    id: "standard",
    name: "Standard",
    description: "Clean professional layout",
  },
  {
    id: "brand",
    name: "Brand Certificate",
    description: "Brand-colored header with official certificate style",
  },
  {
    id: "compact",
    name: "Compact",
    description: "Minimal single-page for quick filing",
  },
];

// ===== Shared helpers =====
function escHtml(str) {
  return (str || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildCfRows(cf) {
  if (!cf || !Object.keys(cf).length) return "";
  return Object.entries(cf)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px;border:1px solid #ddd;font-weight:600;color:#555;background:#f9f9fc;">${escHtml(k)}</td><td style="padding:6px 12px;border:1px solid #ddd;font-family:monospace;">${escHtml(v)}</td></tr>`
    )
    .join("");
}

function fmtDate(d) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function keysSection(data, accent) {
  const { windowsKey, msOfficeKey, antivirusKey } = data;
  if (!windowsKey && !msOfficeKey && !antivirusKey) return "";
  const boxes = [
    windowsKey && { label: "Windows Key", value: windowsKey },
    msOfficeKey && { label: "MS Office Key", value: msOfficeKey },
    antivirusKey && { label: "Antivirus Key", value: antivirusKey },
  ].filter(Boolean);
  return `
  <div class="section">
    <div class="section-title" style="color:${accent};">License Keys</div>
    <div style="display:grid;grid-template-columns:${boxes.length === 1 ? "1fr" : boxes.length === 2 ? "1fr 1fr" : "1fr 1fr 1fr"};gap:12px;">
      ${boxes
        .map(
          (b) =>
            `<div style="border:1px solid #e0e0e0;border-radius:8px;padding:10px 14px;">
              <div style="font-size:10px;text-transform:uppercase;letter-spacing:1px;font-weight:600;color:#999;margin-bottom:4px;">${b.label}</div>
              <div style="font-family:monospace;font-size:12px;word-break:break-all;color:#2D3436;">${escHtml(b.value)}</div>
            </div>`
        )
        .join("")}
    </div>
  </div>`;
}

function signatureFooter() {
  return `
  <div style="margin-top:40px;display:flex;justify-content:space-between;">
    <div style="width:200px;text-align:center;">
      <div style="border-top:1px solid #999;margin-top:50px;padding-top:6px;font-size:11px;color:#777;">Customer Signature</div>
    </div>
    <div style="width:200px;text-align:center;">
      <div style="border-top:1px solid #999;margin-top:50px;padding-top:6px;font-size:11px;color:#777;">Installer Signature</div>
    </div>
  </div>`;
}

// ===== Normalize data from either savedInstallation or raw installation record =====
export function normalizeData(data, installation, product, branchName) {
  if (data) {
    // From savedInstallation (after save)
    return {
      productName: data.productName || "",
      productBrand: data.productBrand || "",
      serialNumber: data.serialNumber || "",
      branchName: data.branchName || "",
      customerName: data.customerName || "",
      installerName: data.installerName || "",
      installationDate: data.installationDate || "",
      windowsKey: data.windowsKey || "",
      msOfficeKey: data.msOfficeKey || "",
      antivirusKey: data.antivirusKey || "",
      notes: data.notes || "",
      customFields: data.customFields || null,
    };
  }
  // From existing installation record (table print)
  const p = product || installation?.products || {};
  return {
    productName: p.name || "",
    productBrand: p.brand || "",
    serialNumber: p.serial_number || "",
    branchName: branchName || "",
    customerName: installation?.customer_name || "",
    installerName: installation?.installer_name || "",
    installationDate: installation?.installation_date || "",
    windowsKey: installation?.windows_key || "",
    msOfficeKey: installation?.ms_office_key || "",
    antivirusKey: installation?.antivirus_key || "",
    notes: installation?.notes || "",
    customFields: installation?.custom_fields || null,
  };
}

// ===== TEMPLATE 1: Standard =====
export function templateStandard(d, cfg = {}) {
  const accent = cfg.accent_color || "#6C5CE7";
  const companyName = cfg.company_name || "BizFlowPro";
  const subtitle = cfg.header_subtitle || "Installation Certificate";
  const footerText = cfg.footer_text || "";
  const showKeys = cfg.show_keys !== false;
  const showCf = cfg.show_custom_fields !== false;
  const showNotes = cfg.show_notes !== false;
  const showSig = cfg.show_signatures !== false;

  const cfRows = showCf ? buildCfRows(d.customFields) : "";
  const dateStr = fmtDate(d.installationDate);

  return `<!DOCTYPE html>
<html><head>
  <title>Installation Report - ${escHtml(d.serialNumber || d.productName)}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Segoe UI',Arial,sans-serif;padding:32px;color:#2D3436;}
    .header{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid ${accent};padding-bottom:16px;margin-bottom:24px;}
    .logo{font-size:22px;font-weight:800;color:#1A1C2E;} .logo span{color:${accent};}
    .title{font-size:13px;color:${accent};font-weight:700;text-transform:uppercase;letter-spacing:2px;}
    .date-label{font-size:12px;color:#999;margin-top:4px;}
    .section{margin-bottom:20px;}
    .section-title{font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;color:${accent};margin-bottom:10px;border-bottom:1px solid #eee;padding-bottom:6px;}
    table{width:100%;border-collapse:collapse;margin-bottom:4px;}
    td{padding:8px 12px;border:1px solid #e0e0e0;font-size:13px;}
    td:first-child{width:160px;font-weight:600;color:#555;background:#f9f9fc;}
    .notes{background:#f9f9fc;border:1px solid #e0e0e0;border-radius:8px;padding:12px;font-size:13px;color:#555;}
    @media print{body{padding:20px;}}
  </style>
</head><body>
  <div class="header">
    <div><div class="logo">${escHtml(companyName)}</div><div class="date-label">Installation Report</div></div>
    <div style="text-align:right;"><div class="title">${escHtml(subtitle)}</div><div class="date-label">Date: ${dateStr}</div></div>
  </div>
  <div class="section"><div class="section-title">Product Details</div>
    <table>
      <tr><td>Product Name</td><td>${escHtml(d.productName)}</td></tr>
      ${d.productBrand ? `<tr><td>Brand</td><td>${escHtml(d.productBrand)}</td></tr>` : ""}
      <tr><td>Serial Number</td><td style="font-family:monospace;font-weight:600;">${escHtml(d.serialNumber) || "\u2014"}</td></tr>
      ${d.branchName ? `<tr><td>Branch / Location</td><td>${escHtml(d.branchName)}</td></tr>` : ""}
    </table>
  </div>
  <div class="section"><div class="section-title">Installation Details</div>
    <table>
      <tr><td>Customer Name</td><td>${escHtml(d.customerName)}</td></tr>
      <tr><td>Installed By</td><td>${escHtml(d.installerName)}</td></tr>
      <tr><td>Installation Date</td><td>${dateStr}</td></tr>
    </table>
  </div>
  ${showKeys ? keysSection(d, accent) : ""}
  ${cfRows ? `<div class="section"><div class="section-title">Additional Fields</div><table>${cfRows}</table></div>` : ""}
  ${showNotes && d.notes ? `<div class="section"><div class="section-title">Notes</div><div class="notes">${escHtml(d.notes)}</div></div>` : ""}
  ${showSig ? signatureFooter() : ""}
  ${footerText ? `<div style="margin-top:24px;text-align:center;font-size:11px;color:#999;">${escHtml(footerText)}</div>` : ""}
</body></html>`;
}

// ===== TEMPLATE 2: Brand Certificate =====
export function templateBrand(d, cfg = {}) {
  const theme = getBrandTheme(d.productBrand);
  const accent = cfg.accent_color || theme.primary;
  const bgLight = theme.secondary;
  const companyName = cfg.company_name || (d.productBrand || "BizFlowPro");
  const subtitle = cfg.header_subtitle || "Installation Certificate";
  const footerText = cfg.footer_text || "";
  const showKeys = cfg.show_keys !== false;
  const showCf = cfg.show_custom_fields !== false;
  const showNotes = cfg.show_notes !== false;
  const showSig = cfg.show_signatures !== false;

  const cfRows = showCf ? buildCfRows(d.customFields) : "";
  const dateStr = fmtDate(d.installationDate);
  const brandLabel = d.productBrand || "BizFlowPro";

  return `<!DOCTYPE html>
<html><head>
  <title>${escHtml(brandLabel)} Installation Certificate - ${escHtml(d.serialNumber || d.productName)}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Segoe UI',Arial,sans-serif;color:#2D3436;}
    .brand-bar{background:${accent};color:#fff;padding:24px 32px;display:flex;justify-content:space-between;align-items:center;}
    .brand-name{font-size:28px;font-weight:800;letter-spacing:-0.5px;}
    .brand-sub{font-size:11px;opacity:0.8;text-transform:uppercase;letter-spacing:3px;margin-top:4px;}
    .cert-label{font-size:14px;font-weight:700;text-transform:uppercase;letter-spacing:3px;text-align:right;}
    .cert-date{font-size:12px;opacity:0.8;margin-top:4px;text-align:right;}
    .content{padding:28px 32px;}
    .section{margin-bottom:20px;}
    .section-title{font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;color:${accent};margin-bottom:10px;padding-bottom:6px;border-bottom:2px solid ${bgLight};}
    table{width:100%;border-collapse:collapse;margin-bottom:4px;}
    td{padding:8px 12px;border:1px solid #e0e0e0;font-size:13px;}
    td:first-child{width:160px;font-weight:600;color:#555;background:${bgLight};}
    .notes{background:${bgLight};border:1px solid #e0e0e0;border-radius:8px;padding:12px;font-size:13px;color:#555;}
    .footer-bar{background:${bgLight};padding:12px 32px;text-align:center;font-size:11px;color:#777;border-top:2px solid ${accent};}
    @media print{body{padding:0;}}
  </style>
</head><body>
  <div class="brand-bar">
    <div><div class="brand-name">${escHtml(companyName)}</div><div class="brand-sub">${escHtml(subtitle)}</div></div>
    <div><div class="cert-label">Certificate of Installation</div><div class="cert-date">${dateStr}</div></div>
  </div>
  <div class="content">
    <div class="section"><div class="section-title">Product Information</div>
      <table>
        <tr><td>Product Name</td><td>${escHtml(d.productName)}</td></tr>
        <tr><td>Brand</td><td style="font-weight:700;">${escHtml(brandLabel)}</td></tr>
        <tr><td>Serial Number</td><td style="font-family:monospace;font-weight:700;font-size:14px;">${escHtml(d.serialNumber) || "\u2014"}</td></tr>
        ${d.branchName ? `<tr><td>Branch / Location</td><td>${escHtml(d.branchName)}</td></tr>` : ""}
      </table>
    </div>
    <div class="section"><div class="section-title">Installation Details</div>
      <table>
        <tr><td>Customer Name</td><td>${escHtml(d.customerName)}</td></tr>
        <tr><td>Installed By</td><td>${escHtml(d.installerName)}</td></tr>
        <tr><td>Installation Date</td><td>${dateStr}</td></tr>
      </table>
    </div>
    ${showKeys ? keysSection(d, accent) : ""}
    ${cfRows ? `<div class="section"><div class="section-title">Additional Fields</div><table>${cfRows}</table></div>` : ""}
    ${showNotes && d.notes ? `<div class="section"><div class="section-title">Notes</div><div class="notes">${escHtml(d.notes)}</div></div>` : ""}
    ${showSig ? signatureFooter() : ""}
  </div>
  <div class="footer-bar">${footerText ? escHtml(footerText) : `This certificate was generated by ${escHtml(companyName)} &mdash; Business Suite`}</div>
</body></html>`;
}

// ===== TEMPLATE 3: Compact =====
export function templateCompact(d, cfg = {}) {
  const theme = getBrandTheme(d.productBrand);
  const accent = cfg.accent_color || theme.primary;
  const companyName = cfg.company_name || "BizFlowPro";
  const footerText = cfg.footer_text || "";
  const showKeys = cfg.show_keys !== false;
  const showCf = cfg.show_custom_fields !== false;
  const showNotes = cfg.show_notes !== false;
  const showSig = cfg.show_signatures !== false;

  const dateStr = fmtDate(d.installationDate);
  const brandLabel = d.productBrand || "";

  const keyLines = showKeys
    ? [
        d.windowsKey && `<b>Win:</b> <span style="font-family:monospace;">${escHtml(d.windowsKey)}</span>`,
        d.msOfficeKey && `<b>Office:</b> <span style="font-family:monospace;">${escHtml(d.msOfficeKey)}</span>`,
        d.antivirusKey && `<b>AV:</b> <span style="font-family:monospace;">${escHtml(d.antivirusKey)}</span>`,
      ].filter(Boolean)
    : [];

  const cfEntries = showCf && d.customFields ? Object.entries(d.customFields) : [];

  return `<!DOCTYPE html>
<html><head>
  <title>Install - ${escHtml(d.serialNumber || d.productName)}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Segoe UI',Arial,sans-serif;padding:20px;color:#2D3436;font-size:12px;}
    .top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid ${accent};padding-bottom:10px;margin-bottom:14px;}
    .top-left{font-size:16px;font-weight:800;} .top-left span{color:${accent};}
    .top-right{text-align:right;font-size:11px;color:#777;}
    .row{display:flex;gap:24px;margin-bottom:6px;}
    .lbl{color:#888;min-width:100px;}
    .val{font-weight:600;}
    .sn{font-family:monospace;color:${accent};font-weight:700;font-size:13px;}
    .divider{border-top:1px dashed #ddd;margin:10px 0;}
    .keys{margin:10px 0;} .keys div{margin-bottom:4px;font-size:11.5px;}
    .sig{display:flex;justify-content:space-between;margin-top:30px;}
    .sig-box{width:180px;border-top:1px solid #999;padding-top:4px;text-align:center;font-size:10px;color:#777;}
    @media print{body{padding:12px;}}
  </style>
</head><body>
  <div class="top">
    <div class="top-left">${brandLabel ? escHtml(brandLabel) + " — " : ""}Installation Record</div>
    <div class="top-right">${dateStr}<br/>${escHtml(companyName)}</div>
  </div>
  <div class="row"><span class="lbl">Product</span><span class="val">${escHtml(d.productName)}</span></div>
  <div class="row"><span class="lbl">Serial No.</span><span class="sn">${escHtml(d.serialNumber) || "\u2014"}</span></div>
  ${d.branchName ? `<div class="row"><span class="lbl">Location</span><span class="val">${escHtml(d.branchName)}</span></div>` : ""}
  <div class="divider"></div>
  <div class="row"><span class="lbl">Customer</span><span class="val">${escHtml(d.customerName)}</span></div>
  <div class="row"><span class="lbl">Installer</span><span class="val">${escHtml(d.installerName)}</span></div>
  <div class="row"><span class="lbl">Date</span><span class="val">${dateStr}</span></div>
  ${keyLines.length ? `<div class="divider"></div><div class="keys">${keyLines.map((l) => `<div>${l}</div>`).join("")}</div>` : ""}
  ${cfEntries.length ? `<div class="divider"></div>${cfEntries.map(([k, v]) => `<div class="row"><span class="lbl">${escHtml(k)}</span><span class="val" style="font-family:monospace;">${escHtml(v)}</span></div>`).join("")}` : ""}
  ${showNotes && d.notes ? `<div class="divider"></div><div style="color:#666;"><b>Notes:</b> ${escHtml(d.notes)}</div>` : ""}
  ${showSig ? `<div class="sig"><div class="sig-box">Customer Signature</div><div class="sig-box">Installer Signature</div></div>` : ""}
  ${footerText ? `<div style="margin-top:16px;text-align:center;font-size:10px;color:#999;">${escHtml(footerText)}</div>` : ""}
</body></html>`;
}

// ===== Master print function =====
// cfg is an optional config object from a user-created print_template record.
// If omitted, all templates use their hardcoded defaults (backward compatible).
export function generatePrintHtml(templateId, data, cfg) {
  switch (templateId) {
    case "brand":
      return templateBrand(data, cfg);
    case "compact":
      return templateCompact(data, cfg);
    case "standard":
    default:
      return templateStandard(data, cfg);
  }
}

export function openPrintWindow(html) {
  const w = window.open("", "_blank", "width=800,height=900");
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
}
