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
import { printInstallation } from "@/app/components/InstallationModal";
import StatusBadge from "@/app/components/StatusBadge";
import Card from "@/app/components/Card";

// ── Map DB row → HP form field values ────────────────────────────────────────
function buildFillValues(installation) {
  const cf  = installation.custom_fields || {};
  const p   = installation.products || {};
  const pcf = p.custom_fields || {};   // fallback: read keys from product if not on installation
  return {
    // From main installation columns (fall back to product's custom_fields for keys)
    customer_name:     installation.customer_name || "",
    install_date:      installation.installation_date?.split("T")[0] || "",
    win_key:
      installation.windows_key   || cf.windows_key   || cf.Windows_Key   || cf.window_key   ||
      pcf.windows_key            || pcf.Windows_Key  || pcf.window_key   || "",
    office_key:
      installation.ms_office_key || cf.ms_office_key || cf.MS_Office_Key || cf.office_key   || cf.Office_Key ||
      pcf.ms_office_key          || pcf.MS_Office_Key || pcf.office_key  || pcf.Office_Key  || "",
    av_key:
      installation.antivirus_key || cf.antivirus_key || cf.Antivirus_Key || cf.antivirus    ||
      pcf.antivirus_key          || pcf.Antivirus_Key || pcf.antivirus   || "",
    eng_name:          installation.installer_name || "",
    // From product (read-only — never written back)
    mc_serial:         p.serial_number || "",
    model_no:          p.name || "",
    device_brand:      p.brand || "",
    // From custom_fields — PC address / specs
    address:           cf.address || "",
    state:             cf.state || "",
    pin:               cf.pin || "",
    tel_no:            cf.tel_no || "",
    email:             cf.email || "",
    contact_person:    cf.contact_person || "",
    proc_ram_ssd:      cf.proc_ram_ssd || "i5/8GB/512GB",
    win_version:       cf.win_version || "",
    office_version:    cf.office_version || "",
    av_name:           cf.av_name || "",
    av_validity:       cf.av_validity || "",
    eng_code:          cf.eng_code || "",
    // HP report — activation status
    win_activation:    cf.win_activation || "",
    office_activation: cf.office_activation || "",
    av_activation:     cf.av_activation || "",
    // HP report — extra fields
    hw_serial_key:     cf.hw_serial_key || "",
    room_no:           cf.room_no || "",
    remarks:           cf.remarks || "",
    service_date:      cf.service_date || "",
    cust_signing:      cf.cust_signing || "",
    // Installation checklist (c1–c7) and training (t1–t7)
    c1: cf.c1 || "", c2: cf.c2 || "", c3: cf.c3 || "",
    c4: cf.c4 || "", c5: cf.c5 || "", c6: cf.c6 || "", c7: cf.c7 || "",
    t1: cf.t1 || "", t2: cf.t2 || "", t3: cf.t3 || "",
    t4: cf.t4 || "", t5: cf.t5 || "", t6: cf.t6 || "", t7: cf.t7 || "",
  };
}

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric", month: "short", day: "numeric",
  });
}

// ── Main component ────────────────────────────────────────────────────────────
export default function InstallationReportView({ installation, branchName }) {
  const router   = useRouter();
  const supabase = createClient();
  const product  = installation.products || {};
  const isPC     = product.category?.toLowerCase() === "pc";

  const [fillValues, setFillValues] = useState(() => buildFillValues(installation));
  const [saving, setSaving]         = useState(false);
  const [saved,  setSaved]          = useState(false);
  const [error,  setError]          = useState(null);

  function handleFill(id, val) {
    setFillValues((prev) => ({ ...prev, [id]: val }));
    setSaved(false);
    setError(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const { error: dbError } = await supabase
        .from("installations")
        .update({
          customer_name:     fillValues.customer_name  || null,
          installer_name:    fillValues.eng_name       || null,
          installation_date: fillValues.install_date   || null,
          windows_key:       fillValues.win_key        || null,
          ms_office_key:     fillValues.office_key     || null,
          antivirus_key:     fillValues.av_key         || null,
          custom_fields: {
            // PC address / specs
            address:           fillValues.address,
            state:             fillValues.state,
            pin:               fillValues.pin,
            tel_no:            fillValues.tel_no,
            email:             fillValues.email,
            contact_person:    fillValues.contact_person,
            proc_ram_ssd:      fillValues.proc_ram_ssd,
            win_version:       fillValues.win_version,
            office_version:    fillValues.office_version,
            av_name:           fillValues.av_name,
            av_validity:       fillValues.av_validity,
            eng_code:          fillValues.eng_code,
            // Activation
            win_activation:    fillValues.win_activation,
            office_activation: fillValues.office_activation,
            av_activation:     fillValues.av_activation,
            // Extra
            hw_serial_key:     fillValues.hw_serial_key,
            room_no:           fillValues.room_no,
            remarks:           fillValues.remarks,
            service_date:      fillValues.service_date,
            cust_signing:      fillValues.cust_signing,
            // Checklists
            c1: fillValues.c1, c2: fillValues.c2, c3: fillValues.c3,
            c4: fillValues.c4, c5: fillValues.c5, c6: fillValues.c6, c7: fillValues.c7,
            t1: fillValues.t1, t2: fillValues.t2, t3: fillValues.t3,
            t4: fillValues.t4, t5: fillValues.t5, t6: fillValues.t6, t7: fillValues.t7,
          },
        })
        .eq("id", installation.id);

      if (dbError) throw dbError;
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto">

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
          {/* Save — only shown for PC (HP form is editable) */}
          {isPC && (
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

          {/* Print */}
          <button
            onClick={() =>
              isPC
                ? printHpForm(fillValues, HP_TEMPLATE)
                : printInstallation(
                    installation,
                    branchName ? [{ id: installation.branch_id, name: branchName }] : [],
                  )
            }
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
        /* ── HP Installation Report — editable, values saved to DB ── */
        <>
          <p className="text-xs text-gray-400 mb-3">
            Fill in the checklist, activation status, and any remaining fields, then click <strong>Save</strong>. Use <strong>Print</strong> to generate the A4 report.
          </p>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-5 overflow-x-auto">
            <div style={{ minWidth: 760 }}>
              <HpInstallReport
                template={HP_TEMPLATE}
                mode="fill"
                fillValues={fillValues}
                onFill={handleFill}
              />
            </div>
          </div>
        </>
      ) : (
        /* ── Standard installation detail (read-only card) ── */
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
