"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminDashboard from "../../../components/AdminDashboard";
import { User } from "@/types";
import { STORAGE_KEYS } from "@/lib/browser-storage";
import { usePersistentLocalState } from "@/hooks/usePersistentLocalState";

export default function AdminPage() {
  const router = useRouter();
  const { value: currentUser, isHydrated } = usePersistentLocalState<User | null>(STORAGE_KEYS.currentUser, null);

  useEffect(() => {
    if (isHydrated && (!currentUser || currentUser.role !== "Admin")) {
      router.replace("/");
    }
  }, [currentUser, isHydrated, router]);

  if (!isHydrated || !currentUser || currentUser.role !== "Admin") {
    return (
      <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center text-gold-400 font-bold">
        جاري التحقق من الصلاحيات والتوجه... ⏳
      </div>
    );
  }

  return (
    <AdminDashboard 
      onClose={() => router.push("/")} 
      products={[]}
      categories={[]}
      orders={[]}
      onUpdateProducts={() => {}}
      onUpdateOrders={() => {}}
    />
  );
}