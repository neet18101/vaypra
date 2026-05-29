"use client"

import { useState } from "react"
import { X, Printer } from "lucide-react"

// ─── Inner report (pure render) ────────────────────────────────────────────

export function HpInstallReport({ template, mode, fillValues, onFill }) {
  const v = (id) => (typeof fillValues[id] === "string" ? fillValues[id] : "")
  const r = (id, choice) => fillValues[id] === choice

  const cellTd = { border: "1px solid #cfcfcf", padding: "3px 6px", verticalAlign: "middle", fontSize: 11 }
  const labelTd = { ...cellTd, width: "18%", fontWeight: 600 }
  const valueTd = { ...cellTd, width: "32%" }
  const sectionTd = { ...cellTd, background: "#e9e9e9", fontWeight: 700, padding: "4px 6px" }
  const titleTd = { ...cellTd, textAlign: "center", background: "#dce8f5", fontWeight: 800, letterSpacing: 4, fontSize: 14, padding: "7px", fontFamily: "'Segoe UI', Arial, sans-serif", color: "#0a3a6b", textTransform: "uppercase" }
  const yesnoTd = { ...cellTd, textAlign: "right", whiteSpace: "nowrap", width: 100 }
  const inp = { width: "100%", border: "none", outline: "none", font: "inherit", background: "transparent", padding: "1px 0" }

  const textField = (id, opts = {}) => {
    if (mode === "fill") {
      return (
        <input
          type={opts.type ?? "text"}
          value={v(id)}
          onChange={(e) => onFill(id, e.target.value)}
          placeholder={opts.placeholder}
          style={inp}
        />
      )
    }
    if (mode === "view") {
      const val = v(id)
      return (
        <span style={{ display: "inline-block", width: "100%", minHeight: 16, color: val ? "#222" : "#aaa" }}>
          {val || "—"}
        </span>
      )
    }
    return <span style={{ display: "inline-block", borderBottom: "1px solid #aaa", width: "100%", minHeight: 16 }} />
  }

  const yesNo = (id) => {
    if (mode === "view") {
      const val = fillValues[id]
      return (
        <span style={{ float: "right", whiteSpace: "nowrap" }}>
          <span style={{ marginLeft: 8 }}>{val === "yes" ? "●" : "○"}&thinsp;Yes</span>
          <span style={{ marginLeft: 8 }}>{val === "no" ? "●" : "○"}&thinsp;No</span>
        </span>
      )
    }
    return (
      <>
        <label style={{ marginLeft: 8 }}>
          <input type="radio" name={id} checked={mode === "fill" && r(id, "yes")} onChange={() => onFill(id, "yes")} disabled={mode !== "fill"} style={{ marginRight: 3 }} />Yes
        </label>
        <label style={{ marginLeft: 8 }}>
          <input type="radio" name={id} checked={mode === "fill" && r(id, "no")} onChange={() => onFill(id, "no")} disabled={mode !== "fill"} style={{ marginRight: 3 }} />No
        </label>
      </>
    )
  }

  const actStatus = (id) => {
    if (mode === "view") {
      const val = fillValues[id]
      return (
        <span style={{ whiteSpace: "nowrap" }}>
          <span style={{ marginRight: 14 }}>{val === "Activated" ? "●" : "○"}&thinsp;Activated</span>
          <span>{val === "Pending" ? "●" : "○"}&thinsp;Pending</span>
        </span>
      )
    }
    return (
      <>
        <label style={{ marginRight: 14 }}>
          <input type="radio" name={id} checked={mode === "fill" && r(id, "Activated")} onChange={() => onFill(id, "Activated")} disabled={mode !== "fill"} style={{ marginRight: 3 }} />Activated
        </label>
        <label>
          <input type="radio" name={id} checked={mode === "fill" && r(id, "Pending")} onChange={() => onFill(id, "Pending")} disabled={mode !== "fill"} style={{ marginRight: 3 }} />Pending
        </label>
      </>
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
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
  })()

  return (
    <div style={{ maxWidth: 1060, margin: "0 auto", background: "#fff", border: "1px solid #d0d0d0", fontFamily: "'Segoe UI', Arial, Helvetica, sans-serif", color: "#222" }}>
      {/* Header */}
      <div style={{ padding: "6px 14px 4px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #e0e0e0" }}>
        <img src="/logo.png" alt="Rangayan Creations" style={{ height: 56, objectFit: "contain" }} />
        <div style={{ fontSize: 10, color: "#444", textAlign: "right", lineHeight: 1.6 }}>
          <div><strong>Address:</strong> A-113, NBCC Commercial Complex, Sector-1, Gomtinagar Ext Lucknow 226010</div>
          <div><strong>Support:</strong> +91-9453495949</div>
          <div><strong>Email:</strong> support@rangayancreations.com</div>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 4, fontSize: 11 }}>
        <tbody>
          <tr><td colSpan={4} style={titleTd}>{template.report_title}</td></tr>

          <tr>
            <td style={labelTd}>Department Name:</td><td style={valueTd}>{textField("department_name")}</td>
            <td style={labelTd}>Specifications:</td><td style={valueTd}>{textField("model_no", { placeholder: "e.g. HP AIO i5 512SSD 8GB W11" })}</td>
          </tr>
          <tr>
            <td style={labelTd}>Address:</td>
            <td style={{ ...cellTd, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {mode === "fill"
                ? <textarea value={v("address")} onChange={(e) => onFill("address", e.target.value)} rows={2} style={{ ...inp, resize: "vertical", minHeight: 32 }} />
                : <span style={{ display: "block", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{v("address") || "—"}</span>}
            </td>
            <td style={labelTd}>M/C Serial No:</td><td style={cellTd}>{textField("mc_serial")}</td>
          </tr>
          <tr>
            <td style={labelTd}>Brand Name:</td>
            <td style={cellTd}>{textField("device_brand", { placeholder: "e.g. HP / Dell / Lenovo" })}</td>
            <td style={labelTd}>Installation Date:</td><td style={cellTd}>{textField("install_date", { type: "date" })}</td>
          </tr>
          <tr>
            <td style={labelTd}>Mobile No.</td><td style={cellTd}>{textField("tel_no", { type: "tel" })}</td>
            <td style={labelTd}>Warranty Period:</td><td style={cellTd}><strong>3 Years</strong></td>
          </tr>
          <tr>
            <td style={labelTd}>Email ID:</td><td style={cellTd}>{textField("email", { type: "email" })}</td>
            <td style={labelTd}>Warranty Expiry Date:</td>
            <td style={cellTd}>
              <span style={{ color: warrantyExpiry ? "#222" : "#999" }}>
                {warrantyExpiry || "Auto: install date + 3 years"}
              </span>
            </td>
          </tr>
          <tr>
            <td style={labelTd}>Name of User:</td><td style={cellTd}>{textField("contact_person")}</td>
            <td style={labelTd}>Room No:</td><td style={cellTd}>{textField("room_no")}</td>
          </tr>
          {/* License Keys */}
          <tr><td colSpan={4} style={sectionTd}>LICENSE / PRODUCT KEYS</td></tr>
          <tr>
            <td style={labelTd}>Windows Key:</td>
            <td colSpan={3} style={cellTd}>{textField("win_key", { placeholder: "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX" })}</td>
          </tr>
          <tr>
            <td style={labelTd}>Windows Version:</td><td style={cellTd}>{textField("win_version", { placeholder: "e.g. Windows 11 Professional" })}</td>
            <td style={labelTd}>Activation Status:</td><td style={cellTd}>{actStatus("win_activation")}</td>
          </tr>
          <tr>
            <td style={labelTd}>MS Office Key:</td>
            <td colSpan={3} style={cellTd}>{textField("office_key", { placeholder: "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX" })}</td>
          </tr>
          <tr>
            <td style={labelTd}>MS Office Version:</td><td style={cellTd}>{textField("office_version", { placeholder: "e.g. MS Office 2021" })}</td>
            <td style={labelTd}>Activation Status:</td><td style={cellTd}>{actStatus("office_activation")}</td>
          </tr>
          <tr>
            <td style={labelTd}>Antivirus Key:</td>
            <td colSpan={3} style={cellTd}>{textField("av_key", { placeholder: "Enter antivirus product key" })}</td>
          </tr>
          <tr>
            <td style={labelTd}>Antivirus Name:</td><td style={cellTd}>{textField("av_name", { placeholder: "e.g. Quick Heal" })}</td>
            <td style={labelTd}>Activation Status:</td><td style={cellTd}>{actStatus("av_activation")}</td>
          </tr>
          <tr>
            <td style={labelTd}>Antivirus Validity:</td><td colSpan={3} style={cellTd}>{textField("av_validity", { placeholder: "e.g. 3 Years" })}</td>
          </tr>
          {/* Checklist only */}
          <tr>
            <td colSpan={4} style={sectionTd}>INSTALLATION CHECKLIST&nbsp;&nbsp;(Yes / No)</td>
          </tr>
          {checklist.map((c) => (
            <tr key={c.id}>
              <td style={cellTd}>{c.label}</td>
              <td colSpan={3} style={yesnoTd}>{yesNo(c.id)}</td>
            </tr>
          ))}

          {/* Remarks */}
          <tr><td colSpan={4} style={sectionTd}>REMARKS</td></tr>
          <tr>
            <td colSpan={4} style={{ ...cellTd, height: 32 }}>
              {mode === "fill" ? (
                <input type="text" value={v("remarks")} onChange={(e) => onFill("remarks", e.target.value)} style={{ ...inp, height: 28 }} />
              ) : (
                <span style={{ display: "block", borderBottom: "1px solid #aaa", height: 28 }} />
              )}
            </td>
          </tr>

          <tr>
            <td style={labelTd}>Service Date:</td><td style={cellTd}>{textField("service_date", { type: "date" })}</td>
            <td style={labelTd}>User Name:</td><td style={cellTd}>{textField("cust_signing")}</td>
          </tr>
        </tbody>
      </table>

      {/* Signatures */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "30px 14px 8px 14px", fontSize: 11 }}>
        <div style={{ width: "45%", borderTop: "1px solid #555", paddingTop: 4, textAlign: "center" }}>{template.footer_left}</div>
        <div style={{ width: "45%", borderTop: "1px solid #555", paddingTop: 4, textAlign: "center" }}>{template.footer_right}</div>
      </div>
    </div>
  )
}

// ─── Print: generate static HTML from fillValues ──────────────────────────

export function buildHpPrintHtml(fillValues, template) {
  const v = (id) => String(fillValues[id] || "")
  const sel = (id, choice) => fillValues[id] === choice

  const fmtDate = (s) => {
    if (!s) return ""
    const d = new Date(s)
    if (isNaN(d.getTime())) return s
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`
  }

  const warrantyExpiry = (() => {
    const s = v("install_date")
    if (!s) return ""
    const d = new Date(s)
    if (isNaN(d.getTime())) return ""
    d.setFullYear(d.getFullYear() + 3)
    return fmtDate(d.toISOString().split("T")[0])
  })()

  // Render a text value or blank underline
  const tf = (id, isDate = false) => {
    const val = isDate ? fmtDate(v(id)) : v(id)
    return val ? `<span>${val}</span>` : ``
  }

  // Yes / No radio display
  const yn = (id) => {
    const y = sel(id, "yes"), n = sel(id, "no")
    return `<span style="float:right;white-space:nowrap">
      <span style="margin-right:6px">${y ? "&#9679;" : "&#9675;"}&thinsp;Yes</span>
      <span>${n ? "&#9679;" : "&#9675;"}&thinsp;No</span>
    </span>`
  }

  // Activated / Pending radio display
  const act = (id) => {
    const a = sel(id, "Activated"), p = sel(id, "Pending")
    return `<span style="white-space:nowrap">
      <span style="margin-right:10px">${a ? "&#9679;" : "&#9675;"}&thinsp;Activated</span>
      <span>${p ? "&#9679;" : "&#9675;"}&thinsp;Pending</span>
    </span>`
  }

  const C = "border:1px solid #bbb;padding:2px 5px;vertical-align:middle;font-size:9px;color:#111;font-family:Arial,Helvetica,sans-serif;line-height:1.35"
  const L = `${C};width:18%;font-weight:700;background:#eef0f8;color:#0a3a6b`
  const V = `${C};width:32%`
  const S = `${C};background:#d0d0d0;font-weight:700;padding:2px 5px;color:#000`
  const T = `${C};text-align:center;background:#dce8f5;font-weight:800;letter-spacing:3px;font-size:12px;padding:5px 8px;color:#0a3a6b;text-transform:uppercase`

  const checklist = [
    { id: "c1", label: "Hardware unboxing & physical setup" },
    { id: "c3", label: "Windows installation & activation" },
    { id: "c4", label: "MS Office installation & activation" },
    { id: "c5", label: "Antivirus installation & activation" },
    { id: "c7", label: "Windows Updates installed" },
  ]

  const checkRows = checklist.map((c) =>
    `<tr><td style="${C};width:76%">${c.label}</td><td style="${C};text-align:right;white-space:nowrap">${yn(c.id)}</td></tr>`
  ).join("")

  return `<!DOCTYPE html>
<html lang="en"><head>
  <meta charset="UTF-8">
  <title>Installation Report</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:210mm;font-family:Arial,Helvetica,sans-serif;font-size:9px;color:#111;background:#fff;line-height:1.35}
    @page{size:A4 portrait;margin:7mm 8mm}
    @media print{
      html,body{width:210mm}
      *{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    }
    .page-wrap{min-height:calc(297mm - 14mm);display:flex;flex-direction:column}
    .page-spacer{flex:1;min-height:0}
    table{border-collapse:collapse;width:100%;table-layout:fixed}
    td{overflow:hidden;word-break:break-word}
    .hdr{display:flex;justify-content:space-between;align-items:center;border-bottom:2.5px solid #0a3a6b;padding-bottom:4px;margin-bottom:3px}
    .hdr-contact{font-size:8px;color:#444;text-align:right;line-height:1.6}
    .footer{display:flex;justify-content:space-between;padding-top:24px;font-size:9px}
    .footer-sig{width:44%;text-align:center;font-weight:600}
    .footer-sig .sig-name{margin-bottom:22px;display:block}
    .footer-sig .sig-line{border-top:1px solid #000;padding-top:3px;display:block}
  </style>
</head><body>
<div class="page-wrap">
  <!-- Header -->
  <div class="hdr">
    <img src="/logo.png" alt="Rangayan Creations" style="height:38px;object-fit:contain;max-width:45%" />
    <div class="hdr-contact">
      <div><strong>Address:</strong> A-113, NBCC Commercial Complex, Sector-1, Gomtinagar Ext, Lucknow 226010</div>
      <div><strong>Support:</strong> +91-9453495949 &nbsp;|&nbsp; <strong>Email:</strong> support@rangayancreations.com</div>
    </div>
  </div>

  <!-- Report Title -->
  <table style="margin-bottom:2px">
    <tr><td style="${T}">${template.report_title}</td></tr>
  </table>

  <!-- Customer & Machine Info -->
  <table>
    <colgroup>
      <col style="width:17%"><col style="width:33%">
      <col style="width:17%"><col style="width:33%">
    </colgroup>
    <tbody>
      <tr>
        <td style="${L}">Department Name</td><td style="${V}">${tf("department_name")}</td>
        <td style="${L}">Specifications</td><td style="${V}">${tf("model_no")}</td>
      </tr>
      <tr>
        <td style="${L};vertical-align:top">Address</td><td style="${C};white-space:pre-wrap">${tf("address")}</td>
        <td style="${L}">M/C Serial No.</td><td style="${C}">${tf("mc_serial")}</td>
      </tr>
      <tr>
        <td style="${L}">Brand Name</td><td style="${C}">${tf("device_brand")}</td>
        <td style="${L}">Installation Date</td><td style="${C}">${tf("install_date", true)}</td>
      </tr>
      <tr>
        <td style="${L}">Mobile No.</td><td style="${C}">${tf("tel_no")}</td>
        <td style="${L}">Warranty Period</td><td style="${C}"><strong>3 Years</strong></td>
      </tr>
      <tr>
        <td style="${L}">Email ID</td><td style="${C}">${tf("email")}</td>
        <td style="${L}">Warranty Expiry Date</td>
        <td style="${C}">${warrantyExpiry || ""}</td>
      </tr>
      <tr>
        <td style="${L}">Name of User</td><td style="${C}">${tf("contact_person")}</td>
        <td style="${L}">Room No.</td><td style="${C}">${tf("room_no")}</td>
      </tr>
    </tbody>
  </table>

  <!-- License Keys -->
  <table style="margin-top:2px">
    <colgroup>
      <col style="width:17%"><col style="width:33%">
      <col style="width:17%"><col style="width:33%">
    </colgroup>
    <tbody>
      <tr><td colspan="4" style="${S}">LICENSE / PRODUCT KEYS</td></tr>
      <tr>
        <td style="${L}">Windows Key</td>
        <td colspan="3" style="${C};font-family:'Courier New',monospace;letter-spacing:0.5px">${tf("win_key")}</td>
      </tr>
      <tr>
        <td style="${L}">Windows Version</td><td style="${C}">${tf("win_version")}</td>
        <td style="${L}">Activation Status</td><td style="${C}">${act("win_activation")}</td>
      </tr>
      <tr>
        <td style="${L}">MS Office Key</td>
        <td colspan="3" style="${C};font-family:'Courier New',monospace;letter-spacing:0.5px">${tf("office_key")}</td>
      </tr>
      <tr>
        <td style="${L}">MS Office Version</td><td style="${C}">${tf("office_version")}</td>
        <td style="${L}">Activation Status</td><td style="${C}">${act("office_activation")}</td>
      </tr>
      <tr>
        <td style="${L}">Antivirus Key</td>
        <td colspan="3" style="${C};font-family:'Courier New',monospace;letter-spacing:0.5px">${tf("av_key")}</td>
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

  <!-- Checklist -->
  <table style="margin-top:2px">
    <colgroup><col style="width:78%"><col style="width:22%"></colgroup>
    <tbody>
      <tr><td colspan="2" style="${S}">INSTALLATION CHECKLIST &nbsp;(Yes / No)</td></tr>
      ${checkRows}
    </tbody>
  </table>

  <!-- Remarks -->
  <table style="margin-top:2px">
    <tbody>
      <tr><td style="${S}">REMARKS</td></tr>
      <tr><td style="${C};height:36px">${tf("remarks")}</td></tr>
    </tbody>
  </table>

  <!-- Service Date + User Name -->
  <table style="margin-top:2px">
    <colgroup>
      <col style="width:17%"><col style="width:33%">
      <col style="width:17%"><col style="width:33%">
    </colgroup>
    <tbody>
      <tr>
        <td style="${L}">Service Date</td><td style="${C}">${tf("service_date", true)}</td>
        <td style="${L}">User Name</td><td style="${C}">${tf("cust_signing")}</td>
      </tr>
    </tbody>
  </table>

  <!-- Spacer pushes footer to bottom -->
  <div class="page-spacer"></div>

  <!-- Signatures -->
  <div class="footer">
    <div class="footer-sig">
      <span class="sig-name">${template.footer_left}</span>
      <span class="sig-line">Signature</span>
    </div>
    <div class="footer-sig">
      <span class="sig-name">&nbsp;</span>
      <span class="sig-line">${template.footer_right}</span>
    </div>
  </div>
</div>
</body></html>`
}

export function printHpForm(fillValues, template) {
  const html = buildHpPrintHtml(fillValues, template)
  const win = window.open("", "_blank")
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  // Wait for logo + Nunito font to load before printing
  const img = win.document.querySelector("img")
  const doPrint = () => {
    if (win.document.fonts?.ready) {
      win.document.fonts.ready.then(() => win.print())
    } else {
      win.print()
    }
  }
  if (img && !img.complete) {
    img.onload = () => doPrint()
    img.onerror = () => doPrint()
  } else {
    setTimeout(() => doPrint(), 400)
  }
}

// ─── Template config ───────────────────────────────────────────────────────

export const HP_TEMPLATE = {
  brand_name: "Rangayan Creations Pvt. Ltd",
  tagline: "",
  primary_color: "#0096d6",
  report_title: "INSTALLATION REPORT",
  footer_left: "Avanish Mishra (Engineer)",
  footer_right: "Customer Signature & Stamp",
}

// ─── Exported fullscreen wrapper ───────────────────────────────────────────

export function HpInstallPrintView({ initialValues = {}, onClose }) {
  const [fillValues, setFillValues] = useState(initialValues)

  function handleFill(id, val) {
    setFillValues((prev) => ({ ...prev, [id]: val }))
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex-shrink-0 bg-white border-b flex flex-wrap items-center gap-2 px-3 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-sm text-[#2D3436] whitespace-nowrap">HP Installation Report</span>
          <span className="text-xs text-gray-400 hidden sm:block">Fill in details, then print</span>
        </div>
        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setFillValues(initialValues)}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={() => printHpForm(fillValues, HP_TEMPLATE)}
            className="flex items-center gap-1.5 bg-[#0096d6] text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-[#0082bb] transition-colors"
          >
            <Printer size={15} />
            <span className="hidden xs:inline">Print</span>
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Scrollable form — horizontal scroll on small screens */}
      <div className="flex-1 overflow-auto bg-gray-100 p-2 sm:p-4">
        <div className="overflow-x-auto">
          <div style={{ minWidth: 760 }}>
          <HpInstallReport
            template={HP_TEMPLATE}
            mode="fill"
            fillValues={fillValues}
            onFill={handleFill}
          />
          </div>
        </div>
      </div>
    </div>
  )
}
