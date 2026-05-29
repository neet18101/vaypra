"use client"

// ─── Style constants (module-level, screen view) ──────────────────────────────
const cellTd    = { border: "1px solid #cfcfcf", padding: "3px 6px", verticalAlign: "middle", fontSize: 11 }
const labelTd   = { ...cellTd, width: "18%", fontWeight: 600, background: "#eef0f8", color: "#0a3a6b", whiteSpace: "nowrap" }
const valueTd   = { ...cellTd, width: "32%" }
const sectionTd = { ...cellTd, background: "#e0e4f0", fontWeight: 700, padding: "4px 6px", color: "#0a3a6b" }
const titleTd   = { ...cellTd, textAlign: "center", background: "#dce8f5", fontWeight: 800, letterSpacing: 4, fontSize: 14, padding: "7px", fontFamily: "'Segoe UI', Arial, sans-serif", color: "#0a3a6b", textTransform: "uppercase" }
const thTd      = { ...cellTd, background: "#f0f2fa", fontWeight: 700, textAlign: "center", fontSize: 10 }
// eslint-disable-next-line react-compiler/react-compiler
const inp       = { width: "100%", border: "none", outline: "none", font: "inherit", background: "transparent", padding: "1px 0" }

export const CANON_TEMPLATE = {
  report_title: "INSTALLATION REPORT",
  ref_no: "ME-P-003-FiiiB",
  footer_eng_name:  "Avanish Mishra",
  footer_eng_label: "Engineer Signature",
  footer_right:     "Customer Signature & Stamp",
}

const TRAINING_ITEMS = [
  { id: "tr_doc_align",   label: "Document Alignment" },
  { id: "tr_media",       label: "Media Loading" },
  { id: "tr_ctrl_panel",  label: "Control Panel Operation" },
  { id: "tr_manual_feed", label: "Manual Feed" },
  { id: "tr_two_side",    label: "Two Sided Printing" },
  { id: "tr_warming",     label: "Warming Up Time" },
  { id: "tr_toner_rep",   label: "Toner Replacement" },
  { id: "tr_waste_toner", label: "Waste Toner Replacement" },
  { id: "tr_paper_jam",   label: "Paper Jam Clearance" },
  { id: "tr_routine",     label: "Routine Cleaning" },
  { id: "tr_driver",      label: "Driver Installation" },
  { id: "tr_call_log",    label: "Call Logging Procedure" },
  { id: "tr_dos_donts",   label: "Do's & Don'ts" },
  { id: "tr_printout",    label: "Printout Demonstration" },
]

// ─── Component ────────────────────────────────────────────────────────────────
export function CanonPrinterReport({ mode = "view", fillValues = {}, onFill }) {
  const v = (id) => String(fillValues[id] ?? "")
  const r = (id, ch) => fillValues[id] === ch

  function tf(id, opts = {}) {
    if (mode === "fill") {
      return (
        <input
          type={opts.type ?? "text"}
          value={v(id)}
          onChange={(e) => onFill(id, e.target.value)}
          placeholder={opts.ph ?? ""}
          style={inp}
        />
      )
    }
    const val = v(id)
    return (
      <span style={{ display: "inline-block", width: "100%", minHeight: 15, color: val ? "#111" : "#aaa" }}>
        {val || "—"}
      </span>
    )
  }

  function yn(id) {
    if (mode === "fill") {
      return (
        <span style={{ whiteSpace: "nowrap" }}>
          <label style={{ marginRight: 10 }}>
            <input type="radio" name={id} checked={r(id, "yes")} onChange={() => onFill(id, "yes")} style={{ marginRight: 3 }} />Yes
          </label>
          <label>
            <input type="radio" name={id} checked={r(id, "no")} onChange={() => onFill(id, "no")} style={{ marginRight: 3 }} />No
          </label>
        </span>
      )
    }
    return (
      <span style={{ whiteSpace: "nowrap" }}>
        <span style={{ marginRight: 10 }}>{r(id, "yes") ? "●" : "○"}&thinsp;Yes</span>
        <span>{r(id, "no") ? "●" : "○"}&thinsp;No</span>
      </span>
    )
  }

  function powerRadio() {
    const opts = ["UPS", "CVT", "Stabilizer", "None"]
    if (mode === "fill") {
      return (
        <span style={{ display: "flex", gap: 16 }}>
          {opts.map((opt) => (
            <label key={opt} style={{ display: "flex", alignItems: "center", gap: 3 }}>
              <input type="radio" name="power_type" checked={r("power_type", opt)} onChange={() => onFill("power_type", opt)} />
              {opt}
            </label>
          ))}
        </span>
      )
    }
    return (
      <span>
        {opts.map((opt, i) => (
          <span key={opt} style={{ marginRight: i < opts.length - 1 ? 14 : 0 }}>
            {r("power_type", opt) ? "●" : "○"}&thinsp;{opt}
          </span>
        ))}
      </span>
    )
  }

  const tbl = { width: "100%", borderCollapse: "collapse", fontSize: 11 }

  const installDateVal = v("install_date")
  const warrantyExpiry = (() => {
    if (!installDateVal) return ""
    const d = new Date(installDateVal)
    if (isNaN(d.getTime())) return ""
    d.setFullYear(d.getFullYear() + 3)
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`
  })()

  return (
    <div style={{ maxWidth: 1060, margin: "0 auto", background: "#fff", border: "1px solid #d0d0d0", fontFamily: "'Segoe UI', Arial, Helvetica, sans-serif", color: "#222" }}>

      {/* Header */}
      <div style={{ padding: "6px 14px 4px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #0a3a6b" }}>
        <img src="/logo.png" alt="Rangayan Creations" style={{ height: 52, objectFit: "contain" }} />
        <div style={{ fontSize: 10, color: "#444", textAlign: "right", lineHeight: 1.6 }}>
          <div><strong>Address:</strong> A-113, NBCC Commercial Complex, Sector-1, Gomtinagar Ext Lucknow 226010</div>
          <div><strong>Support:</strong> +91-9453495949 &nbsp;|&nbsp; <strong>Email:</strong> support@rangayancreations.com</div>
        </div>
      </div>

      <table style={tbl}>
        <tbody>
          {/* Title */}
          <tr><td colSpan={4} style={titleTd}>{CANON_TEMPLATE.report_title}</td></tr>

          {/* ── Customer & Machine Info ── */}
          <tr>
            <td style={labelTd}>Department Name</td>
            <td style={valueTd}>{tf("department_name")}</td>
            <td style={labelTd}>Model No.</td>
            <td style={valueTd}>{tf("model_no")}</td>
          </tr>
          <tr>
            <td style={{ ...labelTd, verticalAlign: "top" }}>Address</td>
            <td style={{ ...valueTd, verticalAlign: "top" }}>
              {mode === "fill"
                ? <textarea value={v("address")} onChange={(e) => onFill("address", e.target.value)} rows={2} style={{ ...inp, resize: "vertical", minHeight: 32 }} />
                : <span style={{ display: "block", whiteSpace: "pre-wrap" }}>{v("address") || "—"}</span>}
            </td>
            <td style={labelTd}>M/C Serial No.</td>
            <td style={valueTd}>{tf("mc_serial")}</td>
          </tr>
          <tr>
            <td style={labelTd}>Name of User</td>
            <td style={valueTd}>{tf("name_of_user")}</td>
            <td style={labelTd}>Brand Name</td>
            <td style={{ ...valueTd, fontWeight: 700, color: "#CC0000" }}>Canon</td>
          </tr>
          <tr>
            <td style={labelTd}>Mobile Number</td>
            <td style={valueTd}>{tf("tel_no", { type: "tel" })}</td>
            <td style={labelTd}>Installation Date</td>
            <td style={valueTd}>{tf("install_date", { type: "date" })}</td>
          </tr>
          <tr>
            <td style={labelTd}>Email</td>
            <td style={valueTd}>{tf("email_admin", { type: "email" })}</td>
            <td style={labelTd}>Warranty Period</td>
            <td style={{ ...valueTd }}><strong>3 Years</strong></td>
          </tr>
          <tr>
            <td style={labelTd}>Room No / Room Name</td>
            <td style={valueTd}>{tf("room_no")}</td>
            <td style={labelTd}>Warranty Expiry Date</td>
            <td style={{ ...valueTd, color: warrantyExpiry ? "#222" : "#999" }}>
              {warrantyExpiry || "Auto: install date + 3 years"}
            </td>
          </tr>

          {/* ── Toner Bottle Counter ── */}
          <tr><td colSpan={4} style={sectionTd}>TONER BOTTLE COUNTER</td></tr>
          <tr>
            {["71", "72", "73", "74"].map((n) => (
              <td key={n} style={thTd}>{n}</td>
            ))}
          </tr>
          <tr>
            {["71", "72", "73", "74"].map((n) => (
              <td key={n} style={{ ...cellTd, textAlign: "center" }}>{tf(`toner_${n}`)}</td>
            ))}
          </tr>

          {/* ── Meter Reading ── */}
          <tr><td colSpan={4} style={sectionTd}>METER READING</td></tr>
          <tr>
            <td style={thTd}>Type</td>
            <td style={thTd}>Large</td>
            <td style={thTd}>Small</td>
            <td style={thTd}>XL</td>
          </tr>
          {[["Black", "black"], ["Color", "color"]].map(([label, key]) => (
            <tr key={key}>
              <td style={{ ...cellTd, fontWeight: 600, background: "#f4f4f4" }}>{label}</td>
              <td style={cellTd}>{tf(`meter_${key}_large`)}</td>
              <td style={cellTd}>{tf(`meter_${key}_small`)}</td>
              <td style={cellTd}>{tf(`meter_${key}_xl`)}</td>
            </tr>
          ))}

          {/* ── Power Supply ── */}
          <tr>
            <td style={labelTd}>Power Supply Type</td>
            <td colSpan={3} style={cellTd}>{powerRadio()}</td>
          </tr>

          {/* ── Customer Training ── */}
          <tr><td colSpan={4} style={sectionTd}>CUSTOMER TRAINING &nbsp;(Yes / No)</td></tr>
          <tr>
            <td style={{ ...thTd, width: "6%", textAlign: "center" }}>#</td>
            <td colSpan={2} style={{ ...thTd, textAlign: "left", paddingLeft: 6 }}>Training Item</td>
            <td style={{ ...thTd, width: "18%", textAlign: "center" }}>Y / N</td>
          </tr>
          {TRAINING_ITEMS.map((item, i) => (
            <tr key={item.id} style={{ background: i % 2 === 1 ? "#fafbff" : "#fff" }}>
              <td style={{ ...cellTd, textAlign: "center", color: "#888" }}>{i + 1}</td>
              <td colSpan={2} style={cellTd}>{item.label}</td>
              <td style={{ ...cellTd, textAlign: "center" }}>{yn(item.id)}</td>
            </tr>
          ))}

          {/* ── Remarks ── */}
          <tr><td colSpan={4} style={sectionTd}>REMARKS</td></tr>
          <tr>
            <td colSpan={4} style={{ ...cellTd, height: 36 }}>
              {mode === "fill"
                ? <input type="text" value={v("remarks")} onChange={(e) => onFill("remarks", e.target.value)} style={{ ...inp, height: 28 }} />
                : <span style={{ display: "block" }}>{v("remarks") || ""}</span>}
            </td>
          </tr>

          {/* ── Certification + Signing ── */}
          <tr>
            <td colSpan={4} style={{ ...cellTd, fontSize: 9, fontStyle: "italic", color: "#666", background: "#fffef4" }}>
              I / We hereby certify that the above machine has been installed, configured, and demonstrated to the satisfaction of the customer. All items covered in training have been explained.
            </td>
          </tr>
          <tr>
            <td style={labelTd}>Customer Signature / Name</td>
            <td colSpan={3} style={{ ...cellTd, height: 42 }}>{tf("cust_signing")}</td>
          </tr>
        </tbody>
      </table>

      {/* Service Date + User Name */}
      <table style={tbl}>
        <tbody>
          <tr>
            <td style={labelTd}>Service Date</td>
            <td style={valueTd}>{tf("service_date", { type: "date" })}</td>
            <td style={labelTd}>User Name</td>
            <td style={valueTd}>{v("name_of_user") || "—"}</td>
          </tr>
        </tbody>
      </table>

      {/* Footer signatures */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px 8px", fontSize: 11 }}>
        <div style={{ width: "44%", textAlign: "center" }}>
          <div style={{ marginBottom: 26, fontWeight: 600 }}>{CANON_TEMPLATE.footer_eng_name}</div>
          <div style={{ borderTop: "1px solid #555", paddingTop: 4 }}>{CANON_TEMPLATE.footer_eng_label}</div>
        </div>
        <div style={{ width: "44%", textAlign: "center" }}>
          <div style={{ marginBottom: 26 }}>&nbsp;</div>
          <div style={{ borderTop: "1px solid #555", paddingTop: 4 }}>{CANON_TEMPLATE.footer_right}</div>
        </div>
      </div>
    </div>
  )
}

// ─── Print HTML builder (A4-optimised) ───────────────────────────────────────
export function buildCanonPrintHtml(fillValues) {
  const v   = (id) => String(fillValues[id] ?? "")
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  const sel = (id, ch) => fillValues[id] === ch

  const yn = (id) => {
    const y = sel(id, "yes"), n = sel(id, "no")
    return `<span style="white-space:nowrap">${y ? "&#9679;" : "&#9675;"}&thinsp;Yes&nbsp;&nbsp;${n ? "&#9679;" : "&#9675;"}&thinsp;No</span>`
  }

  const fmtDate = (s) => {
    if (!s) return ""
    const d = new Date(s)
    if (isNaN(d.getTime())) return esc(s)
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`
  }

  const tf = (id, isDate = false) => {
    const raw = v(id)
    if (isDate) return fmtDate(raw)
    return esc(raw) || "&nbsp;"
  }

  const warrantyExpiry = (() => {
    const s = v("install_date")
    if (!s) return ""
    const d = new Date(s)
    if (isNaN(d.getTime())) return ""
    d.setFullYear(d.getFullYear() + 3)
    return fmtDate(d.toISOString().split("T")[0])
  })()

  const powerOpts = ["UPS", "CVT", "Stabilizer", "None"]
  const powerRow  = powerOpts.map((opt) =>
    `${sel("power_type", opt) ? "&#9679;" : "&#9675;"}&thinsp;${opt}`
  ).join("&nbsp;&nbsp;&nbsp;")

  const F  = "'Segoe UI','Helvetica Neue',Arial,sans-serif"
  const C  = `border:1px solid #bbb;padding:4px 7px;vertical-align:middle;font-size:11px;font-family:${F};color:#111;line-height:1.4`
  const L  = `${C};width:18%;font-weight:700;background:#eef0f8;color:#0a3a6b;white-space:nowrap`
  const V  = `${C};width:32%`
  const S  = `background:#e0e4f0;font-weight:700;padding:4px 7px;color:#0a3a6b;font-size:11px;font-family:${F};border:1px solid #bbb`
  const T  = `text-align:center;background:#dce8f5;font-weight:800;letter-spacing:3px;font-size:15px;padding:8px 8px;color:#0a3a6b;text-transform:uppercase;font-family:${F};border:1px solid #bbb`
  const TH = `border:1px solid #bbb;background:#f0f2fa;font-weight:700;text-align:center;font-size:10.5px;padding:3px 5px;font-family:${F}`

  const trainingRows = TRAINING_ITEMS.map((item, i) =>
    `<tr style="background:${i % 2 === 1 ? "#fafbff" : "#fff"}"><td style="${C};width:5%;text-align:center;color:#888">${i + 1}</td><td colspan="2" style="${C}">${item.label}</td><td style="${C};width:18%;text-align:center">${yn(item.id)}</td></tr>`
  ).join("")

  const meterRows = [["Black","black"],["Color","color"]].map(([label, key]) =>
    `<tr><td style="${C};font-weight:700;background:#f4f4f4">${label}</td><td style="${C}">${tf(`meter_${key}_large`)}</td><td style="${C}">${tf(`meter_${key}_small`)}</td><td style="${C}">${tf(`meter_${key}_xl`)}</td></tr>`
  ).join("")

  const tonerRow = ["71","72","73","74"].map((n) =>
    `<td style="${C};text-align:center">${tf(`toner_${n}`)}</td>`
  ).join("")

  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<title>Installation Report — ${esc(v("department_name") || "Printer")}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:210mm;font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif;font-size:11px;color:#111;background:#fff;line-height:1.4}
  @page{size:A4 portrait;margin:6mm 8mm}
  @media print{html,body{width:210mm}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  .pw{min-height:calc(297mm - 12mm);display:flex;flex-direction:column}
  .ps{flex:1;min-height:0}
  table{border-collapse:collapse;width:100%;table-layout:fixed}
  td,th{overflow:hidden;word-break:break-word}
  .hdr{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #0a3a6b;padding-bottom:5px;margin-bottom:4px}
  .hdr-c{font-size:9.5px;color:#444;text-align:right;line-height:1.7}
  .footer{display:flex;justify-content:space-between;padding-top:28px;font-size:11px}
  .fsig{width:44%;text-align:center;font-weight:600}
  .fsig .fn{margin-bottom:26px;display:block;font-size:11.5px}
  .fsig .fl{border-top:1.5px solid #000;padding-top:4px;display:block}
</style>
</head><body>
<div class="pw">

<div class="hdr">
  <img src="/logo.png" alt="Rangayan Creations" style="height:46px;object-fit:contain;max-width:42%"/>
  <div class="hdr-c">
    <div><strong>Address:</strong> A-113, NBCC Commercial Complex, Sector-1, Gomtinagar Ext, Lucknow 226010</div>
    <div><strong>Support:</strong> +91-9453495949 &nbsp;|&nbsp; <strong>Email:</strong> support@rangayancreations.com</div>
  </div>
</div>

<table style="margin-bottom:3px">
  <tr><td style="${T}">INSTALLATION REPORT</td></tr>
</table>

<table>
  <colgroup><col style="width:17%"><col style="width:33%"><col style="width:17%"><col style="width:33%"></colgroup>
  <tbody>
    <tr><td style="${L}">Department Name</td><td style="${V}">${tf("department_name")}</td><td style="${L}">Model No.</td><td style="${V}">${tf("model_no")}</td></tr>
    <tr><td style="${L};vertical-align:top">Address</td><td style="${C};white-space:pre-wrap">${esc(v("address"))}</td><td style="${L}">M/C Serial No.</td><td style="${C}">${tf("mc_serial")}</td></tr>
    <tr><td style="${L}">Name of User</td><td style="${C}">${tf("name_of_user")}</td><td style="${L}">Brand Name</td><td style="${C};font-weight:700;color:#CC0000">Canon</td></tr>
    <tr><td style="${L}">Mobile Number</td><td style="${C}">${tf("tel_no")}</td><td style="${L}">Installation Date</td><td style="${C}">${tf("install_date", true)}</td></tr>
    <tr><td style="${L}">Email</td><td style="${C}">${tf("email_admin")}</td><td style="${L}">Warranty Period</td><td style="${C}"><strong>3 Years</strong></td></tr>
    <tr><td style="${L}">Room No / Room Name</td><td style="${C}">${tf("room_no")}</td><td style="${L}">Warranty Expiry Date</td><td style="${C}">${warrantyExpiry}</td></tr>
  </tbody>
</table>

<table style="margin-top:3px">
  <tbody>
    <tr><td colspan="4" style="${S}">TONER BOTTLE COUNTER</td></tr>
    <tr>${["71","72","73","74"].map((n) => `<th style="${TH};width:25%">${n}</th>`).join("")}</tr>
    <tr>${tonerRow}</tr>
  </tbody>
</table>

<table style="margin-top:3px">
  <tbody>
    <tr><td colspan="4" style="${S}">METER READING</td></tr>
    <tr><th style="${TH};width:20%">Type</th><th style="${TH};width:27%">Large</th><th style="${TH};width:27%">Small</th><th style="${TH};width:26%">XL</th></tr>
    ${meterRows}
  </tbody>
</table>

<table style="margin-top:3px">
  <colgroup><col style="width:17%"><col></colgroup>
  <tbody>
    <tr><td style="${L}">Power Supply Type</td><td style="${C}">${powerRow}</td></tr>
  </tbody>
</table>

<table style="margin-top:3px">
  <colgroup><col style="width:5%"><col><col><col style="width:18%"></colgroup>
  <tbody>
    <tr><td colspan="4" style="${S}">CUSTOMER TRAINING &nbsp;(Yes / No)</td></tr>
    <tr><th style="${TH}">#</th><th colspan="2" style="${TH};text-align:left;padding-left:6px">Training Item</th><th style="${TH}">Y / N</th></tr>
    ${trainingRows}
  </tbody>
</table>

<table style="margin-top:3px">
  <tbody>
    <tr><td style="${S}">REMARKS</td></tr>
    <tr><td style="${C};height:42px">${tf("remarks")}</td></tr>
    <tr><td style="${C};font-size:9px;font-style:italic;color:#666;background:#fffef4">I / We hereby certify that the above machine has been installed, configured, and demonstrated to the satisfaction of the customer. All items covered in training have been explained.</td></tr>
  </tbody>
</table>

<table style="margin-top:3px">
  <colgroup><col style="width:17%"><col></colgroup>
  <tbody>
    <tr><td style="${L}">Customer Signature / Name</td><td style="${C};height:44px">${tf("cust_signing")}</td></tr>
  </tbody>
</table>

<table style="margin-top:3px">
  <colgroup><col style="width:17%"><col style="width:33%"><col style="width:17%"><col style="width:33%"></colgroup>
  <tbody>
    <tr>
      <td style="${L}">Service Date</td><td style="${C}">${tf("service_date", true)}</td>
      <td style="${L}">User Name</td><td style="${C}">${tf("name_of_user")}</td>
    </tr>
  </tbody>
</table>

<div class="ps"></div>

<div class="footer">
  <div class="fsig"><span class="fn">Avanish Mishra</span><span class="fl">Engineer Signature</span></div>
  <div class="fsig"><span class="fn">&nbsp;</span><span class="fl">Customer Signature &amp; Stamp</span></div>
</div>

</div>
</body></html>`
}

// ─── Print opener ─────────────────────────────────────────────────────────────
export function printCanonForm(fillValues) {
  const html = buildCanonPrintHtml(fillValues)
  const win  = window.open("", "_blank")
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  const img     = win.document.querySelector("img")
  const doPrint = () => {
    if (win.document.fonts?.ready) {
      win.document.fonts.ready.then(() => win.print())
    } else {
      win.print()
    }
  }
  if (img && !img.complete) {
    img.onload  = () => doPrint()
    img.onerror = () => doPrint()
  } else {
    setTimeout(() => doPrint(), 400)
  }
}
