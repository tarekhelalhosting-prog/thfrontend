"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { Modal, Panel, SectionHeader } from "@/components/admin/admin-kit";
import { User } from "@/types";

const seedUsers: User[] = [
  { id: "1", first_name: "Tarek", last_name: "Helal", phone: "01000000001", role: "Admin", created_at: "2026-01-01", updated_at: "2026-01-01", deleted_at: null },
  { id: "2", first_name: "Mona", last_name: "Mahmoud", phone: "01000000002", role: "Moderator", created_at: "2026-01-10", updated_at: "2026-01-10", deleted_at: null },
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(() => {
    if (typeof window === "undefined") {
      return seedUsers;
    }

    const stored = JSON.parse(window.localStorage.getItem("th_admin_users") || "[]");
    return Array.isArray(stored) && stored.length > 0 ? stored : seedUsers;
  });
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ first_name: "", last_name: "", phone: "", role: "Moderator" as User["role"] });

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return users.filter((user) => !normalizedQuery || `${user.first_name} ${user.last_name}`.toLowerCase().includes(normalizedQuery) || user.phone.toLowerCase().includes(normalizedQuery));
  }, [query, users]);

  const saveUsers = (nextUsers: User[]) => {
    setUsers(nextUsers);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("th_admin_users", JSON.stringify(nextUsers));
    }
  };

  const handleSave = () => {
    const nextUser: User = {
      id: crypto.randomUUID(),
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone,
      role: form.role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };

    saveUsers([nextUser, ...users]);
    setModalOpen(false);
  };

  return (
    <AdminShell
      title="المستخدمون"
      subtitle="هذه الصفحة خاصة فقط بـ Admin و Moderator ولا تعرض العملاء مطلقاً."
      actions={
        <button type="button" onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 rounded-2xl bg-green-300 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-400">
          <Plus className="h-4 w-4" />
          <span>إضافة مستخدم إداري</span>
        </button>
      }
    >
      <Panel>
        <SectionHeader
          eyebrow="Users"
          title="جدول المستخدمين الإداريين"
          subtitle="الاسم، الهاتف، الدور، وتاريخ الإنشاء فقط."
          action={
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500">
              <Search className="h-4 w-4" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث بالاسم أو الهاتف" className="w-44 bg-transparent outline-none" />
            </label>
          }
        />
        <div className="overflow-x-auto px-5 py-5">
          <table className="min-w-full text-right text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="py-3 pl-4">الاسم</th>
                <th className="py-3 pl-4">الهاتف</th>
                <th className="py-3 pl-4">الدور</th>
                <th className="py-3 pl-4">تاريخ الإنشاء</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-4 pl-4 font-bold text-slate-950">{user.first_name} {user.last_name}</td>
                  <td className="py-4 pl-4 text-slate-600">{user.phone}</td>
                  <td className="py-4 pl-4 text-slate-600">{user.role}</td>
                  <td className="py-4 pl-4 text-slate-500">{new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(new Date(user.created_at))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal
        open={modalOpen}
        title="إضافة مستخدم إداري"
        subtitle="Admin أو Moderator فقط."
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700">إلغاء</button>
            <button type="button" onClick={handleSave} className="rounded-2xl bg-green-300 px-4 py-2.5 text-sm font-bold text-white">حفظ</button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-slate-700">الاسم الأول<input value={form.first_name} onChange={(event) => setForm((current) => ({ ...current, first_name: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400" /></label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">اسم العائلة<input value={form.last_name} onChange={(event) => setForm((current) => ({ ...current, last_name: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400" /></label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">الهاتف<input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400" /></label>
          <label className="grid gap-2 text-sm font-bold text-slate-700">الدور<select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as User["role"] }))} className="rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-amber-400"><option value="Admin">Admin</option><option value="Moderator">Moderator</option></select></label>
        </div>
      </Modal>
    </AdminShell>
  );
}
