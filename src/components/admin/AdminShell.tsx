"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useMemo, useState } from "react";
import {
  BadgePercent,
  CreditCard,
  FolderTree,
  House,
  LayoutDashboard,
  Menu,
  Package,
  PlusCircle,
  // Settings,
  ShoppingCart,
  ShieldUser,
  SquarePen,
  Users,
  X,
} from "lucide-react";
import clsx from "clsx";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  hint?: string;
};

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, hint: "نظرة عامة" },
  { href: "/admin/products", label: "المنتجات", icon: Package, hint: "كل المنتجات + إضافة" },
  { href: "/admin/categories", label: "التصنيفات", icon: FolderTree, hint: "إدارة الأقسام" },
  { href: "/admin/orders", label: "الطلبات", icon: ShoppingCart, hint: "التتبع والحالات" },
  { href: "/admin/offers", label: "العروض", icon: BadgePercent, hint: "الخصومات والعروض" },
  { href: "/admin/customers", label: "العملاء", icon: Users, hint: "الحسابات والعناوين" },
  { href: "/admin/payments", label: "المدفوعات", icon: CreditCard, hint: "Paymob & الحالات" },
  { href: "/admin/users", label: "المستخدمون", icon: ShieldUser, hint: "تفاصيل المستخدمين" },
  //{ href: "/admin/settings", label: "الإعدادات", icon: Settings, hint: "بيانات المتجر" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

interface AdminShellProps {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  children: ReactNode;
}

export default function AdminShell({ title, subtitle, actions, children }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeSection = useMemo(
    () => navItems.find((item) => isActivePath(pathname, item.href)) ?? navItems[0],
    [pathname]
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_right,_rgba(197,161,83,0.12),_transparent_32%),linear-gradient(180deg,#f8f5ef_0%,#f3efe6_100%)] text-slate-900">
      <div className="flex min-h-screen">
        <aside
          className={clsx(
            "fixed inset-y-0 right-0 z-50 w-[290px] border-l border-slate-200 bg-[#111827] text-white shadow-[0_24px_80px_rgba(15,23,42,0.22)] transition-transform duration-300 lg:translate-x-0",
            mobileOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
              <div>
                <p className="text-[18px] font-semibold tracking-[0.32em] text-amber-300/90">لوحه التحكم</p>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-xl border border-white/10 p-2 text-slate-200 hover:bg-white/5 lg:hidden"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-5 scrollbar-thin">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={clsx(
                      "flex items-start gap-3 rounded-2xl px-4 py-3.5 transition-colors",
                      active ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/15" : "text-slate-300 hover:bg-white/6 hover:text-white"
                    )}
                  >
                    <span className={clsx("mt-0.5 rounded-xl p-2", active ? "bg-slate-950/10" : "bg-white/5")}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1 text-right">
                      <span className="block text-sm font-bold">{item.label}</span>
                      <span className={clsx("block text-[11px]", active ? "text-slate-700" : "text-slate-400")}>{item.hint}</span>
                    </span>
                  </Link>
                );
              })}

              <Link
                href="/admin/products/new"
                onClick={() => setMobileOpen(false)}
                className="mt-4 flex items-center gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3.5 text-amber-200 transition-colors hover:bg-amber-400/15"
              >
                <span className="rounded-xl bg-amber-400 p-2 text-slate-950">
                  <PlusCircle className="h-4 w-4" />
                </span>
                <span className="flex-1 text-right">
                  <span className="block text-sm font-bold">إضافة منتج</span>
                  <span className="block text-[11px] text-amber-100/70">فتح نموذج المنتج الجديد</span>
                </span>
              </Link>
            </nav>

            <div className="border-t border-white/10 p-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="mt-2 flex items-center gap-3 rounded-2xl border border-green-300/30 bg-green-300 px-4 py-3.5 text-slate-950 transition-colors hover:bg-green-400"
              >
                <span className="rounded-xl bg-white/60 p-2 text-slate-950">
                  <House className="h-4 w-4" />
                </span>
                <span className="flex-1 text-right">
                  <span className="block text-sm font-bold">الرجوع للصفحة الرئيسية</span>
                  <span className="block text-[11px] text-slate-800/80">عودة سريعة للمتجر</span>
                </span>
              </Link>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:mr-[290px]">
          <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
            <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="shrink-0 rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm transition-colors hover:bg-slate-50 lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold tracking-[0.28em] text-amber-700/80">ADMIN AREA</p>
                  <h2 className="truncate text-xl font-black text-slate-950 sm:text-2xl">{title}</h2>
                  <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
                </div>
              </div>
              {actions ? <div className="flex flex-wrap items-center gap-2 sm:shrink-0 sm:justify-end">{actions}</div> : null}
            </div>
          </header>

          <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="إغلاق القائمة"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-[45] bg-slate-950/45 lg:hidden"
        />
      ) : null}
    </div>
  );
}