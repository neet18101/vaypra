"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Shield } from "lucide-react";
import Card from "@/app/components/Card";
import SectionTitle from "@/app/components/SectionTitle";

export default function SettingsContent({ profile }) {
  const [formData, setFormData] = useState({
    business_name: profile?.business_name || "",
    gstin: profile?.gstin || "",
    phone: profile?.phone || "",
    email: profile?.email || "",
    address: profile?.address || "",
    state: profile?.state || "",
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [toggles, setToggles] = useState({
    twoFactor: true,
    emailNotifications: true,
    whatsappAlerts: false,
    autoBackup: true,
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggle = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save profile:", err);
    } finally {
      setSaving(false);
    }
  };

  const formFields = [
    { label: "Business Name", key: "business_name", placeholder: "Your business name" },
    { label: "GSTIN", key: "gstin", placeholder: "22AAAAA0000A1Z5" },
    { label: "Phone", key: "phone", placeholder: "+91 9876543210" },
    { label: "Email", key: "email", placeholder: "business@example.com" },
    { label: "Address", key: "address", placeholder: "Full business address" },
    { label: "State", key: "state", placeholder: "Maharashtra" },
  ];

  const toggleOptions = [
    {
      key: "twoFactor",
      title: "Two-Factor Authentication",
      description: "Extra security for your account login",
    },
    {
      key: "emailNotifications",
      title: "Email Notifications",
      description: "Get notified about orders and payments",
    },
    {
      key: "whatsappAlerts",
      title: "WhatsApp Alerts",
      description: "Payment & order alerts on WhatsApp",
    },
    {
      key: "autoBackup",
      title: "Auto Backup",
      description: "Daily cloud backup of your data",
    },
  ];

  return (
    <div>
      {/* Header */}
      <h1 className="text-[24px] font-extrabold font-[var(--font-display)] mb-6">
        Settings
      </h1>

      <div className="max-w-[700px]">
        {/* Business Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="mb-5"
        >
          <Card>
            <SectionTitle icon={Building2} title="Business Profile" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-[12px] font-medium text-[#9699B0] mb-1.5">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    value={formData[field.key]}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E2E4F0] bg-[#F8F9FE] text-[13.5px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7]/20 focus:border-[#6C5CE7] transition-colors"
                  />
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#8B5CF6] text-white text-[13.5px] font-medium shadow-md hover:shadow-lg transition-shadow disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              {success && (
                <span className="text-[13px] text-green-600 font-medium">
                  Saved successfully!
                </span>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Security & Preferences Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <SectionTitle icon={Shield} title="Security & Preferences" />

            <div className="flex flex-col gap-3">
              {toggleOptions.map((option) => (
                <div
                  key={option.key}
                  className="flex items-center justify-between px-4 py-3.5 rounded-[10px] bg-[#F8F9FE]"
                >
                  <div>
                    <h4 className="text-[14px] font-semibold text-gray-900">
                      {option.title}
                    </h4>
                    <p className="text-[12px] text-gray-500 mt-0.5">
                      {option.description}
                    </p>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => handleToggle(option.key)}
                    className="relative w-[44px] h-[24px] rounded-full transition-colors duration-200 flex-shrink-0"
                    style={{
                      background: toggles[option.key] ? "#6C5CE7" : "#D1D5DB",
                    }}
                  >
                    <div
                      className="absolute top-[2px] w-[20px] h-[20px] rounded-full bg-white shadow-sm transition-transform duration-200"
                      style={{
                        transform: toggles[option.key]
                          ? "translateX(22px)"
                          : "translateX(2px)",
                      }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
