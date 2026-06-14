"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Printer, Save, Check,
  Key, Calendar, User, Monitor, MapPin,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import {
  HpInstallReport,
  HP_TEMPLATE,
  printHpForm,
} from "@/app/components/HpInstallReport";
import {
  PrinterInstallReport,
  printPrinterForm,
  MFP_TEMPLATE,
  SCANNER_TEMPLATE,
  PHOTOCOPIER_TEMPLATE,
} from "@/app/components/PrinterInstallReport";
import {
  CanonPrinterReport,
  printCanonForm,
} from "@/app/components/CanonPrinterReport";
import { printInstallation } from "@/app/components/InstallationModal";
import StatusBadge from "@/app/components/StatusBadge";
import Card from "@/app/components/Card";

// ── Category helpers ──────────────────────────────────────────────────────────

function getDeviceType(category) {
  switch ((category || "").toLowerCase()) {
    case "single printer":         return "canon"
    case "multi-function printer": return "mfp"
    case "scanner":                return "scanner"
    case "photocopier":
    case "photocopy":              return "photocopier"   // DB stores "PhotoCopy"
    default:                       return null
  }
}

function getPrinterTemplate(category) {
  switch ((category || "").toLowerCase()) {
    case "multi-function printer": return MFP_TEMPLATE
    case "scanner":                return SCANNER_TEMPLATE
    case "photocopier":
    case "photocopy":              return PHOTOCOPIER_TEMPLATE
    default:                       return MFP_TEMPLATE
  }
}

// ── Map DB row → HP PC form field values ──────────────────────────────────────
function buildPcFillValues(installation, linkedDevices = []) {
  const cf  = installation.custom_fields || {};
  const p   = installation.products || {};
  const pcf = p.custom_fields || {};
  return {
    install_date:      installation.installation_date?.split("T")[0] || "",
    department_name:
      cf.department_name || pcf.department_name || installation.customer_name || "",
    win_key:
      installation.windows_key   || cf.windows_key   || cf.Windows_Key   || cf.window_key   ||
      pcf.windows_key            || pcf.Windows_Key  || pcf.window_key   || "",
    office_key:
      installation.ms_office_key || cf.ms_office_key || cf.MS_Office_Key || cf.office_key   || cf.Office_Key ||
      pcf.ms_office_key          || pcf.MS_Office_Key || pcf.office_key  || pcf.Office_Key  || "",
    av_key:
      installation.antivirus_key    || cf.antivirus_key    || cf.Antivirus_Key || cf.antivirus ||
      pcf.antivirus_serial_key      || pcf.antivirus_key   || pcf.Antivirus_Key || pcf.antivirus || "",
    eng_name:          installation.installer_name || "",
    mc_serial:         p.serial_number || "",
    model_no:          p.name || "",
    device_brand:      p.brand || "",
    address:           cf.address       || pcf.address    || "",
    state:             cf.state         || "",
    pin:               cf.pin           || "",
    tel_no:            cf.tel_no        || cf.mobile_no   || pcf.tel_no    || pcf.mobile_no  || "",
    email:             cf.email         || cf.email_id    || pcf.email     || pcf.email_id   || "",
    contact_person:    cf.contact_person || cf.name_of_user || pcf.contact_person || pcf.name_of_user || "",
    room_no:           cf.room_no       || pcf.room_no    || "",
    proc_ram_ssd:      cf.proc_ram_ssd  || "i5/8GB/512GB",
    win_version:
      cf.win_version    || cf.windows_version    || pcf.win_version    || pcf.windows_version    || "",
    office_version:
      cf.office_version || cf.ms_office_version  || pcf.office_version || pcf.ms_office_version  || "",
    av_name:
      cf.av_name        || cf.antivirus_name      || pcf.av_name       || pcf.antivirus_name      || "",
    av_validity:
      cf.av_validity    || cf.antivirus_validity  || pcf.av_validity   || pcf.antivirus_validity  || "",
    eng_code:          cf.eng_code || "",
    win_activation:    cf.win_activation    || "",
    office_activation: cf.office_activation || "",
    av_activation:     cf.av_activation     || "",
    hw_serial_key:     cf.hw_serial_key || "",
    remarks:           cf.remarks       || "",
    service_date:      cf.service_date  || new Date().toISOString().split("T")[0],
    cust_signing:      cf.cust_signing  || cf.contact_person || cf.name_of_user || pcf.contact_person || pcf.name_of_user || "",
    c1: cf.c1 || "", c2: cf.c2 || "", c3: cf.c3 || "",
    c4: cf.c4 || "", c5: cf.c5 || "", c6: cf.c6 || "", c7: cf.c7 || "",
    t1: cf.t1 || "", t2: cf.t2 || "", t3: cf.t3 || "",
    t4: cf.t4 || "", t5: cf.t5 || "", t6: cf.t6 || "", t7: cf.t7 || "",
    // Linked UPS (first matched device with category UPS)
    ...(() => {
      const ups = linkedDevices.find(
        (d) => d.products?.category?.toLowerCase() === "ups"
      );
      if (!ups) return {};
      const up = ups.products || {};
      return {
        ups_model:        up.name           || "",
        ups_brand:        up.brand          || "",
        ups_serial:       up.serial_number  || "",
        ups_warranty:     "3 Years",
        ups_install_date: ups.installation_date?.split("T")[0] || "",
      };
    })(),
  };
}

// ── Map DB row → Printer form field values ────────────────────────────────────
function buildPrinterFillValues(installation) {
  const cf  = installation.custom_fields || {};
  const p   = installation.products || {};
  const pcf = p.custom_fields || {};
  const contact_person = cf.contact_person || cf.name_of_user || pcf.contact_person || pcf.name_of_user || "";
  return {
    install_date:    installation.installation_date?.split("T")[0] || "",
    department_name: cf.department_name || pcf.department_name || installation.customer_name || "",
    mc_serial:       p.serial_number || "",
    model_no:        p.name || "",
    device_brand:    p.brand || "",
    address:         cf.address  || pcf.address  || "",
    tel_no:          cf.tel_no   || cf.mobile_no || pcf.tel_no || pcf.mobile_no || "",
    email:           cf.email    || cf.email_admin || cf.email_id  || pcf.email  || pcf.email_id  || "",
    contact_person,
    room_no:         cf.room_no  || pcf.room_no  || "",
    // Device config
    driver_version:  cf.driver_version  || "",
    connectivity:    cf.connectivity    || "",
    ip_address:      cf.ip_address      || "",
    paper_size:      cf.paper_size      || "",
    print_resolution: cf.print_resolution || "",
    toner_model:     cf.toner_model     || "",
    // MFP
    scan_resolution: cf.scan_resolution || "",
    scan_email:      cf.scan_email      || "",
    scan_folder:     cf.scan_folder     || "",
    fax_configured:  cf.fax_configured  || "",
    // Photocopier
    counter_reading: cf.counter_reading || "",
    toner_level:     cf.toner_level     || "",
    // Checklist — default all "yes"
    p1: cf.p1 || "yes", p2: cf.p2 || "yes", p3: cf.p3 || "yes",
    p4: cf.p4 || "yes", p5: cf.p5 || "yes", p6: cf.p6 || "yes", p7: cf.p7 || "yes",
    // Remarks / signing
    remarks:      cf.remarks      || "",
    service_date: cf.service_date || new Date().toISOString().split("T")[0],
    cust_signing: cf.cust_signing || contact_person,
  };
}

// ── Map DB row → Canon Single Printer form field values ───────────────────────
function buildCanonFillValues(installation) {
  const cf  = installation.custom_fields || {};
  const p   = installation.products || {};
  const pcf = p.custom_fields || {};
  return {
    // Customer
    department_name: cf.department_name || pcf.department_name || installation.customer_name || "",
    address:         cf.address         || pcf.address || "",
    name_of_user:    cf.name_of_user    || pcf.name_of_user    || "",
    tel_no:          cf.tel_no          || cf.mobile_no || pcf.tel_no || pcf.mobile_no || "",
    email_admin:     cf.email_admin     || cf.email    || pcf.email   || "",
    room_no:         cf.room_no         || pcf.room_no || "",
    // Toner
    toner_71: cf.toner_71 || "", toner_72: cf.toner_72 || "",
    toner_73: cf.toner_73 || "", toner_74: cf.toner_74 || "",
    // Machine
    model_no:     p.name          || cf.model_no  || "",
    mc_serial:    p.serial_number || cf.mc_serial || "",
    install_date: installation.installation_date?.split("T")[0] || "",
    // Meter
    meter_black_large: cf.meter_black_large || "", meter_black_small: cf.meter_black_small || "", meter_black_xl: cf.meter_black_xl || "",
    meter_color_large: cf.meter_color_large || "", meter_color_small: cf.meter_color_small || "", meter_color_xl: cf.meter_color_xl || "",
    // Power — default "None"
    power_type: cf.power_type || "None",
    // Training — default all "yes"
    tr_doc_align:   cf.tr_doc_align   || "yes", tr_media:       cf.tr_media       || "yes",
    tr_ctrl_panel:  cf.tr_ctrl_panel  || "yes", tr_manual_feed: cf.tr_manual_feed  || "yes",
    tr_two_side:    cf.tr_two_side    || "yes", tr_warming:     cf.tr_warming      || "yes",
    tr_toner_rep:   cf.tr_toner_rep   || "yes", tr_waste_toner: cf.tr_waste_toner  || "yes",
    tr_paper_jam:   cf.tr_paper_jam   || "yes", tr_routine:     cf.tr_routine      || "yes",
    tr_driver:      cf.tr_driver      || "yes", tr_call_log:    cf.tr_call_log     || "yes",
    tr_dos_donts:   cf.tr_dos_donts   || "yes", tr_printout:    cf.tr_printout     || "yes",
    // Environment
    env_ventilation: cf.env_ventilation || "", env_voltage: cf.env_voltage || "",
    env_earthing: cf.env_earthing || "", env_space: cf.env_space || "",
    env_power: cf.env_power || "", env_ac: cf.env_ac || "",
    // Signing
    service_date: cf.service_date || new Date().toISOString().split("T")[0],
    cust_signing: cf.cust_signing || cf.name_of_user || cf.contact_person || pcf.contact_person || "",
    remarks:      cf.remarks      || "",
  };
}

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric", month: "short", day: "numeric",
  });
}

// ── Main component ────────────────────────────────────────────────────────────
export default function InstallationReportView({ installation, branchName, linkedDevices = [] }) {
  const router   = useRouter();
  const supabase = createClient();
  const product  = installation.products || {};
  const category = product.category || "";
  const isPC       = category.toLowerCase() === "pc";
  const deviceType = getDeviceType(category);            // null for UPS / unknown
  const isCanon    = deviceType === "canon";             // Single Printer → Canon report
  const isPrinter  = deviceType !== null && !isCanon;   // mfp / scanner / photocopier
  const printerTemplate = getPrinterTemplate(category);

  const [fillValues, setFillValues] = useState(() =>
    isPC     ? buildPcFillValues(installation, linkedDevices)
    : isCanon ? buildCanonFillValues(installation)
    : buildPrinterFillValues(installation)
  );
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [error,  setError]  = useState(null);

  function handleFill(id, val) {
    setFillValues((prev) => {
      const next = { ...prev, [id]: val };
      if (id === "contact_person" || id === "contact_admin" || id === "name_of_user") next.cust_signing = val;
      return next;
    });
    setSaved(false);
    setError(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const update = isPC
        ? { // ── PC ──────────────────────────────────────────────────────
            installer_name:    fillValues.eng_name    || null,
            installation_date: fillValues.install_date || null,
            windows_key:       fillValues.win_key     || null,
            ms_office_key:     fillValues.office_key  || null,
            antivirus_key:     fillValues.av_key      || null,
            custom_fields: {
              department_name:   fillValues.department_name,
              address:           fillValues.address,
              state:             fillValues.state,
              pin:               fillValues.pin,
              tel_no:            fillValues.tel_no,
              email:             fillValues.email,
              contact_person:    fillValues.contact_person,
              room_no:           fillValues.room_no,
              proc_ram_ssd:      fillValues.proc_ram_ssd,
              win_version:       fillValues.win_version,
              office_version:    fillValues.office_version,
              av_name:           fillValues.av_name,
              av_validity:       fillValues.av_validity,
              eng_code:          fillValues.eng_code,
              win_activation:    fillValues.win_activation,
              office_activation: fillValues.office_activation,
              av_activation:     fillValues.av_activation,
              hw_serial_key:     fillValues.hw_serial_key,
              remarks:           fillValues.remarks,
              service_date:      fillValues.service_date,
              cust_signing:      fillValues.cust_signing,
              c1: fillValues.c1, c2: fillValues.c2, c3: fillValues.c3,
              c4: fillValues.c4, c5: fillValues.c5, c6: fillValues.c6, c7: fillValues.c7,
              t1: fillValues.t1, t2: fillValues.t2, t3: fillValues.t3,
              t4: fillValues.t4, t5: fillValues.t5, t6: fillValues.t6, t7: fillValues.t7,
            },
          }
        : isCanon
        ? { // ── Canon Single Printer ─────────────────────────────────────
            installation_date: fillValues.install_date || null,
            installer_name:    fillValues.engineer_name || null,
            custom_fields: {
              department_name: fillValues.department_name, address: fillValues.address,
              name_of_user: fillValues.name_of_user,
              tel_no: fillValues.tel_no, email_admin: fillValues.email_admin,
              room_no: fillValues.room_no,
              toner_71: fillValues.toner_71, toner_72: fillValues.toner_72,
              toner_73: fillValues.toner_73, toner_74: fillValues.toner_74,
              model_no: fillValues.model_no, mc_serial: fillValues.mc_serial,
              meter_black_large: fillValues.meter_black_large, meter_black_small: fillValues.meter_black_small, meter_black_xl: fillValues.meter_black_xl,
              meter_color_large: fillValues.meter_color_large, meter_color_small: fillValues.meter_color_small, meter_color_xl: fillValues.meter_color_xl,
              power_type: fillValues.power_type,
              tr_doc_align: fillValues.tr_doc_align, tr_media: fillValues.tr_media,
              tr_ctrl_panel: fillValues.tr_ctrl_panel, tr_manual_feed: fillValues.tr_manual_feed,
              tr_two_side: fillValues.tr_two_side, tr_warming: fillValues.tr_warming,
              tr_toner_rep: fillValues.tr_toner_rep, tr_waste_toner: fillValues.tr_waste_toner,
              tr_paper_jam: fillValues.tr_paper_jam, tr_routine: fillValues.tr_routine,
              tr_driver: fillValues.tr_driver, tr_call_log: fillValues.tr_call_log,
              tr_dos_donts: fillValues.tr_dos_donts, tr_printout: fillValues.tr_printout,
              env_ventilation: fillValues.env_ventilation, env_voltage: fillValues.env_voltage,
              env_earthing: fillValues.env_earthing, env_space: fillValues.env_space,
              env_power: fillValues.env_power, env_ac: fillValues.env_ac,
              service_date: fillValues.service_date,
              cust_signing: fillValues.cust_signing, remarks: fillValues.remarks,
            },
          }
        : { // ── MFP / Photocopier ────────────────────────────────────────
            installation_date: fillValues.install_date || null,
            custom_fields: {
              department_name:  fillValues.department_name,
              address:          fillValues.address,
              tel_no:           fillValues.tel_no,
              email:            fillValues.email,
              contact_person:   fillValues.contact_person,
              room_no:          fillValues.room_no,
              driver_version:   fillValues.driver_version,
              connectivity:     fillValues.connectivity,
              ip_address:       fillValues.ip_address,
              paper_size:       fillValues.paper_size,
              print_resolution: fillValues.print_resolution,
              toner_model:      fillValues.toner_model,
              scan_resolution:  fillValues.scan_resolution,
              scan_email:       fillValues.scan_email,
              scan_folder:      fillValues.scan_folder,
              fax_configured:   fillValues.fax_configured,
              counter_reading:  fillValues.counter_reading,
              toner_level:      fillValues.toner_level,
              p1: fillValues.p1, p2: fillValues.p2, p3: fillValues.p3,
              p4: fillValues.p4, p5: fillValues.p5, p6: fillValues.p6, p7: fillValues.p7,
              remarks:      fillValues.remarks,
              service_date: fillValues.service_date,
              cust_signing: fillValues.cust_signing,
            },
          };

      const { error: dbError } = await supabase
        .from("installations")
        .update(update)
        .eq("id", installation.id);

      if (dbError) throw dbError;
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const handlePrint = () => {
    if (isPC) {
      printHpForm(fillValues, HP_TEMPLATE);
    } else if (isCanon) {
      printCanonForm(fillValues);
    } else if (isPrinter) {
      printPrinterForm(fillValues, printerTemplate, deviceType);
    } else {
      printInstallation(
        installation,
        branchName ? [{ id: installation.branch_id, name: branchName }] : [],
      );
    }
  };

  return (
    <div className="w-full">

      {/* ── Top action bar ── */}
      <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-[#6C5CE7] transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">Back to Installations</span>
          <span className="sm:hidden">Back</span>
        </button>

        <div className="flex items-center gap-2 ml-auto">
          {(isPC || isCanon || isPrinter) && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border-2 border-[#6C5CE7] text-[#6C5CE7] hover:bg-[#6C5CE7]/5 transition-colors disabled:opacity-50"
            >
              {saved ? (
                <><Check size={15} className="text-[#00B894]" /><span className="text-[#00B894]">Saved</span></>
              ) : (
                <><Save size={15} />{saving ? "Saving…" : "Save"}</>
              )}
            </button>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-[#6C5CE7] to-[#5A4BD1] hover:shadow-lg transition-shadow"
          >
            <Printer size={15} />
            Print
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ── Page title ── */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-[#EDE7F6] flex items-center justify-center flex-shrink-0">
          <Monitor size={20} className="text-[#6C5CE7]" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-[#2D3436] font-[var(--font-display)]">
            {product.name || "Installation Report"}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-0.5">
            {product.serial_number && (
              <span className="font-mono text-xs text-[#6C5CE7] font-semibold">
                SN: {product.serial_number}
              </span>
            )}
            {product.brand && (
              <span className="text-xs text-gray-500">{product.brand}</span>
            )}
            {product.category && (
              <span className="text-xs bg-[#6C5CE7]/10 text-[#6C5CE7] font-semibold px-1.5 py-0.5 rounded">
                {product.category}
              </span>
            )}
            <StatusBadge status={installation.status} />
          </div>
        </div>
      </div>

      {isPC ? (
        /* ── HP PC Installation Report ── */
        <>
          <p className="text-xs text-gray-400 mb-3">
            Fill in the checklist, activation status, and any remaining fields, then click <strong>Save</strong>. Use <strong>Print</strong> to generate the A4 report.
          </p>
          <HpInstallReport
            template={HP_TEMPLATE}
            mode="fill"
            fillValues={fillValues}
            onFill={handleFill}
          />
        </>
      ) : isCanon ? (
        /* ── Canon Single Printer Installation Report ── */
        <>
          <p className="text-xs text-gray-400 mb-3">
            Fill in customer details, training checklist, and environmental conditions, then click <strong>Save</strong>. Use <strong>Print</strong> to generate the A4 report.
          </p>
          <CanonPrinterReport
            mode="fill"
            fillValues={fillValues}
            onFill={handleFill}
          />
        </>
      ) : isPrinter ? (
        /* ── MFP / Photocopier Installation Report ── */
        <>
          <p className="text-xs text-gray-400 mb-3">
            Fill in the device configuration, checklist, and any remaining fields, then click <strong>Save</strong>. Use <strong>Print</strong> to generate the A4 report.
          </p>
          <PrinterInstallReport
            template={printerTemplate}
            mode="fill"
            fillValues={fillValues}
            onFill={handleFill}
            deviceType={deviceType}
          />
        </>
      ) : (
        /* ── Generic read-only detail (UPS, etc.) ── */
        <div className="space-y-4">
          <Card>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
              <div className="flex items-start gap-2">
                <User size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Customer</div>
                  <div className="font-semibold text-[#2D3436]">{installation.customer_name}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Installer</div>
                  <div className="font-semibold text-[#2D3436]">{installation.installer_name}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs text-gray-400 mb-0.5">Installation Date</div>
                  <div className="font-medium text-[#2D3436]">{formatDate(installation.installation_date)}</div>
                </div>
              </div>
              {branchName && (
                <div className="flex items-start gap-2">
                  <MapPin size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">Branch</div>
                    <div className="font-medium text-[#2D3436]">{branchName}</div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {(installation.windows_key || installation.ms_office_key || installation.antivirus_key) && (
            <Card>
              <div className="text-xs font-bold text-[#2D3436] uppercase tracking-wider flex items-center gap-1.5 mb-3">
                <Key size={13} className="text-[#6C5CE7]" />
                License Keys
              </div>
              <div className="space-y-3">
                {installation.windows_key && (
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">Windows</div>
                    <div className="font-mono text-sm text-[#2D3436] break-all">{installation.windows_key}</div>
                  </div>
                )}
                {installation.ms_office_key && (
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">MS Office</div>
                    <div className="font-mono text-sm text-[#2D3436] break-all">{installation.ms_office_key}</div>
                  </div>
                )}
                {installation.antivirus_key && (
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">Antivirus</div>
                    <div className="font-mono text-sm text-[#2D3436] break-all">{installation.antivirus_key}</div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {installation.notes && (
            <Card>
              <div className="text-xs text-gray-400 mb-1">Notes</div>
              <p className="text-[13px] text-[#2D3436]">{installation.notes}</p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
