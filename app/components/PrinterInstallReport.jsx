"use client"

import { useState } from "react"
import { X, Printer } from "lucide-react"

// deviceType: "printer" | "mfp" | "photocopier"

// ─── Shared style constants (module-level, not recreated on render) ─────────
const cellTd    = { border: "1px solid #cfcfcf", padding: "3px 6px", verticalAlign: "middle", fontSize: 11 }
const labelTd   = { ...cellTd, width: "18%", fontWeight: 600, background: "#eef0f8", color: "#0a3a6b", whiteSpace: "nowrap" }
const valueTd   = { ...cellTd, width: "32%" }
const sectionTd = { ...cellTd, background: "#e0e4f0", fontWeight: 700, padding: "4px 6px", color: "#0a3a6b" }
const titleTd   = {
  ...cellTd, textAlign: "center", background: "#dce8f5", fontWeight: 800,
  letterSpacing: 4, fontSize: 14, padding: "7px",
  fontFamily: "'Segoe UI', Arial, sans-serif", color: "#0a3a6b", textTransform: "uppercase",
}
// eslint-disable-next-line react-compiler/react-compiler
const inp = { width: "100%", border: "none", outline: "none", font: "inherit", background: "transparent", padding: "1px 0" }

// ─── Inner report (pure render) ────────────────────────────────────────────

export function PrinterInstallReport({ template, mode, fillValues, onFill, deviceType = "printer" }) {
  const v = (id) => (typeof fillValues[id] === "string" ? fillValues[id] : "")
  const r = (id, choice) => fillValues[id] === choice

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

  const radioGroup = (id, options) => {
    if (mode === "view") {
      const val = fillValues[id]
      return (
        <span style={{ whiteSpace: "nowrap" }}>
          {options.map((opt, i) => (
            <span key={opt} style={{ marginRight: i < options.length - 1 ? 12 : 0 }}>
              {val === opt ? "●" : "○"}&thinsp;{opt}
            </span>
          ))}
        </span>
      )
    }
    return (
      <>
        {options.map((opt, i) => (
          <label key={opt} style={{ marginRight: i < options.length - 1 ? 12 : 0 }}>
            <input
              type="radio"
              name={id}
              checked={mode === "fill" && r(id, opt)}
              onChange={() => onFill(id, opt)}
              disabled={mode !== "fill"}
              style={{ marginRight: 3 }}
            />{opt}
          </label>
        ))}
      </>
    )
  }

  const installDateVal = v("install_date")
  const warrantyExpiry = (() => {
    if (!installDateVal) return ""
    const d = new Date(installDateVal)
    if (isNaN(d.getTime())) return ""
    d.setFullYear(d.getFullYear() + 1)
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
  })()

  const checklist =
    deviceType === "photocopier"
      ? [
          { id: "p1", label: "Hardware unboxing & physical setup" },
          { id: "p2", label: "Toner installed & level verified" },
          { id: "p3", label: "Copy function tested & quality verified" },
          { id: "p4", label: "Counter reading recorded" },
          { id: "p5", label: "Network configuration (if applicable)" },
          { id: "p6", label: "Sort / staple function tested" },
        ]
      : deviceType === "mfp"
      ? [
          { id: "p1", label: "Hardware unboxing & physical setup" },
          { id: "p2", label: "Driver installation completed" },
          { id: "p3", label: "Test print completed & verified" },
          { id: "p4", label: "Network / WiFi configuration" },
          { id: "p5", label: "Scan function tested" },
          { id: "p6", label: "Copy function tested" },
          { id: "p7", label: "Scan-to-email / folder configured" },
        ]
      : [
          { id: "p1", label: "Hardware unboxing & physical setup" },
          { id: "p2", label: "Driver installation completed" },
          { id: "p3", label: "Test print completed & verified" },
          { id: "p4", label: "Network / WiFi configuration" },
          { id: "p5", label: "Print quality verified" },
        ]

  return (
    <div style={{ width: "100%", background: "#fff", border: "1px solid #c0c4d8", fontFamily: "'Plus Jakarta Sans','Segoe UI',Arial,sans-serif", color: "#222", borderRadius: 4 }}>
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

          {/* Customer & Device Info */}
          <tr>
            <td style={labelTd}>Department Name:</td><td style={valueTd}>{textField("department_name")}</td>
            <td style={labelTd}>Model / Specifications:</td><td style={valueTd}>{textField("model_no", { placeholder: "e.g. HP LaserJet Pro M404dn" })}</td>
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
            <td style={cellTd}>{textField("device_brand", { placeholder: "e.g. HP / Canon / Epson" })}</td>
            <td style={labelTd}>Installation Date:</td><td style={cellTd}>{textField("install_date", { type: "date" })}</td>
          </tr>
          <tr>
            <td style={labelTd}>Mobile No.</td><td style={cellTd}>{textField("tel_no", { type: "tel" })}</td>
            <td style={labelTd}>Warranty Period:</td><td style={cellTd}><strong>1 Year</strong></td>
          </tr>
          <tr>
            <td style={labelTd}>Email ID:</td><td style={cellTd}>{textField("email", { type: "email" })}</td>
            <td style={labelTd}>Warranty Expiry Date:</td>
            <td style={cellTd}>
              <span style={{ color: warrantyExpiry ? "#222" : "#999" }}>
                {warrantyExpiry || "Auto: install date + 1 year"}
              </span>
            </td>
          </tr>
          <tr>
            <td style={labelTd}>Name of User:</td><td style={cellTd}>{textField("contact_person")}</td>
            <td style={labelTd}>Room No:</td><td style={cellTd}>{textField("room_no")}</td>
          </tr>

          {/* Device Configuration */}
          <tr><td colSpan={4} style={sectionTd}>DEVICE CONFIGURATION</td></tr>
          <tr>
            <td style={labelTd}>Driver Version:</td>
            <td style={cellTd}>{textField("driver_version", { placeholder: "e.g. v40.4.2526" })}</td>
            <td style={labelTd}>Connectivity:</td>
            <td style={cellTd}>{radioGroup("connectivity", ["USB", "WiFi", "Network"])}</td>
          </tr>
          <tr>
            <td style={labelTd}>IP Address:</td>
            <td style={cellTd}>{textField("ip_address", { placeholder: "e.g. 192.168.1.100" })}</td>
            <td style={labelTd}>Paper Size:</td>
            <td style={cellTd}>{radioGroup("paper_size", ["A4", "A3", "Legal"])}</td>
          </tr>
          <tr>
            <td style={labelTd}>Print Resolution:</td>
            <td style={cellTd}>{textField("print_resolution", { placeholder: "e.g. 600 DPI" })}</td>
            <td style={labelTd}>Toner / Ink Model:</td>
            <td style={cellTd}>{textField("toner_model", { placeholder: "e.g. HP 85A / Canon 052" })}</td>
          </tr>

          {/* MFP-specific: Scan & Copy */}
          {deviceType === "mfp" && <>
            <tr><td colSpan={4} style={sectionTd}>SCAN &amp; COPY CONFIGURATION</td></tr>
            <tr>
              <td style={labelTd}>Scan Resolution:</td>
              <td style={cellTd}>{textField("scan_resolution", { placeholder: "e.g. 600 DPI" })}</td>
              <td style={labelTd}>Scan-to-Email:</td>
              <td style={{ ...cellTd, textAlign: "right" }}>{yesNo("scan_email")}</td>
            </tr>
            <tr>
              <td style={labelTd}>Scan-to-Folder:</td>
              <td style={{ ...cellTd, textAlign: "right" }}>{yesNo("scan_folder")}</td>
              <td style={labelTd}>Fax Configured:</td>
              <td style={{ ...cellTd, textAlign: "right" }}>{yesNo("fax_configured")}</td>
            </tr>
          </>}

          {/* Photocopier-specific */}
          {deviceType === "photocopier" && <>
            <tr><td colSpan={4} style={sectionTd}>PHOTOCOPIER DETAILS</td></tr>
            <tr>
              <td style={labelTd}>Counter Reading:</td>
              <td style={cellTd}>{textField("counter_reading", { placeholder: "e.g. 00000" })}</td>
              <td style={labelTd}>Toner Level:</td>
              <td style={cellTd}>{textField("toner_level", { placeholder: "e.g. New / 75%" })}</td>
            </tr>
          </>}

          {/* Installation Checklist */}
          <tr><td colSpan={4} style={sectionTd}>INSTALLATION CHECKLIST&nbsp;&nbsp;(Yes / No)</td></tr>
          {checklist.map((c) => (
            <tr key={c.id}>
              <td style={cellTd}>{c.label}</td>
              <td colSpan={3} style={{ ...cellTd, textAlign: "right", whiteSpace: "nowrap" }}>{yesNo(c.id)}</td>
            </tr>
          ))}

          {/* Remarks */}
          <tr><td colSpan={4} style={sectionTd}>REMARKS</td></tr>
          <tr>
            <td colSpan={4} style={{ ...cellTd, height: 32 }}>
              {mode === "fill" ? (
                <input type="text" value={v("remarks")} onChange={(e) => onFill("remarks", e.target.value)} style={{ ...inp, height: 28 }} />
              ) : (
                <span style={{ display: "block", height: 28 }}>{v("remarks")}</span>
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

export function buildPrinterPrintHtml(fillValues, template, deviceType = "printer") {
  const v = (id) => String(fillValues[id] || "")
  const sel = (id, choice) => fillValues[id] === choice

  const fmtDate = (s) => {
    if (!s) return ""
    const d = new Date(s)
    if (isNaN(d.getTime())) return s
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
  }

  const warrantyExpiry = (() => {
    const s = v("install_date")
    if (!s) return ""
    const d = new Date(s)
    if (isNaN(d.getTime())) return ""
    d.setFullYear(d.getFullYear() + 1)
    return fmtDate(d.toISOString().split("T")[0])
  })()

  const tf = (id, isDate = false) => {
    const val = isDate ? fmtDate(v(id)) : v(id)
    return val ? `<span>${val}</span>` : ``
  }

  const yn = (id) => {
    const y = sel(id, "yes"), n = sel(id, "no")
    return `<span style="float:right;white-space:nowrap">
      <span style="margin-right:6px">${y ? "&#9679;" : "&#9675;"}&thinsp;Yes</span>
      <span>${n ? "&#9679;" : "&#9675;"}&thinsp;No</span>
    </span>`
  }

  const rg = (id, options) =>
    `<span style="white-space:nowrap">${options
      .map((opt) => `<span style="margin-right:8px">${sel(id, opt) ? "&#9679;" : "&#9675;"}&thinsp;${opt}</span>`)
      .join("")}</span>`

  const F  = "'Segoe UI','Helvetica Neue',Arial,sans-serif"
  const C  = `border:1px solid #bbb;padding:4px 7px;vertical-align:middle;font-size:11px;color:#111;font-family:${F};line-height:1.4`
  const L  = `${C};width:18%;font-weight:700;background:#eef0f8;color:#0a3a6b;white-space:nowrap`
  const V  = `${C};width:32%`
  const S  = `border:1px solid #bbb;background:#e0e4f0;font-weight:700;padding:4px 7px;color:#0a3a6b;font-size:11px;font-family:${F}`
  const T  = `text-align:center;background:#dce8f5;font-weight:800;letter-spacing:3px;font-size:15px;padding:8px;color:#0a3a6b;text-transform:uppercase;font-family:${F};border:1px solid #bbb`

  const checklist =
    deviceType === "photocopier"
      ? [
          { id: "p1", label: "Hardware unboxing & physical setup" },
          { id: "p2", label: "Toner installed & level verified" },
          { id: "p3", label: "Copy function tested & quality verified" },
          { id: "p4", label: "Counter reading recorded" },
          { id: "p5", label: "Network configuration (if applicable)" },
          { id: "p6", label: "Sort / staple function tested" },
        ]
      : deviceType === "mfp"
      ? [
          { id: "p1", label: "Hardware unboxing & physical setup" },
          { id: "p2", label: "Driver installation completed" },
          { id: "p3", label: "Test print completed & verified" },
          { id: "p4", label: "Network / WiFi configuration" },
          { id: "p5", label: "Scan function tested" },
          { id: "p6", label: "Copy function tested" },
          { id: "p7", label: "Scan-to-email / folder configured" },
        ]
      : [
          { id: "p1", label: "Hardware unboxing & physical setup" },
          { id: "p2", label: "Driver installation completed" },
          { id: "p3", label: "Test print completed & verified" },
          { id: "p4", label: "Network / WiFi configuration" },
          { id: "p5", label: "Print quality verified" },
        ]

  const checkRows = checklist
    .map((c) => `<tr><td style="${C};width:76%">${c.label}</td><td style="${C};text-align:right;white-space:nowrap">${yn(c.id)}</td></tr>`)
    .join("")

  const cols = `<colgroup><col style="width:17%"><col style="width:33%"><col style="width:17%"><col style="width:33%"></colgroup>`

  const mfpSection = deviceType === "mfp"
    ? `<table style="margin-top:3px">${cols}<tbody>
        <tr><td colspan="4" style="${S}">SCAN &amp; COPY CONFIGURATION</td></tr>
        <tr>
          <td style="${L}">Scan Resolution</td><td style="${V}">${tf("scan_resolution")}</td>
          <td style="${L}">Scan-to-Email</td><td style="${C};text-align:right">${yn("scan_email")}</td>
        </tr>
        <tr>
          <td style="${L}">Scan-to-Folder</td><td style="${C};text-align:right">${yn("scan_folder")}</td>
          <td style="${L}">Fax Configured</td><td style="${C};text-align:right">${yn("fax_configured")}</td>
        </tr>
      </tbody></table>`
    : ""

  const photocopierSection = deviceType === "photocopier"
    ? `<table style="margin-top:3px">${cols}<tbody>
        <tr><td colspan="4" style="${S}">PHOTOCOPIER DETAILS</td></tr>
        <tr>
          <td style="${L}">Counter Reading</td><td style="${V}">${tf("counter_reading")}</td>
          <td style="${L}">Toner Level</td><td style="${C}">${tf("toner_level")}</td>
        </tr>
      </tbody></table>`
    : ""

  return `<!DOCTYPE html>
<html lang="en"><head>
  <meta charset="UTF-8">
  <title>${template.report_title}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{margin:0;padding:0;background:#fff;font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif;font-size:11px;color:#111;line-height:1.4}
    @page{size:A4 portrait;margin:0}
    @media print{*{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
    .pw{width:210mm;min-height:297mm;padding:10mm 12mm 8mm;box-sizing:border-box;display:flex;flex-direction:column}
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
    <img src="/logo.png" alt="Rangayan Creations" style="height:46px;object-fit:contain;max-width:42%" />
    <div class="hdr-c">
      <div><strong>Address:</strong> A-113, NBCC Commercial Complex, Sector-1, Gomtinagar Ext, Lucknow 226010</div>
      <div><strong>Support:</strong> +91-9453495949 &nbsp;|&nbsp; <strong>Email:</strong> support@rangayancreations.com</div>
    </div>
  </div>

  <table style="margin-bottom:3px">
    <tr><td style="${T}">${template.report_title}</td></tr>
  </table>

  <table>${cols}<tbody>
    <tr>
      <td style="${L}">Department Name</td><td style="${V}">${tf("department_name")}</td>
      <td style="${L}">Model / Specifications</td><td style="${V}">${tf("model_no")}</td>
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
      <td style="${L}">Warranty Period</td><td style="${C}"><strong>1 Year</strong></td>
    </tr>
    <tr>
      <td style="${L}">Email ID</td><td style="${C}">${tf("email")}</td>
      <td style="${L}">Warranty Expiry Date</td><td style="${C}">${warrantyExpiry || ""}</td>
    </tr>
    <tr>
      <td style="${L}">Name of User</td><td style="${C}">${tf("contact_person")}</td>
      <td style="${L}">Room No.</td><td style="${C}">${tf("room_no")}</td>
    </tr>
  </tbody></table>

  <table style="margin-top:3px">${cols}<tbody>
    <tr><td colspan="4" style="${S}">DEVICE CONFIGURATION</td></tr>
    <tr>
      <td style="${L}">Driver Version</td><td style="${C}">${tf("driver_version")}</td>
      <td style="${L}">Connectivity</td><td style="${C}">${rg("connectivity", ["USB", "WiFi", "Network"])}</td>
    </tr>
    <tr>
      <td style="${L}">IP Address</td><td style="${C}">${tf("ip_address")}</td>
      <td style="${L}">Paper Size</td><td style="${C}">${rg("paper_size", ["A4", "A3", "Legal"])}</td>
    </tr>
    <tr>
      <td style="${L}">Print Resolution</td><td style="${C}">${tf("print_resolution")}</td>
      <td style="${L}">Toner / Ink Model</td><td style="${C}">${tf("toner_model")}</td>
    </tr>
  </tbody></table>

  ${mfpSection}
  ${photocopierSection}

  <table style="margin-top:3px">
    <colgroup><col style="width:76%"><col style="width:24%"></colgroup>
    <tbody>
      <tr><td colspan="2" style="${S}">INSTALLATION CHECKLIST &nbsp;(Yes / No)</td></tr>
      ${checkRows}
    </tbody>
  </table>

  <table style="margin-top:3px"><tbody>
    <tr><td style="${S}">REMARKS</td></tr>
    <tr><td style="${C};height:42px">${tf("remarks")}</td></tr>
  </tbody></table>

  <table style="margin-top:3px">${cols}<tbody>
    <tr>
      <td style="${L}">Service Date</td><td style="${C}">${tf("service_date", true)}</td>
      <td style="${L}">User Name</td><td style="${C}">${tf("cust_signing")}</td>
    </tr>
  </tbody></table>

  <div class="ps"></div>

  <div class="footer">
    <div class="fsig"><span class="fn">${template.footer_left}</span><span class="fl">Signature</span></div>
    <div class="fsig"><span class="fn">&nbsp;</span><span class="fl">${template.footer_right}</span></div>
  </div>
</div>
</body></html>`
}

export function printPrinterForm(fillValues, template, deviceType = "printer") {
  const html = buildPrinterPrintHtml(fillValues, template, deviceType)
  const win = window.open("", "_blank")
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
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

// ─── Template configs ──────────────────────────────────────────────────────

export const PRINTER_TEMPLATE = {
  report_title: "PRINTER INSTALLATION REPORT",
  footer_left: "Avanish Mishra (Engineer)",
  footer_right: "Customer Signature & Stamp",
}

export const MFP_TEMPLATE = {
  report_title: "MULTI-FUNCTION PRINTER / SCANNER INSTALLATION REPORT",
  footer_left: "Avanish Mishra (Engineer)",
  footer_right: "Customer Signature & Stamp",
}

export const SCANNER_TEMPLATE = {
  report_title: "SCANNER INSTALLATION REPORT",
  footer_left: "Avanish Mishra (Engineer)",
  footer_right: "Customer Signature & Stamp",
}

export const PHOTOCOPIER_TEMPLATE = {
  report_title: "PHOTOCOPIER INSTALLATION REPORT",
  footer_left: "Avanish Mishra (Engineer)",
  footer_right: "Customer Signature & Stamp",
}

// ─── Exported fullscreen wrapper ───────────────────────────────────────────

export function PrinterInstallPrintView({ initialValues = {}, onClose, deviceType = "printer", template }) {
  const [fillValues, setFillValues] = useState(initialValues)

  function handleFill(id, val) {
    setFillValues((prev) => ({ ...prev, [id]: val }))
  }

  const labelMap = {
    printer: "Printer",
    mfp: "MFP / Scanner",
    photocopier: "Photocopier",
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex flex-col overflow-hidden">
      <div className="flex-shrink-0 bg-white border-b flex flex-wrap items-center gap-2 px-3 py-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-sm text-[#2D3436] whitespace-nowrap">
            {labelMap[deviceType] || "Printer"} Installation Report
          </span>
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
            onClick={() => printPrinterForm(fillValues, template, deviceType)}
            className="flex items-center gap-1.5 bg-[#00CEC9] text-white text-sm font-semibold px-3 py-1.5 rounded-lg hover:bg-[#00A8A3] transition-colors"
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

      <div className="flex-1 overflow-auto bg-gray-100 p-2 sm:p-4">
        <div className="overflow-x-auto">
          <div style={{ minWidth: 760 }}>
            <PrinterInstallReport
              template={template}
              mode="fill"
              fillValues={fillValues}
              onFill={handleFill}
              deviceType={deviceType}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
