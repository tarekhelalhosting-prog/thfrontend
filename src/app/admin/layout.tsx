"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthSession } from "@/hooks/useAuthSession";

// Admin and Moderator share identical permissions on the backend - both are
// treated as authorized staff for every route under /admin.
export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { currentUser, isHydrated } = useAuthSession();
  const isAuthorizedStaff = currentUser?.role === "Admin" || currentUser?.role === "Moderator";

  useEffect(() => {
    if (isHydrated && !isAuthorizedStaff) {
      router.replace("/");
    }
  }, [isHydrated, isAuthorizedStaff, router]);

  if (!isHydrated || !isAuthorizedStaff) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        جاري التحقق من الصلاحيات... ⏳
      </div>
    );
  }

  return <>{children}</>;
}
