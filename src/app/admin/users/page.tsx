"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit3, Search, ShieldAlert, Trash2 } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import { EmptyState, Modal, Panel, SectionHeader } from "@/components/admin/admin-kit";
import InlineBanner from "@/components/ui/InlineBanner";
import { useAuthSession } from "@/hooks/useAuthSession";
import { deleteDashboardUser, fetchDashboardUsers, updateDashboardUser } from "@/lib/api";
import { User } from "@/types";

const ROLE_OPTIONS: { value: User["role"] | "ALL"; label: string }[] = [
  { value: "ALL", label: "كل الأدوار" },
  { value: "Admin", label: "مدير" },
  { value: "Moderator", label: "مشرف" },
  { value: "Customer", label: "عميل" },
];

export default function UsersPage() {
  const { currentUser } = useAuthSession();
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<User["role"] | "ALL">("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<User["role"]>("Customer");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        setIsLoading(true);
        setLoadError("");
        const result = await fetchDashboardUsers();
        if (!cancelled) {
          setUsers(result);
        }
      } catch {
        if (!cancelled) {
          setLoadError("تعذر جلب قائمة المستخدمين من الخادم.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return users.filter((user) => {
      const matchesQuery = !normalizedQuery || `${user.first_name} ${user.last_name}`.toLowerCase().includes(normalizedQuery) || user.phone.toLowerCase().includes(normalizedQuery);
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      return matchesQuery && matchesRole;
    });
  }, [query, roleFilter, users]);

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFirstName(user.first_name);
    setLastName(user.last_name);
    setPhone(user.phone);
    setPassword("");
    setRole(user.role);
    setIsActive(user.is_active);
    setFormError("");
  };

  const handleSave = () => {
    if (!editingUser) {
      return;
    }

    void (async () => {
      try {
        setIsSaving(true);
        setFormError("");
        const updated = await updateDashboardUser(editingUser.id, {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone: phone.trim(),
          role,
          is_active: isActive,
          ...(password.trim() ? { password: password.trim() } : {}),
        });
        setUsers((current) => current.map((user) => (user.id === editingUser.id ? updated : user)));
        setEditingUser(null);
      } catch (error) {
        setFormError(error instanceof Error ? error.message : "تعذر حفظ التعديلات");
      } finally {
        setIsSaving(false);
      }
    })();
  };

  const handleDelete = (user: User) => {
    void (async () => {
      if (!window.confirm(`هل تريد حذف حساب ${user.first_name} ${user.last_name}؟ لا يمكن التراجع عن هذا الإجراء.`)) {
        return;
      }

      try {
        await deleteDashboardUser(user.id);
        setUsers((current) => current.filter((item) => item.id !== user.id));
      } catch (error) {
        window.alert(error instanceof Error ? error.message : "تعذر حذف المستخدم");
      }
    })();
  };

  return (
    <AdminShell
      title="المستخدمون"
      subtitle="إدارة كل الحسابات المسجّلة (مديرين، مشرفين، وعملاء) مباشرة من الخادم."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as User["role"] | "ALL")} className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none">
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500">
            <Search className="h-4 w-4" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ابحث بالاسم أو الهاتف" className="w-44 bg-transparent outline-none" />
          </label>
        </div>
      }
    >
      <Panel>
        <SectionHeader eyebrow="Users" title="جدول المستخدمين" subtitle="الاسم، الهاتف، الدور، والحالة  " />
        {loadError ? <div className="px-5 pt-4"><InlineBanner tone="error" message={loadError} /></div> : null}
        <div className="overflow-x-auto px-5 py-5">
          <table className="min-w-full text-right text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="py-3 pl-4">الاسم</th>
                <th className="py-3 pl-4">الهاتف</th>
                <th className="py-3 pl-4">الدور</th>
                <th className="py-3 pl-4">الحالة</th>
                <th className="py-3 pl-4">تاريخ الإنشاء</th>
                <th className="py-3 pl-4">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="py-10 text-center text-slate-500">جاري تحميل المستخدمين...</td></tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const isSelf = currentUser?.id === user.id;

                  return (
                    <tr key={user.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-4 pl-4 font-bold text-slate-950">{user.first_name} {user.last_name}</td>
                      <td className="py-4 pl-4 text-slate-600">{user.phone}</td>
                      <td className="py-4 pl-4 text-slate-600">{user.role}</td>
                      <td className="py-4 pl-4">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold ${user.is_active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
                          {user.is_active ? "نشط" : "موقوف"}
                        </span>
                      </td>
                      <td className="py-4 pl-4 text-slate-500">{new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(new Date(user.created_at))}</td>
                      <td className="py-4 pl-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <button type="button" onClick={() => openEditModal(user)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>تعديل</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(user)}
                            disabled={isSelf}
                            title={isSelf ? "لا يمكنك حذف حسابك الحالي" : undefined}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>حذف</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={6} className="py-10"><EmptyState title="لا توجد بيانات مستخدمين" description="سيظهر هنا أي حساب مسجّل تلقائياً." /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal
        open={Boolean(editingUser)}
        title="تعديل بيانات المستخدم"
        subtitle="تعديل الاسم، الهاتف، الدور، الحالة، أو تعيين كلمة مرور جديدة."
        onClose={() => setEditingUser(null)}
        footer={
          <>
            <button type="button" onClick={() => setEditingUser(null)} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">إلغاء</button>
            <button type="button" onClick={handleSave} disabled={isSaving} className="rounded-2xl bg-green-300 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-400 disabled:opacity-60">حفظ</button>
          </>
        }
      >
        <div className="grid gap-4">
          {editingUser && currentUser?.id === editingUser.id ? (
            <InlineBanner tone="warning" message="هذا حسابك الحالي — لا يسمح الخادم بتعديل أو حذف حسابك الخاص من هنا." />
          ) : null}
          {formError ? <InlineBanner tone="error" message={formError} /> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              الاسم الأول
              <input value={firstName} onChange={(event) => setFirstName(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-400" />
            </label>
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              الاسم الأخير
              <input value={lastName} onChange={(event) => setLastName(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-400" />
            </label>
          </div>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            رقم الهاتف
            <input value={phone} onChange={(event) => setPhone(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-400" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-slate-700">
              الدور
              <select value={role} onChange={(event) => setRole(event.target.value as User["role"])} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-400">
                <option value="Admin">مدير</option>
                <option value="Moderator">مشرف</option>
                <option value="Customer">عميل</option>
              </select>
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700">
              <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="h-4 w-4" />
              الحساب نشط
            </label>
          </div>
          <label className="grid gap-2 text-sm font-bold text-slate-700">
            كلمة مرور جديدة (اختياري)
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="اتركه فارغًا للإبقاء على كلمة المرور الحالية" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-400" />
          </label>
          <div className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <span>لا يمكن حذف آخر حساب مدير في النظام، ولا يمكن لأي مدير تعديل أو حذف حسابه الخاص من هذه الشاشة.</span>
          </div>
        </div>
      </Modal>
    </AdminShell>
  );
}
