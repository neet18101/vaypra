"use client";

import { useState, useEffect, useCallback } from "react";
import { UserPlus, Trash2, Wrench, Mail, Lock, User, X, Check, AlertCircle } from "lucide-react";
import Card from "@/app/components/Card";

export default function TeamContent({ embedded = false }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchMembers = useCallback(async () => {
    const res = await fetch("/api/admin/team");
    const data = await res.json();
    setMembers(data.members || []);
    setLoading(false);
  }, []);

  // Canonical fetch-on-mount: state is only set after the awaited fetch
  // resolves, so it does not cascade synchronous renders.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/admin/create-installer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Failed to create installer");
    } else {
      setSuccess(`Installer "${form.email}" created successfully`);
      setForm({ email: "", password: "", name: "" });
      setShowForm(false);
      setLoading(true);
      fetchMembers();
    }
    setSubmitting(false);
  }

  async function handleDelete(member) {
    if (!confirm(`Remove "${member.email}" from the team? They will lose access immediately.`)) return;
    setDeletingId(member.id);
    const res = await fetch("/api/admin/team", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: member.id }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || "Failed to remove member");
    else { setLoading(true); fetchMembers(); }
    setDeletingId(null);
  }

  const inp = "w-full bg-[#F8F9FE] border border-[#E2E4F0] rounded-[10px] px-4 py-2.5 text-[13.5px] text-[#2D3436] outline-none focus:border-[#6C5CE7] transition-colors";

  return (
    <div className={embedded ? "" : "max-w-2xl mx-auto"}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        {embedded ? (
          <p className="text-sm text-gray-400">Add installers who can log in and record installations.</p>
        ) : (
          <div>
            <h1 className="text-[24px] font-extrabold font-[var(--font-display)]">Team</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage installer accounts</p>
          </div>
        )}
        <button
          onClick={() => { setShowForm(true); setError(""); setSuccess(""); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#8B5CF6] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
        >
          <UserPlus size={16} />
          Add Installer
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <AlertCircle size={15} /> {error}
          <button onClick={() => setError("")} className="ml-auto"><X size={14} /></button>
        </div>
      )}
      {success && (
        <div className="mb-4 flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600">
          <Check size={15} /> {success}
          <button onClick={() => setSuccess("")} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Add installer form */}
      {showForm && (
        <Card className="mb-5 border-2 border-[#6C5CE7]/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-[#2D3436]">New Installer Account</h2>
            <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleCreate} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#9699B0] mb-1.5">
                <User size={11} className="inline mr-1" />Name (optional)
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Installer's full name"
                className={inp}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9699B0] mb-1.5">
                <Mail size={11} className="inline mr-1" />Email *
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="installer@example.com"
                className={inp}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#9699B0] mb-1.5">
                <Lock size={11} className="inline mr-1" />Password *
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min 6 characters"
                className={inp}
                required
                minLength={6}
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold bg-gradient-to-r from-[#6C5CE7] to-[#5A4BD1] hover:shadow-lg transition-shadow disabled:opacity-50"
              >
                {submitting ? "Creating…" : "Create Installer"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 rounded-xl border border-[#E2E4F0] text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Members list */}
      <Card>
        <div className="text-xs font-bold text-[#2D3436] uppercase tracking-wider flex items-center gap-1.5 mb-4">
          <Wrench size={13} className="text-[#6C5CE7]" />
          Installer Members ({members.length})
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-gray-400">Loading…</div>
        ) : members.length === 0 ? (
          <div className="py-10 text-center">
            <UserPlus size={28} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm text-gray-400">No installers yet. Add one above.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-[#F1F2F8] hover:border-[#E2E4F0] transition-colors"
              >
                <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#6C5CE7]/20 to-[#6C5CE7]/10 flex items-center justify-center text-sm font-bold text-[#6C5CE7] flex-shrink-0">
                  {(m.name || m.email).substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  {m.name && (
                    <div className="text-[13px] font-semibold text-[#2D3436] truncate">{m.name}</div>
                  )}
                  <div className="text-[12px] text-gray-500 truncate">{m.email}</div>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#6C5CE7]/10 text-[#6C5CE7]">
                  Installer
                </span>
                <button
                  onClick={() => handleDelete(m)}
                  disabled={deletingId === m.id}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                  title="Remove installer"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
