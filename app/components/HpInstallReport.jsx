"use client"

import { useState } from "react"
import { X, Printer } from "lucide-react"

// ─── Inner report (pure render) ────────────────────────────────────────────

function HpInstallReport({ template, mode, fillValues, onFill }) {
  const v = (id) => (typeof fillValues[id] === "string" ? fillValues[id] : "")
  const r = (id, choice) => fillValues[id] === choice

  const cellTd = { border: "1px solid #cfcfcf", padding: "3px 6px", verticalAlign: "middle", fontSize: 11 }
  const labelTd = { ...cellTd, width: "18%", fontWeight: 600 }
  const valueTd = { ...cellTd, width: "32%" }
  const sectionTd = { ...cellTd, background: "#e9e9e9", fontWeight: 700, padding: "4px 6px" }
  const titleTd = { ...cellTd, textAlign: "center", background: "#f1f1f1", fontWeight: 700, letterSpacing: 3, fontSize: 12, padding: "5px" }
  const yesnoTd = { ...cellTd, textAlign: "right", whiteSpace: "nowrap", width: 100 }
  const inp = { width: "100%", border: "none", outline: "none", font: "inherit", background: "transparent", padding: "1px 0" }

  const textField = (id, opts = {}) =>
    mode === "fill" ? (
      <input
        type={opts.type ?? "text"}
        value={v(id)}
        onChange={(e) => onFill(id, e.target.value)}
        placeholder={opts.placeholder}
        style={inp}
      />
    ) : (
      <span style={{ display: "inline-block", borderBottom: "1px solid #aaa", width: "100%", minHeight: 16 }} />
    )

  const yesNo = (id) => (
    <>
      <label style={{ marginLeft: 8 }}>
        <input type="radio" name={id} checked={mode === "fill" && r(id, "yes")} onChange={() => onFill(id, "yes")} disabled={mode !== "fill"} style={{ marginRight: 3 }} />Yes
      </label>
      <label style={{ marginLeft: 8 }}>
        <input type="radio" name={id} checked={mode === "fill" && r(id, "no")} onChange={() => onFill(id, "no")} disabled={mode !== "fill"} style={{ marginRight: 3 }} />No
      </label>
    </>
  )

  const actStatus = (id) => (
    <>
      <label style={{ marginRight: 14 }}>
        <input type="radio" name={id} checked={mode === "fill" && r(id, "Activated")} onChange={() => onFill(id, "Activated")} disabled={mode !== "fill"} style={{ marginRight: 3 }} />Activated
      </label>
      <label>
        <input type="radio" name={id} checked={mode === "fill" && r(id, "Pending")} onChange={() => onFill(id, "Pending")} disabled={mode !== "fill"} style={{ marginRight: 3 }} />Pending
      </label>
    </>
  )

  const checklist = [
    { id: "c1", label: "Hardware unboxing & physical setup" },
    { id: "c2", label: "Power-on test & BIOS check" },
    { id: "c3", label: "Windows installation & activation" },
    { id: "c4", label: "MS Office installation & activation" },
    { id: "c5", label: "Antivirus installation & activation" },
    { id: "c6", label: "All drivers installed (LAN/WiFi/Audio/Display)" },
    { id: "c7", label: "Windows Updates installed" },
  ]
  const training = [
    { id: "t1", label: "Power On / Off procedure" },
    { id: "t2", label: "Login & password management" },
    { id: "t3", label: "File / Folder management" },
    { id: "t4", label: "MS Office basic usage" },
    { id: "t5", label: "Antivirus scanning & updates" },
    { id: "t6", label: "Internet & email usage" },
    { id: "t7", label: "Backup & data safety practices" },
  ]
  const maxRows = Math.max(checklist.length, training.length)

  const installDateVal = v("install_date")
  const warrantyExpiry = (() => {
    if (!installDateVal) return ""
    const d = new Date(installDateVal)
    if (isNaN(d.getTime())) return ""
    d.setFullYear(d.getFullYear() + 3)
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`
  })()

  return (
    <div style={{ maxWidth: 1060, margin: "0 auto", background: "#fff", border: "1px solid #d0d0d0", fontFamily: "Arial, Helvetica, sans-serif", color: "#222" }}>
      {/* Header */}
      <div style={{ padding: "8px 14px 2px 14px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <h1 style={{ fontStyle: "italic", fontWeight: 800, fontSize: 20, margin: 0, color: template.primary_color, letterSpacing: 0.5 }}>
          {template.brand_name}
          {template.tagline && (
            <span style={{ color: "#222", fontStyle: "normal", fontWeight: 600, fontSize: 12, marginLeft: 8 }}>{template.tagline}</span>
          )}
        </h1>
        <div style={{ fontSize: 10, color: "#444", textAlign: "right", lineHeight: 1.4 }}>
          <div><strong>Address:</strong> A-133, NBC Commercial Complex, Sector-1, Gomtinagar</div>
          <div><strong>Support:</strong> +91-9453495949</div>
          <div><strong>Email:</strong> Rangayancreations@gmail.com</div>
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 4, fontSize: 11 }}>
        <tbody>
          <tr><td colSpan={4} style={titleTd}>{template.report_title}</td></tr>

          <tr>
            <td colSpan={2} style={cellTd}></td>
            <td style={labelTd}>Brand Name:</td>
            <td style={valueTd}>{textField("device_brand", { placeholder: "e.g. HP / Dell / Lenovo" })}</td>
          </tr>
          <tr>
            <td style={labelTd}>Customer Name:</td><td style={valueTd}>{textField("customer_name")}</td>
            <td style={labelTd}>Model No:</td><td style={valueTd}>{textField("model_no", { placeholder: "e.g. HP 24-cb1xxx" })}</td>
          </tr>
          <tr>
            <td style={labelTd}>Address:</td><td style={cellTd}>{textField("address")}</td>
            <td style={labelTd}>M/C Serial No:</td><td style={cellTd}>{textField("mc_serial")}</td>
          </tr>
          <tr>
            <td style={labelTd}>State:</td><td style={cellTd}>{textField("state")}</td>
            <td style={labelTd}>Installation Date:</td><td style={cellTd}>{textField("install_date", { type: "date" })}</td>
          </tr>
          <tr>
            <td style={labelTd}>Pin:</td><td style={cellTd}>{textField("pin")}</td>
            <td style={labelTd}>Warranty Period:</td><td style={cellTd}><strong>3 Years</strong></td>
          </tr>
          <tr>
            <td style={labelTd}>Tel No:</td><td style={cellTd}>{textField("tel_no", { type: "tel" })}</td>
            <td style={labelTd}>Warranty Expiry Date:</td>
            <td style={cellTd}>
              <span style={{ color: warrantyExpiry ? "#222" : "#999" }}>
                {warrantyExpiry || "Auto: install date + 3 years"}
              </span>
            </td>
          </tr>
          <tr>
            <td style={labelTd}>Email ID:</td><td style={cellTd}>{textField("email", { type: "email" })}</td>
            <td style={labelTd}>Room No:</td><td style={cellTd}>{textField("room_no")}</td>
          </tr>
          <tr>
            <td style={labelTd}>Contact Person:</td><td colSpan={3} style={cellTd}>{textField("contact_person")}</td>
          </tr>
          <tr>
            <td style={labelTd}>Processor / RAM / SSD:</td>
            <td colSpan={3} style={cellTd}>{textField("proc_ram_ssd", { placeholder: "e.g. i5 / 8GB / 512GB" })}</td>
          </tr>

          {/* License Keys */}
          <tr><td colSpan={4} style={sectionTd}>LICENSE / PRODUCT KEYS</td></tr>
          <tr>
            <td style={labelTd}>Windows Key:</td>
            <td colSpan={3} style={cellTd}>{textField("win_key", { placeholder: "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX" })}</td>
          </tr>
          <tr>
            <td style={labelTd}>Windows Version:</td><td style={cellTd}>{textField("win_version", { placeholder: "e.g. Windows 11 Pro" })}</td>
            <td style={labelTd}>Activation Status:</td><td style={cellTd}>{actStatus("win_activation")}</td>
          </tr>
          <tr>
            <td style={labelTd}>MS Office Key:</td>
            <td colSpan={3} style={cellTd}>{textField("office_key", { placeholder: "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX" })}</td>
          </tr>
          <tr>
            <td style={labelTd}>MS Office Version:</td><td style={cellTd}>{textField("office_version", { placeholder: "e.g. Office 2021 Home & Student" })}</td>
            <td style={labelTd}>Activation Status:</td><td style={cellTd}>{actStatus("office_activation")}</td>
          </tr>
          <tr>
            <td style={labelTd}>Antivirus Key:</td>
            <td colSpan={3} style={cellTd}>{textField("av_key", { placeholder: "Enter antivirus product key" })}</td>
          </tr>
          <tr>
            <td style={labelTd}>Antivirus Name:</td><td style={cellTd}>{textField("av_name", { placeholder: "e.g. Quick Heal / McAfee / Norton" })}</td>
            <td style={labelTd}>Validity:</td><td style={cellTd}>{textField("av_validity", { placeholder: "e.g. 1 Year - till 14/07/2027" })}</td>
          </tr>
          <tr>
            <td style={labelTd}>Serial No Key:</td>
            <td colSpan={3} style={cellTd}>{textField("hw_serial_key", { placeholder: "Device / Hardware serial key" })}</td>
          </tr>

          {/* Checklist + Training */}
          <tr>
            <td colSpan={2} style={sectionTd}>INSTALLATION CHECKLIST&nbsp;&nbsp;(Yes / No)</td>
            <td colSpan={2} style={sectionTd}>CUSTOMER TRAINING (OPERATION)&nbsp;&nbsp;(Yes / No)</td>
          </tr>
          {Array.from({ length: maxRows }).map((_, i) => {
            const c = checklist[i]
            const t = training[i]
            return (
              <tr key={i}>
                {c ? <><td style={cellTd}>{c.label}</td><td style={yesnoTd}>{yesNo(c.id)}</td></> : <><td style={cellTd}></td><td style={yesnoTd}></td></>}
                {t ? <><td style={cellTd}>{t.label}</td><td style={yesnoTd}>{yesNo(t.id)}</td></> : <><td style={cellTd}></td><td style={yesnoTd}></td></>}
              </tr>
            )
          })}

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
            <td style={labelTd}>Customer Name:</td><td style={cellTd}>{textField("cust_signing")}</td>
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

function buildHpPrintHtml(fillValues, template) {
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
    return val
      ? `<span>${val}</span>`
      : `<span style="display:inline-block;border-bottom:1px solid #aaa;width:100%;min-height:14px"></span>`
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

  const C = "border:1px solid #cfcfcf;padding:3px 6px;vertical-align:middle;font-size:11px"
  const L = `${C};width:18%;font-weight:600`
  const V = `${C};width:32%`
  const S = `${C};background:#e9e9e9;font-weight:700;padding:4px 6px`
  const T = `${C};text-align:center;background:#f1f1f1;font-weight:700;letter-spacing:3px;font-size:12px;padding:5px`
  const YN = `${C};text-align:right;white-space:nowrap;width:100px`

  const checklist = [
    { id: "c1", label: "Hardware unboxing & physical setup" },
    { id: "c2", label: "Power-on test & BIOS check" },
    { id: "c3", label: "Windows installation & activation" },
    { id: "c4", label: "MS Office installation & activation" },
    { id: "c5", label: "Antivirus installation & activation" },
    { id: "c6", label: "All drivers installed (LAN/WiFi/Audio/Display)" },
    { id: "c7", label: "Windows Updates installed" },
  ]
  const training = [
    { id: "t1", label: "Power On / Off procedure" },
    { id: "t2", label: "Login & password management" },
    { id: "t3", label: "File / Folder management" },
    { id: "t4", label: "MS Office basic usage" },
    { id: "t5", label: "Antivirus scanning & updates" },
    { id: "t6", label: "Internet & email usage" },
    { id: "t7", label: "Backup & data safety practices" },
  ]
  const maxRows = Math.max(checklist.length, training.length)

  const checkRows = Array.from({ length: maxRows }).map((_, i) => {
    const c = checklist[i], t = training[i]
    return `<tr>
      ${c ? `<td style="${C}">${c.label}</td><td style="${YN}">${yn(c.id)}</td>` : `<td style="${C}"></td><td style="${YN}"></td>`}
      ${t ? `<td style="${C}">${t.label}</td><td style="${YN}">${yn(t.id)}</td>` : `<td style="${C}"></td><td style="${YN}"></td>`}
    </tr>`
  }).join("")

  return `<!DOCTYPE html><html><head>
    <meta charset="UTF-8"><title> </title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#222}
      @page{size:A4 landscape;margin:8mm}
      @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
      table{border-collapse:collapse;width:100%}
    </style>
  </head><body>
    <div style="background:#fff;font-family:Arial,Helvetica,sans-serif;color:#222">
      <div style="padding:8px 14px 2px;display:flex;justify-content:space-between;align-items:flex-start">
        <h1 style="font-style:italic;font-weight:800;font-size:20px;color:${template.primary_color};letter-spacing:.5px;margin:0">
          ${template.brand_name}${template.tagline ? `<span style="color:#222;font-style:normal;font-weight:600;font-size:12px;margin-left:8px">${template.tagline}</span>` : ""}
        </h1>
        <div style="font-size:10px;color:#444;text-align:right;line-height:1.4">
          <div><strong>Address:</strong> A-133, NBC Commercial Complex, Sector-1, Gomtinagar</div>
          <div><strong>Support:</strong> +91-9453495949</div>
          <div><strong>Email:</strong> Rangayancreations@gmail.com</div>
        </div>
      </div>
      <table style="margin-top:4px"><tbody>
        <tr><td colspan="4" style="${T}">${template.report_title}</td></tr>
        <tr>
          <td colspan="2" style="${C}"></td>
          <td style="${L}">Brand Name:</td><td style="${V}">${tf("device_brand")}</td>
        </tr>
        <tr>
          <td style="${L}">Customer Name:</td><td style="${V}">${tf("customer_name")}</td>
          <td style="${L}">Model No:</td><td style="${V}">${tf("model_no")}</td>
        </tr>
        <tr>
          <td style="${L}">Address:</td><td style="${C}">${tf("address")}</td>
          <td style="${L}">M/C Serial No:</td><td style="${C}">${tf("mc_serial")}</td>
        </tr>
        <tr>
          <td style="${L}">State:</td><td style="${C}">${tf("state")}</td>
          <td style="${L}">Installation Date:</td><td style="${C}">${tf("install_date", true)}</td>
        </tr>
        <tr>
          <td style="${L}">Pin:</td><td style="${C}">${tf("pin")}</td>
          <td style="${L}">Warranty Period:</td><td style="${C}"><strong>3 Years</strong></td>
        </tr>
        <tr>
          <td style="${L}">Tel No:</td><td style="${C}">${tf("tel_no")}</td>
          <td style="${L}">Warranty Expiry Date:</td>
          <td style="${C}"><span style="color:${warrantyExpiry?"#222":"#999"}">${warrantyExpiry||"Auto: install date + 3 years"}</span></td>
        </tr>
        <tr>
          <td style="${L}">Email ID:</td><td style="${C}">${tf("email")}</td>
          <td style="${L}">Room No:</td><td style="${C}">${tf("room_no")}</td>
        </tr>
        <tr>
          <td style="${L}">Contact Person:</td><td colspan="3" style="${C}">${tf("contact_person")}</td>
        </tr>
        <tr>
          <td style="${L}">Processor / RAM / SSD:</td>
          <td colspan="3" style="${C}">${tf("proc_ram_ssd")}</td>
        </tr>
        <tr><td colspan="4" style="${S}">LICENSE / PRODUCT KEYS</td></tr>
        <tr>
          <td style="${L}">Windows Key:</td>
          <td colspan="3" style="${C}">${tf("win_key")}</td>
        </tr>
        <tr>
          <td style="${L}">Windows Version:</td><td style="${C}">${tf("win_version")}</td>
          <td style="${L}">Activation Status:</td><td style="${C}">${act("win_activation")}</td>
        </tr>
        <tr>
          <td style="${L}">MS Office Key:</td>
          <td colspan="3" style="${C}">${tf("office_key")}</td>
        </tr>
        <tr>
          <td style="${L}">MS Office Version:</td><td style="${C}">${tf("office_version")}</td>
          <td style="${L}">Activation Status:</td><td style="${C}">${act("office_activation")}</td>
        </tr>
        <tr>
          <td style="${L}">Antivirus Key:</td>
          <td colspan="3" style="${C}">${tf("av_key")}</td>
        </tr>
        <tr>
          <td style="${L}">Antivirus Name:</td><td style="${C}">${tf("av_name")}</td>
          <td style="${L}">Validity:</td><td style="${C}">${tf("av_validity")}</td>
        </tr>
        <tr>
          <td style="${L}">Serial No Key:</td>
          <td colspan="3" style="${C}">${tf("hw_serial_key")}</td>
        </tr>
        <tr>
          <td colspan="2" style="${S}">INSTALLATION CHECKLIST&nbsp;&nbsp;(Yes / No)</td>
          <td colspan="2" style="${S}">CUSTOMER TRAINING (OPERATION)&nbsp;&nbsp;(Yes / No)</td>
        </tr>
        ${checkRows}
        <tr><td colspan="4" style="${S}">REMARKS</td></tr>
        <tr><td colspan="4" style="${C};height:32px">${tf("remarks")}</td></tr>
        <tr>
          <td style="${L}">Service Date:</td><td style="${C}">${tf("service_date", true)}</td>
          <td style="${L}">Customer Name:</td><td style="${C}">${tf("cust_signing")}</td>
        </tr>
      </tbody></table>
      <div style="display:flex;justify-content:space-between;padding:30px 14px 8px;font-size:11px">
        <div style="width:45%;border-top:1px solid #555;padding-top:4px;text-align:center">${template.footer_left}</div>
        <div style="width:45%;border-top:1px solid #555;padding-top:4px;text-align:center">${template.footer_right}</div>
      </div>
    </div>
  </body></html>`
}

function printHpForm(fillValues, template) {
  const html = buildHpPrintHtml(fillValues, template)
  const win = window.open("", "_blank")
  if (!win) return
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => win.print(), 250)
}

// ─── Template config ───────────────────────────────────────────────────────

const HP_TEMPLATE = {
  brand_name: "Rangayan Creations Pvt. Ltd",
  tagline: "",
  primary_color: "#0096d6",
  report_title: "INSTALLATION REPORT",
  footer_left: "Engineer Signature",
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
      <div className="flex-shrink-0 bg-white border-b flex items-center gap-3 px-4 py-2.5">
        <span className="font-semibold text-sm text-[#2D3436]">HP Installation Report</span>
        <span className="text-xs text-gray-400 hidden sm:block">Fill in remaining details, then print</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setFillValues(initialValues)}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
          >
            Reset
          </button>
          <button
            onClick={() => printHpForm(fillValues, HP_TEMPLATE)}
            className="flex items-center gap-1.5 bg-[#0096d6] text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-[#0082bb] transition-colors"
          >
            <Printer size={15} />
            Print
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Scrollable form */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <div>
          <HpInstallReport
            template={HP_TEMPLATE}
            mode="fill"
            fillValues={fillValues}
            onFill={handleFill}
          />
        </div>
      </div>
    </div>
  )
}
