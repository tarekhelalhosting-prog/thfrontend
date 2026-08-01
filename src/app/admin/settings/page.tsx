"use client";

import AdminShell from "@/components/admin/AdminShell";
import { Panel, SectionHeader } from "@/components/admin/admin-kit";

export default function SettingsPage() {
  return (
    <AdminShell title="الإعدادات" subtitle="ميزة الإعدادات موقوفة بعد إلغاء دعمها من الباك إند.">
      <Panel>
        <SectionHeader
          eyebrow="Disabled"
          title="إعدادات الموقع متوقفة"
          subtitle="تم إلغاء تكامل Site Settings من الخادم، لذلك تم تعطيل هذه الصفحة مؤقتًا."
        />

        <div className="px-5 pb-6">
          <div className="rounded-2xl border border-amber-300/40 bg-amber-50 px-4 py-4 text-sm font-bold text-amber-700">
            لا يوجد حاليًا حفظ أو تحميل لإعدادات الموقع من الباك إند.
          </div>
        </div>
      </Panel>
    </AdminShell>
  );
}
