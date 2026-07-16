"use client";

import React, { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clipboard,
  Eye,
  EyeOff,
  Phone,
  ShieldAlert,
  User,
  X,
} from "lucide-react";
import { User as UserType, Order } from "../src/types";
import { loginUser, registerUser } from "../src/lib/api";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType | null;
  onLogin: (user: UserType) => void;
  orders: Order[];
}

export default function AccountModal({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  orders,
}: AccountModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loginData, setLoginData] = useState({
    phone: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    city: "الدقهلية",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const displayUserFullName = useMemo(() => {
    if (!currentUser) {
      return "";
    }

    return `${currentUser.first_name} ${currentUser.last_name}`.trim() || "مستخدم";
  }, [currentUser]);

  const isCurrentUserAdmin = currentUser?.role === "Admin";

  const userOrders = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    return orders.filter((order) => order.user_id === currentUser.id);
  }, [orders, currentUser]);

  const formatPrice = (price: number) => {
    return `${price.toLocaleString("en-EG")} جنيه`;
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    void (async () => {
      if (!loginData.phone || !loginData.password) {
        setErrorMessage("الرجاء إدخال رقم الهاتف وكلمة المرور.");
        return;
      }

      setErrorMessage("");
      setSuccessMessage("");
      setIsSubmitting(true);

      try {
        const result = await loginUser({
          phone: loginData.phone,
          password: loginData.password,
        });

        onLogin(result.user);
        setSuccessMessage("تم تسجيل الدخول بنجاح! أهلا بك مجددا.");
        setTimeout(() => {
          setSuccessMessage("");
          onClose();
        }, 1200);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "تعذر تسجيل الدخول حاليا. حاول مرة اخرى."
        );
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    void (async () => {
      const { first_name, last_name, phone, password, confirmPassword } = registerData;

      if (!first_name || !last_name || !phone || !password) {
        setErrorMessage("الرجاء ملء بيانات الحساب الاساسية.");
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage("كلمتا المرور غير متطابقتين.");
        return;
      }

      setErrorMessage("");
      setSuccessMessage("");
      setIsSubmitting(true);

      try {
        const result = await registerUser({
          first_name,
          last_name,
          phone,
          password,
        });

        onLogin(result.user);
        setSuccessMessage("تم إنشاء الحساب بنجاح. يمكنك إكمال العنوان أثناء الطلب.");
        setTimeout(() => {
          setSuccessMessage("");
          onClose();
        }, 1200);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "تعذر إنشاء الحساب حاليا. حاول مرة اخرى."
        );
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-dark-border bg-dark-bg p-5 text-right font-sans shadow-2xl sm:p-7">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 rounded-lg border border-dark-border bg-dark-card p-2 text-gray-400 transition-colors hover:text-white"
        >
          <X size={18} />
        </button>

        {currentUser ? (
          <div>
            <div className="mb-5 flex items-center gap-3 border-b border-dark-border pb-4">
              <div className="shrink-0 rounded-xl border border-gold-400 bg-gold-400/10 p-2.5 text-gold-400">
                <User size={22} />
              </div>
              <div>
                <h3 className="text-base font-black text-white sm:text-lg">{displayUserFullName}</h3>
                <span className="mt-0.5 inline-block rounded-full bg-gold-400/10 px-2 py-0.5 text-[10px] font-bold text-gold-400">
                  {isCurrentUserAdmin ? "لوحة المدير مفعلة" : "حساب مهني / كوافير معتمد"}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2.5 rounded-xl border border-dark-border bg-dark-card p-4 text-xs">
                <h4 className="border-b border-dark-border/40 pb-1.5 font-bold text-gray-300">
                  بيانات التوصيل والتواصل:
                </h4>
                <div className="flex items-center gap-2 text-gray-400">
                  <Phone size={14} className="text-gold-500" />
                  <span>
                    رقم الهاتف: <span className="font-mono text-white">{currentUser.phone || "غير مسجل"}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <User size={14} className="text-gold-500" />
                  <span>
                    صلاحية الحساب: <span className="font-mono text-white">{currentUser.role}</span>
                  </span>
                </div>
              </div>

              <div>
                <h4 className="mb-2.5 text-xs font-bold text-gray-400">
                  تاريخ طلباتك وتجهيزات الصالون الخاص بك:
                </h4>
                {userOrders.length === 0 ? (
                  <div className="rounded-xl border border-dark-border/60 bg-dark-card/50 p-6 text-center">
                    <Clipboard size={24} className="mx-auto mb-2 text-gray-600" />
                    <p className="text-xs text-gray-400">ليس لديك أي طلبات سابقة مسجلة حاليا.</p>
                  </div>
                ) : (
                  <div className="max-h-52 space-y-2.5 overflow-y-auto pr-1">
                    {userOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between rounded-xl border border-dark-border bg-dark-card p-3 text-xs"
                      >
                        <div className="space-y-1">
                          <p className="font-bold text-white">
                            طلب رقم: <span className="font-mono text-gold-400">{order.orderNumber || order.id.slice(0, 8).toUpperCase()}</span>
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {order.created_at ? new Date(order.created_at).toLocaleDateString("ar-EG") : ""}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {order.items?.length || 0} منتجات - الإجمالي: <span className="font-bold text-white">{formatPrice(order.total)}</span>
                          </p>
                        </div>
                        <div className="space-y-1 text-left">
                          <span
                            className={`inline-block rounded px-2 py-0.5 text-[9px] font-bold ${
                              order.payment?.status === "Paid"
                                ? "bg-green-500/10 text-green-400"
                                : "bg-yellow-500/10 text-yellow-500"
                            }`}
                          >
                            {order.payment?.status === "Paid" ? "تم الدفع بنجاح" : "الدفع عند الاستلام"}
                          </span>
                          <span
                            className={`block text-[9px] font-bold ${
                              order.status === "Completed" ? "text-green-400" : "text-gold-400"
                            }`}
                          >
                            {order.status === "Pending"
                              ? "قيد التأكيد"
                              : order.status === "Processing"
                                ? "جاري التجهيز"
                                : order.status === "Ready"
                                  ? "جاهز للاستلام"
                                  : order.status === "Completed"
                                    ? "تم التسليم"
                                    : "تم الإلغاء"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6 flex border-b border-dark-border">
              <button
                onClick={() => {
                  setActiveTab("login");
                  setErrorMessage("");
                }}
                className={`flex-1 border-b-2 pb-3 text-center text-sm font-bold transition-all ${
                  activeTab === "login"
                    ? "border-gold-400 text-gold-500"
                    : "border-transparent text-gray-500"
                }`}
              >
                تسجيل الدخول للصالونات
              </button>
              <button
                onClick={() => {
                  setActiveTab("register");
                  setErrorMessage("");
                }}
                className={`flex-1 border-b-2 pb-3 text-center text-sm font-bold transition-all ${
                  activeTab === "register"
                    ? "border-gold-400 text-gold-500"
                    : "border-transparent text-gray-500"
                }`}
              >
                إنشاء حساب صالون جديد
              </button>
            </div>

            {successMessage && (
              <div className="mb-4 flex items-center justify-center gap-1.5 rounded-xl border border-green-500 bg-green-500/10 p-3 text-center text-xs font-bold text-green-400">
                <CheckCircle2 size={16} />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 rounded-xl border border-red-500 bg-red-500/10 p-3 text-center text-xs font-bold text-red-400">
                {errorMessage}
              </div>
            )}

            {activeTab === "login" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400">رقم الهاتف الفعال لصالونك *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: 01001234567"
                    value={loginData.phone}
                    onChange={(e) => setLoginData((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full rounded-xl border border-dark-border bg-dark-card px-4 py-2.5 text-left font-mono text-xs text-white focus:border-gold-400 focus:outline-none sm:text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400">كلمة المرور *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="كلمة المرور الخاصة بحسابك"
                      value={loginData.password}
                      onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                      className="w-full rounded-xl border border-dark-border bg-dark-card py-2.5 pl-12 pr-4 text-left text-xs text-white focus:border-gold-400 focus:outline-none sm:text-sm"
                    />
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-gold-400 py-3 text-xs font-extrabold text-dark-bg shadow-md transition-all hover:bg-gold-500 disabled:opacity-60 sm:text-sm"
                  >
                    {isSubmitting ? "جاري التحقق..." : "تسجيل الدخول الآمن"}
                  </button>
                </div>

                <div className="mt-4 rounded-xl border border-dark-border/40 bg-dark-card/50 p-3 text-right text-[10px] leading-relaxed text-gray-500">
                  <div className="mb-1 flex items-center gap-1.5 font-bold text-gold-500">
                    <ShieldAlert size={12} />
                    <span>الاتصال الآن يتم عبر واجهات API الخاصة بالخادم.</span>
                  </div>
                  <p>لو لم يتم إعداد Django بعد، ستظهر رسالة تعذر الاتصال بالخادم بدلا من حفظ حسابات محلية داخل المتصفح.</p>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-400">الاسم الأول *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: أحمد"
                      value={registerData.first_name}
                      onChange={(e) => setRegisterData((prev) => ({ ...prev, first_name: e.target.value }))}
                      className="w-full rounded-xl border border-dark-border bg-dark-card px-3 py-2 text-xs text-white focus:border-gold-400 focus:outline-none sm:text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-400">الاسم الأخير (العائلة) *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: هلال"
                      value={registerData.last_name}
                      onChange={(e) => setRegisterData((prev) => ({ ...prev, last_name: e.target.value }))}
                      className="w-full rounded-xl border border-dark-border bg-dark-card px-3 py-2 text-xs text-white focus:border-gold-400 focus:outline-none sm:text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400">رقم الهاتف الفعال لصالونك *</label>
                  <input
                    type="tel"
                    required
                    placeholder="01012345678"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full rounded-xl border border-dark-border bg-dark-card px-3 py-2 text-left font-mono text-xs text-white focus:border-gold-400 focus:outline-none sm:text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-400">المدينة *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: الدقهلية"
                      value={registerData.city}
                      onChange={(e) => setRegisterData((prev) => ({ ...prev, city: e.target.value }))}
                      className="w-full rounded-xl border border-dark-border bg-dark-card px-3 py-2 text-xs text-white focus:border-gold-400 focus:outline-none sm:text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-400">العنوان بالتفصيل *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: المنصورة - شارع الجيش"
                      value={registerData.address}
                      onChange={(e) => setRegisterData((prev) => ({ ...prev, address: e.target.value }))}
                      className="w-full rounded-xl border border-dark-border bg-dark-card px-3 py-2 text-xs text-white focus:border-gold-400 focus:outline-none sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-400">كلمة المرور *</label>
                    <input
                      type="password"
                      required
                      placeholder="حد أدنى 6 رموز"
                      value={registerData.password}
                      onChange={(e) => setRegisterData((prev) => ({ ...prev, password: e.target.value }))}
                      className="w-full rounded-xl border border-dark-border bg-dark-card px-3 py-2 text-left text-xs text-white focus:border-gold-400 focus:outline-none sm:text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-400">تأكيد كلمة المرور *</label>
                    <input
                      type="password"
                      required
                      placeholder="أعد إدخال الرمز"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full rounded-xl border border-dark-border bg-dark-card px-3 py-2 text-left text-xs text-white focus:border-gold-400 focus:outline-none sm:text-sm"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-gold-400 py-2.5 text-xs font-extrabold text-dark-bg shadow-md transition-all hover:bg-gold-500 disabled:opacity-60 sm:text-sm"
                  >
                    {isSubmitting ? "جاري إنشاء الحساب..." : "إنشاء وتسجيل الحساب فورا"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
