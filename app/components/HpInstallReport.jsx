"use client"

import { useState } from "react"
import { X, Printer } from "lucide-react"

// ─── Shared font stack ──────────────────────────────────────────────────────
const FONT = "'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif"
const MONO = "'JetBrains Mono', 'Courier New', monospace"

// ─── Screen-render style constants ──────────────────────────────────────────
const cell    = { border: "1px solid #c8cce0", padding: "4px 8px", verticalAlign: "middle", fontSize: 12, fontFamily: FONT, color: "#222", lineHeight: 1.45 }
const labelC  = { ...cell, width: "18%", fontWeight: 700, background: "#eef0f8", color: "#0a3a6b", whiteSpace: "nowrap" }
const valueC  = { ...cell, width: "32%" }
const sectionC= { ...cell, background: "#d8ddf0", fontWeight: 700, padding: "5px 8px", color: "#0a3a6b", fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" }
const titleC  = { ...cell, textAlign: "center", background: "#d0e4f5", fontWeight: 800, letterSpacing: 3, fontSize: 14, padding: "8px", color: "#0a3a6b", textTransform: "uppercase" }
const yesnoC  = { ...cell, textAlign: "right", whiteSpace: "nowrap", width: 130 }
const inp     = { width: "100%", border: "none", outline: "none", background: "transparent", padding: "1px 0", fontFamily: FONT, fontSize: 12, color: "#222" }

// ─── Inner report (screen) ───────────────────────────────────────────────────
export function HpInstallReport({ template, mode, fillValues, onFill }) {
  const v = (id) => (typeof fillValues[id] === "string" ? fillValues[id] : "")
  const r = (id, ch) => fillValues[id] === ch

  const tf = (id, opts = {}) => {
    if (mode === "fill") return (
      <input type={opts.type ?? "text"} value={v(id)} onChange={(e) => onFill(id, e.target.value)}
        placeholder={opts.ph ?? ""} style={{ ...inp, ...(opts.mono ? { fontFamily: MONO, letterSpacing: 1 } : {}) }} />
    )
    const val = v(id)
    return <span style={{ display: "inline-block", width: "100%", minHeight: 16, color: val ? "#222" : "#aaa", fontFamily: opts.mono ? MONO : FONT }}>{val || "—"}</span>
  }

  const yesNo = (id) => {
    if (mode === "view") {
      const val = fillValues[id]
      return (
        <span style={{ whiteSpace: "nowrap" }}>
          <span style={{ marginLeft: 10 }}>{val === "yes" ? "●" : "○"}&thinsp;Yes</span>
          <span style={{ marginLeft: 10 }}>{val === "no"  ? "●" : "○"}&thinsp;No</span>
        </span>
      )
    }
    return (
      <span>
        <label style={{ marginLeft: 10, fontFamily: FONT, fontSize: 12 }}>
          <input type="radio" name={id} checked={r(id, "yes")} onChange={() => onFill(id, "yes")} disabled={mode !== "fill"} style={{ marginRight: 4 }} />Yes
        </label>
        <label style={{ marginLeft: 10, fontFamily: FONT, fontSize: 12 }}>
          <input type="radio" name={id} checked={r(id, "no")}  onChange={() => onFill(id, "no")}  disabled={mode !== "fill"} style={{ marginRight: 4 }} />No
        </label>
      </span>
    )
  }

  const actStatus = (id) => {
    if (mode === "view") {
      const val = fillValues[id]
      return (
        <span style={{ whiteSpace: "nowrap", fontFamily: FONT }}>
          <span style={{ marginRight: 14 }}>{val === "Activated" ? "●" : "○"}&thinsp;Activated</span>
          <span>{val === "Pending" ? "●" : "○"}&thinsp;Pending</span>
        </span>
      )
    }
    return (
      <span style={{ fontFamily: FONT, fontSize: 12 }}>
        <label style={{ marginRight: 14 }}>
          <input type="radio" name={id} checked={r(id, "Activated")} onChange={() => onFill(id, "Activated")} disabled={mode !== "fill"} style={{ marginRight: 4 }} />Activated
        </label>
        <label>
          <input type="radio" name={id} checked={r(id, "Pending")} onChange={() => onFill(id, "Pending")} disabled={mode !== "fill"} style={{ marginRight: 4 }} />Pending
        </label>
      </span>
    )
  }

  const checklist = [
    { id: "c1", label: "Hardware unboxing & physical setup" },
    { id: "c3", label: "Windows installation & activation" },
    { id: "c4", label: "MS Office installation & activation" },
    { id: "c5", label: "Antivirus installation & activation" },
    { id: "c7", label: "Windows Updates installed" },
  ]

  const installDateVal = v("install_date")
  const warrantyExpiry = (() => {
    if (!installDateVal) return ""
    const d = new Date(installDateVal)
    if (isNaN(d.getTime())) return ""
    d.setFullYear(d.getFullYear() + 3)
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`
  })()

  const fmtDateDisp = (s) => {
    if (!s) return "—"
    const d = new Date(s)
    if (isNaN(d.getTime())) return s
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`
  }

  return (
    <div style={{ width: "100%", background: "#fff", border: "1px solid #c0c4d8", fontFamily: FONT, color: "#222", borderRadius: 4 }}>

      {/* Header */}
      <div style={{ padding: "8px 16px 6px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2.5px solid #0a3a6b" }}>
        <img src="/logo.png" alt="Rangayan Creations" style={{ height: 58, objectFit: "contain" }} />
        <div style={{ fontSize: 10.5, color: "#444", textAlign: "right", lineHeight: 1.7, fontFamily: FONT }}>
          <div><strong>Address:</strong> A-113, NBCC Commercial Complex, Sector-1, Gomtinagar Ext, Lucknow 226010</div>
          <div><strong>Support:</strong> +91-9453495949 &nbsp;|&nbsp; <strong>Email:</strong> support@rangayancreations.com</div>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <colgroup><col style={{ width: "18%" }}/><col style={{ width: "32%" }}/><col style={{ width: "18%" }}/><col style={{ width: "32%" }}/></colgroup>
        <tbody>

          <tr><td colSpan={4} style={titleC}>{template.report_title}</td></tr>

          <tr>
            <td style={labelC}>Department Name</td><td style={valueC}>{tf("department_name")}</td>
            <td style={labelC}>Specifications</td><td style={valueC}>{tf("model_no", { ph: "e.g. HP AIO i5 512SSD 8GB W11" })}</td>
          </tr>
          <tr>
            <td style={{ ...labelC, verticalAlign: "top" }}>Address</td>
            <td style={{ ...cell, verticalAlign: "top" }}>
              {mode === "fill"
                ? <textarea value={v("address")} onChange={(e) => onFill("address", e.target.value)} rows={2} style={{ ...inp, resize: "vertical", minHeight: 34 }} />
                : <span style={{ display: "block", whiteSpace: "pre-wrap", fontFamily: FONT }}>{v("address") || "—"}</span>}
            </td>
            <td style={labelC}>M/C Serial No.</td><td style={cell}>{tf("mc_serial", { mono: true })}</td>
          </tr>
          <tr>
            <td style={labelC}>Brand Name</td><td style={cell}>{tf("device_brand", { ph: "e.g. HP / Dell / Lenovo" })}</td>
            <td style={labelC}>Installation Date</td><td style={cell}>{tf("install_date", { type: "date" })}</td>
          </tr>
          <tr>
            <td style={labelC}>Mobile No.</td><td style={cell}>{tf("tel_no", { type: "tel" })}</td>
            <td style={labelC}>Warranty Period</td><td style={cell}><strong>3 Years</strong></td>
          </tr>
          <tr>
            <td style={labelC}>Email ID</td><td style={cell}>{tf("email", { type: "email" })}</td>
            <td style={labelC}>Warranty Expiry Date</td>
            <td style={cell}><span style={{ color: warrantyExpiry ? "#222" : "#999" }}>{warrantyExpiry || "Auto: install date + 3 yrs"}</span></td>
          </tr>
          <tr>
            <td style={labelC}>Name of User</td><td style={cell}>{tf("contact_person")}</td>
            <td style={labelC}>Room No.</td><td style={cell}>{tf("room_no")}</td>
          </tr>

          <tr><td colSpan={4} style={sectionC}>License / Product Keys</td></tr>
          <tr>
            <td style={labelC}>Windows Key</td>
            <td colSpan={3} style={{ ...cell, fontFamily: MONO, letterSpacing: 1 }}>{tf("win_key", { ph: "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX", mono: true })}</td>
          </tr>
          <tr>
            <td style={labelC}>Windows Version</td><td style={cell}>{tf("win_version", { ph: "e.g. Windows 11 Professional" })}</td>
            <td style={labelC}>Activation Status</td><td style={cell}>{actStatus("win_activation")}</td>
          </tr>
          <tr>
            <td style={labelC}>MS Office Key</td>
            <td colSpan={3} style={{ ...cell, fontFamily: MONO, letterSpacing: 1 }}>{tf("office_key", { ph: "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX", mono: true })}</td>
          </tr>
          <tr>
            <td style={labelC}>MS Office Version</td><td style={cell}>{tf("office_version", { ph: "e.g. MS Office 2021" })}</td>
            <td style={labelC}>Activation Status</td><td style={cell}>{actStatus("office_activation")}</td>
          </tr>
          <tr>
            <td style={labelC}>Antivirus Key</td>
            <td colSpan={3} style={{ ...cell, fontFamily: MONO, letterSpacing: 1 }}>{tf("av_key", { ph: "Enter antivirus product key", mono: true })}</td>
          </tr>
          <tr>
            <td style={labelC}>Antivirus Name</td><td style={cell}>{tf("av_name", { ph: "e.g. Quick Heal" })}</td>
            <td style={labelC}>Activation Status</td><td style={cell}>{actStatus("av_activation")}</td>
          </tr>
          <tr>
            <td style={labelC}>Antivirus Validity</td><td colSpan={3} style={cell}>{tf("av_validity", { ph: "e.g. 3 Years" })}</td>
          </tr>

          <tr><td colSpan={4} style={sectionC}>Installation Checklist &nbsp;(Yes / No)</td></tr>
          {checklist.map((c) => (
            <tr key={c.id}>
              <td colSpan={4} style={cell}>
                {c.label}
                <span style={{ float: "right", paddingLeft: 10 }}>{yesNo(c.id)}</span>
              </td>
            </tr>
          ))}

          {v("ups_model") && <>
            <tr><td colSpan={4} style={{ ...sectionC, background: "#d6edda", color: "#155724" }}>Power Backup / UPS</td></tr>
            <tr>
              <td style={labelC}>Brand / Model</td>
              <td style={cell}><strong>{[v("ups_brand"), v("ups_model")].filter(Boolean).join(" — ")}</strong></td>
              <td style={labelC}>Serial No.</td>
              <td style={{ ...cell, fontFamily: MONO }}>{v("ups_serial") || "—"}</td>
            </tr>
            <tr>
              <td style={labelC}>Warranty Period</td>
              <td style={cell}><strong>{v("ups_warranty")}</strong></td>
              <td style={labelC}>UPS Install Date</td>
              <td style={cell}>{fmtDateDisp(v("ups_install_date"))}</td>
            </tr>
          </>}

          <tr><td colSpan={4} style={sectionC}>Remarks</td></tr>
          <tr>
            <td colSpan={4} style={{ ...cell, height: 34 }}>
              {mode === "fill"
                ? <input type="text" value={v("remarks")} onChange={(e) => onFill("remarks", e.target.value)} style={inp} />
                : <span style={{ display: "block", fontFamily: FONT }}>{v("remarks") || ""}</span>}
            </td>
          </tr>
          <tr>
            <td style={labelC}>Service Date</td><td style={cell}>{tf("service_date", { type: "date" })}</td>
            <td style={labelC}>User Name</td><td style={cell}>{tf("cust_signing")}</td>
          </tr>

        </tbody>
      </table>

      {/* Signatures */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "32px 16px 10px", fontFamily: FONT, fontSize: 12 }}>
        <div style={{ width: "44%", borderTop: "1.5px solid #555", paddingTop: 5, textAlign: "center" }}>{template.footer_left}</div>
        <div style={{ width: "44%", borderTop: "1.5px solid #555", paddingTop: 5, textAlign: "center" }}>{template.footer_right}</div>
      </div>
    </div>
  )
}

// ─── Print HTML (A4, full-page) ──────────────────────────────────────────────
export function buildHpPrintHtml(fillValues, template) {
  const v   = (id) => String(fillValues[id] || "")
  const sel = (id, ch) => fillValues[id] === ch

  const esc = (s) => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")

  const fmtDate = (s) => {
    if (!s) return ""
    const d = new Date(s)
    if (isNaN(d.getTime())) return esc(s)
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`
  }

  const warrantyExpiry = (() => {
    const s = v("install_date"); if (!s) return ""
    const d = new Date(s); if (isNaN(d.getTime())) return ""
    d.setFullYear(d.getFullYear() + 3)
    return fmtDate(d.toISOString().split("T")[0])
  })()

  const tf  = (id, isDate = false) => { const val = isDate ? fmtDate(v(id)) : esc(v(id)); return val || "&nbsp;" }
  const tfMono = (id) => { const val = esc(v(id)); return val ? `<span style="font-family:'Courier New',monospace;letter-spacing:0.8px">${val}</span>` : "&nbsp;" }

  const yn  = (id) => {
    const y = sel(id,"yes"), n = sel(id,"no")
    return `${y?"&#9679;":"&#9675;"}&thinsp;Yes &ensp;${n?"&#9679;":"&#9675;"}&thinsp;No`
  }
  const act = (id) => {
    const a = sel(id,"Activated"), p = sel(id,"Pending")
    return `<span style="white-space:nowrap">${a?"&#9679;":"&#9675;"}&thinsp;Activated &ensp;${p?"&#9679;":"&#9675;"}&thinsp;Pending</span>`
  }

  const F = "'Plus Jakarta Sans','Segoe UI',Arial,sans-serif"
  const M = "'Courier New',monospace"

  const C  = `border:1px solid #c0c4d8;padding:4px 8px;vertical-align:middle;font-size:11px;font-family:${F};color:#1a1a1a;line-height:1.5`
  const L  = `${C};width:17%;font-weight:700;background:#eef0f8;color:#0a3a6b`
  const V  = `${C};width:33%`
  const S  = `border:1px solid #c0c4d8;background:#d8ddf0;font-weight:700;padding:5px 8px;color:#0a3a6b;font-size:10.5px;font-family:${F};letter-spacing:0.5px;text-transform:uppercase`
  const T  = `border:1px solid #c0c4d8;text-align:center;background:#d0e4f5;font-weight:800;letter-spacing:3px;font-size:14px;padding:9px;color:#0a3a6b;text-transform:uppercase;font-family:${F}`

  const checklist = [
    { id: "c1", label: "Hardware unboxing & physical setup" },
    { id: "c3", label: "Windows installation & activation" },
    { id: "c4", label: "MS Office installation & activation" },
    { id: "c5", label: "Antivirus installation & activation" },
    { id: "c7", label: "Windows Updates installed" },
  ]
  const checkRows = checklist.map((c) =>
    `<tr><td style="${C};width:100%">${c.label}<span style="float:right;padding-left:10px">${yn(c.id)}</span></td></tr>`
  ).join("")

  const upsSection = (() => {
    if (!v("ups_model")) return ""
    const SG = `${S};background:#d6edda;color:#155724`
    const LG = `${C};width:22%;font-weight:700;background:#eef0f8;color:#0a3a6b`
    return `
  <table style="margin-top:3px">
    <colgroup><col style="width:22%"><col style="width:28%"><col style="width:22%"><col style="width:28%"></colgroup>
    <tbody>
      <tr><td colspan="4" style="${SG}">Power Backup / UPS</td></tr>
      <tr>
        <td style="${LG}">Brand / Model</td>
        <td style="${C}"><strong>${esc([v("ups_brand"),v("ups_model")].filter(Boolean).join(" — "))}</strong></td>
        <td style="${LG}">Serial No.</td>
        <td style="${C};font-family:${M}">${esc(v("ups_serial")) || "&nbsp;"}</td>
      </tr>
      <tr>
        <td style="${LG}">Warranty Period</td>
        <td style="${C}"><strong>${esc(v("ups_warranty"))}</strong></td>
        <td style="${LG}">UPS Install Date</td>
        <td style="${C}">${fmtDate(v("ups_install_date")) || "&nbsp;"}</td>
      </tr>
    </tbody>
  </table>`
  })()

  return `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8">
<title>${template.report_title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{margin:0;padding:0;background:#fff;font-family:'Plus Jakarta Sans','Segoe UI',Arial,sans-serif;font-size:11px;color:#1a1a1a;line-height:1.45}
  @page{size:A4 portrait;margin:0}
  @media print{*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  .pw{
    width:210mm;min-height:297mm;
    padding:10mm 12mm 8mm;
    box-sizing:border-box;
    display:flex;flex-direction:column;
  }
  .ps{flex:1;min-height:0}
  table{border-collapse:collapse;width:100%;table-layout:fixed}
  td,th{overflow:hidden;word-break:break-word}
  .hdr{display:flex;justify-content:space-between;align-items:center;border-bottom:2.5px solid #0a3a6b;padding-bottom:5px;margin-bottom:4px}
  .hdr-c{font-size:9px;color:#555;text-align:right;line-height:1.7}
  .footer{display:flex;justify-content:space-between;padding-top:28px;font-size:11px}
  .fsig{width:44%;text-align:center;font-weight:600}
  .fsig .fn{margin-bottom:26px;display:block}
  .fsig .fl{border-top:1.5px solid #333;padding-top:4px;display:block}
</style>
</head><body>
<div class="pw">

  <div class="hdr">
    <img src="/logo.png" alt="Rangayan Creations" style="height:50px;object-fit:contain;max-width:44%"/>
    <div class="hdr-c">
      <div><strong>Address:</strong> A-113, NBCC Commercial Complex, Sector-1, Gomtinagar Ext, Lucknow 226010</div>
      <div><strong>Support:</strong> +91-9453495949 &nbsp;|&nbsp; <strong>Email:</strong> support@rangayancreations.com</div>
    </div>
  </div>

  <table style="margin-bottom:3px">
    <tr><td style="${T}">${template.report_title}</td></tr>
  </table>

  <table>
    <colgroup><col style="width:17%"><col style="width:33%"><col style="width:17%"><col style="width:33%"></colgroup>
    <tbody>
      <tr>
        <td style="${L}">Department Name</td><td style="${V}">${tf("department_name")}</td>
        <td style="${L}">Specifications</td><td style="${V}">${tf("model_no")}</td>
      </tr>
      <tr>
        <td style="${L};vertical-align:top">Address</td>
        <td style="${C};white-space:pre-wrap">${esc(v("address")) || "&nbsp;"}</td>
        <td style="${L}">M/C Serial No.</td>
        <td style="${C};font-family:${M}">${esc(v("mc_serial")) || "&nbsp;"}</td>
      </tr>
      <tr>
        <td style="${L}">Brand Name</td><td style="${C}">${tf("device_brand")}</td>
        <td style="${L}">Installation Date</td><td style="${C}">${fmtDate(v("install_date")) || "&nbsp;"}</td>
      </tr>
      <tr>
        <td style="${L}">Mobile No.</td><td style="${C}">${tf("tel_no")}</td>
        <td style="${L}">Warranty Period</td><td style="${C}"><strong>3 Years</strong></td>
      </tr>
      <tr>
        <td style="${L}">Email ID</td><td style="${C}">${tf("email")}</td>
        <td style="${L}">Warranty Expiry Date</td><td style="${C}">${warrantyExpiry || "&nbsp;"}</td>
      </tr>
      <tr>
        <td style="${L}">Name of User</td><td style="${C}">${tf("contact_person")}</td>
        <td style="${L}">Room No.</td><td style="${C}">${tf("room_no")}</td>
      </tr>
    </tbody>
  </table>

  <table style="margin-top:3px">
    <colgroup><col style="width:17%"><col style="width:33%"><col style="width:17%"><col style="width:33%"></colgroup>
    <tbody>
      <tr><td colspan="4" style="${S}">License / Product Keys</td></tr>
      <tr>
        <td style="${L}">Windows Key</td>
        <td colspan="3" style="${C};font-family:${M}">${tfMono("win_key")}</td>
      </tr>
      <tr>
        <td style="${L}">Windows Version</td><td style="${C}">${tf("win_version")}</td>
        <td style="${L}">Activation Status</td><td style="${C}">${act("win_activation")}</td>
      </tr>
      <tr>
        <td style="${L}">MS Office Key</td>
        <td colspan="3" style="${C};font-family:${M}">${tfMono("office_key")}</td>
      </tr>
      <tr>
        <td style="${L}">MS Office Version</td><td style="${C}">${tf("office_version")}</td>
        <td style="${L}">Activation Status</td><td style="${C}">${act("office_activation")}</td>
      </tr>
      <tr>
        <td style="${L}">Antivirus Key</td>
        <td colspan="3" style="${C};font-family:${M}">${tfMono("av_key")}</td>
      </tr>
      <tr>
        <td style="${L}">Antivirus Name</td><td style="${C}">${tf("av_name")}</td>
        <td style="${L}">Activation Status</td><td style="${C}">${act("av_activation")}</td>
      </tr>
      <tr>
        <td style="${L}">Antivirus Validity</td><td colspan="3" style="${C}">${tf("av_validity")}</td>
      </tr>
    </tbody>
  </table>

  <table style="margin-top:3px">
    <tbody>
      <tr><td style="${S}">Installation Checklist &nbsp;(Yes / No)</td></tr>
      ${checkRows}
    </tbody>
  </table>

  ${upsSection}

  <table style="margin-top:3px">
    <tbody>
      <tr><td style="${S}">Remarks</td></tr>
      <tr><td style="${C};height:40px">${tf("remarks")}</td></tr>
    </tbody>
  </table>

  <table style="margin-top:3px">
    <colgroup><col style="width:17%"><col style="width:33%"><col style="width:17%"><col style="width:33%"></colgroup>
    <tbody>
      <tr>
        <td style="${L}">Service Date</td><td style="${C}">${fmtDate(v("service_date")) || "&nbsp;"}</td>
        <td style="${L}">User Name</td><td style="${C}">${tf("cust_signing")}</td>
      </tr>
    </tbody>
  </table>

  <div class="ps"></div>

  <div class="footer">
    <div class="fsig"><span class="fn">${template.footer_left}</span><span class="fl">Signature</span></div>
    <div class="fsig"><span class="fn">&nbsp;</span><span class="fl">${template.footer_right}</span></div>
  </div>

</div>
</body></html>`
}

export function printHpForm(fillValues, template) {
  const html = buildHpPrintHtml(fillValues, template)
  const win  = window.open("", "_blank")
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  const img = win.document.querySelector("img")
  const doPrint = () => {
    if (win.document.fonts?.ready) win.document.fonts.ready.then(() => win.print())
    else win.print()
  }
  if (img && !img.complete) { img.onload = doPrint; img.onerror = doPrint }
  else setTimeout(doPrint, 600)
}

export const HP_TEMPLATE = {
  brand_name:   "Rangayan Creations Pvt. Ltd",
  primary_color:"#0a3a6b",
  report_title: "INSTALLATION REPORT",
  footer_left:  "Avanish Mishra (Engineer)",
  footer_right: "Customer Signature & Stamp",
}

export function HpInstallPrintView({ initialValues = {}, onClose }) {
  const [fillValues, setFillValues] = useState(initialValues)
  const handleFill = (id, val) => setFillValues((prev) => ({ ...prev, [id]: val }))

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex flex-col overflow-hidden">
      <div className="flex-shrink-0 bg-white border-b flex flex-wrap items-center gap-2 px-3 py-2.5">
        <span className="font-semibold text-sm text-[#2D3436]">HP Installation Report</span>
        <span className="text-xs text-gray-400 hidden sm:block">Fill in details, then print</span>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setFillValues(initialValues)} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors">Reset</button>
          <button onClick={() => printHpForm(fillValues, HP_TEMPLATE)} className="flex items-center gap-1.5 bg-[#0096d6] text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-[#0082bb] transition-colors">
            <Printer size={15} /><span className="hidden xs:inline">Print</span>
          </button>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X size={18} /></button>
        </div>
      </div>
      <div className="flex-1 overflow-auto bg-gray-100 p-2 sm:p-4">
        <div className="overflow-x-auto">
          <div style={{ minWidth: 760 }}>
            <HpInstallReport template={HP_TEMPLATE} mode="fill" fillValues={fillValues} onFill={handleFill} />
          </div>
        </div>
      </div>
    </div>
  )
}
