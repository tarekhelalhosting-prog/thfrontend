"use client";

import React, { useMemo, useState } from "react";
import {
  Clipboard,
  Eye,
  EyeOff,
  Phone,
  ShieldAlert,
  User,
  X,
} from "lucide-react";
import { User as UserType, Order } from "../src/types";
import { derivePaymentStatus, loginUser, registerUser } from "../src/lib/api";
import InlineBanner from "../src/components/ui/InlineBanner";
import {
  hasValidationErrors,
  validateCity,
  validateName,
  validateOptionalAddressNotes,
  validatePassword,
  validatePasswordConfirmation,
  validatePhone,
} from "../src/lib/form-validation";
import { translateStatusLabel } from "../src/lib/status-labels";

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
  type LoginField = "phone" | "password";
  type RegisterField = "first_name" | "last_name" | "phone" | "city" | "address" | "password" | "confirmPassword";

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginFieldErrors, setLoginFieldErrors] = useState<Partial<Record<LoginField, string>>>({});
  const [registerFieldErrors, setRegisterFieldErrors] = useState<Partial<Record<RegisterField, string>>>({});

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

  const isCurrentUserAdmin = currentUser?.role === "Admin" || currentUser?.role === "Moderator";

  const userOrders = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    return orders.filter((order) => order.user_id === currentUser.id);
  }, [orders, currentUser]);

  const formatPrice = (price: number) => {
    return `${price.toLocaleString("en-EG")} جنيه`;
  };

  const validateLoginForm = () => {
    const nextErrors: Partial<Record<LoginField, string>> = {
      phone: validatePhone(loginData.phone),
      password: validatePassword(loginData.password),
    };

    setLoginFieldErrors(nextErrors);
    return !hasValidationErrors(nextErrors);
  };

  const validateRegisterForm = () => {
    const nextErrors: Partial<Record<RegisterField, string>> = {
      first_name: validateName(registerData.first_name, "الاسم الأول"),
      last_name: validateName(registerData.last_name, "الاسم الأخير"),
      phone: validatePhone(registerData.phone),
      city: validateCity(registerData.city),
      address: validateOptionalAddressNotes(registerData.address, "العنوان بالتفصيل"),
      password: validatePassword(registerData.password),
      confirmPassword: validatePasswordConfirmation(registerData.password, registerData.confirmPassword),
    };

    setRegisterFieldErrors(nextErrors);
    return !hasValidationErrors(nextErrors);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    void (async () => {
      if (!validateLoginForm()) {
        setErrorMessage("يرجى تصحيح بيانات تسجيل الدخول.");
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
      const { first_name, last_name, phone, password } = registerData;

      if (!validateRegisterForm()) {
        setErrorMessage("يرجى مراجعة بيانات إنشاء الحساب.");
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
                              derivePaymentStatus(order) === "Paid"
                                ? "bg-green-500/10 text-green-400"
                                : "bg-yellow-500/10 text-yellow-500"
                            }`}
                          >
                            {derivePaymentStatus(order) === "Paid" ? "تم الدفع بنجاح" : "لم يتم الدفع بعد"}
                          </span>
                          <span
                            className={`block text-[9px] font-bold ${
                              order.status === "Completed" ? "text-green-400" : "text-gold-400"
                            }`}
                          >
                            {translateStatusLabel(order.status)}
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

            {successMessage && <InlineBanner tone="success" message={successMessage} className="mb-4" />}

            {errorMessage && <InlineBanner tone="error" message={errorMessage} className="mb-4" />}

            {activeTab === "login" ? (
              <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400">رقم الهاتف الفعال لصالونك *</label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    inputMode="numeric"
                    pattern="01[0125][0-9]{8}"
                    maxLength={11}
                    placeholder="مثال: 01001234567"
                    value={loginData.phone}
                    onChange={(e) => {
                      setLoginData((prev) => ({ ...prev, phone: e.target.value.replace(/\D/g, "").slice(0, 11) }));
                      setLoginFieldErrors((prev) => ({ ...prev, phone: "" }));
                    }}
                    className={`w-full rounded-xl border bg-dark-card px-4 py-2.5 text-left font-mono text-xs text-white focus:border-gold-400 focus:outline-none sm:text-sm ${loginFieldErrors.phone ? "border-red-500" : "border-dark-border"}`}
                  />
                  {loginFieldErrors.phone ? <p className="mt-1 text-[11px] font-bold text-red-500">{loginFieldErrors.phone}</p> : null}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400">كلمة المرور *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      placeholder="كلمة المرور الخاصة بحسابك"
                      value={loginData.password}
                      onChange={(e) => {
                        setLoginData((prev) => ({ ...prev, password: e.target.value }));
                        setLoginFieldErrors((prev) => ({ ...prev, password: "" }));
                      }}
                      className={`w-full rounded-xl border bg-dark-card py-2.5 pl-12 pr-4 text-left text-xs text-white focus:border-gold-400 focus:outline-none sm:text-sm ${loginFieldErrors.password ? "border-red-500" : "border-dark-border"}`}
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
                  {loginFieldErrors.password ? <p className="mt-1 text-[11px] font-bold text-red-500">{loginFieldErrors.password}</p> : null}
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
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} noValidate className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-400">الاسم الأول *</label>
                    <input
                      type="text"
                      required
                      minLength={2}
                      maxLength={30}
                      placeholder="مثال: أحمد"
                      value={registerData.first_name}
                      onChange={(e) => {
                        setRegisterData((prev) => ({ ...prev, first_name: e.target.value }));
                        setRegisterFieldErrors((prev) => ({ ...prev, first_name: "" }));
                      }}
                      className={`w-full rounded-xl border bg-dark-card px-3 py-2 text-xs text-white focus:border-gold-400 focus:outline-none sm:text-sm ${registerFieldErrors.first_name ? "border-red-500" : "border-dark-border"}`}
                    />
                    {registerFieldErrors.first_name ? <p className="mt-1 text-[11px] font-bold text-red-500">{registerFieldErrors.first_name}</p> : null}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-400">الاسم الأخير (العائلة) *</label>
                    <input
                      type="text"
                      required
                      minLength={2}
                      maxLength={30}
                      placeholder="مثال: هلال"
                      value={registerData.last_name}
                      onChange={(e) => {
                        setRegisterData((prev) => ({ ...prev, last_name: e.target.value }));
                        setRegisterFieldErrors((prev) => ({ ...prev, last_name: "" }));
                      }}
                      className={`w-full rounded-xl border bg-dark-card px-3 py-2 text-xs text-white focus:border-gold-400 focus:outline-none sm:text-sm ${registerFieldErrors.last_name ? "border-red-500" : "border-dark-border"}`}
                    />
                    {registerFieldErrors.last_name ? <p className="mt-1 text-[11px] font-bold text-red-500">{registerFieldErrors.last_name}</p> : null}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-400">رقم الهاتف الفعال لصالونك *</label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    inputMode="numeric"
                    pattern="01[0125][0-9]{8}"
                    maxLength={11}
                    placeholder="01012345678"
                    value={registerData.phone}
                    onChange={(e) => {
                      setRegisterData((prev) => ({ ...prev, phone: e.target.value.replace(/\D/g, "").slice(0, 11) }));
                      setRegisterFieldErrors((prev) => ({ ...prev, phone: "" }));
                    }}
                    className={`w-full rounded-xl border bg-dark-card px-3 py-2 text-left font-mono text-xs text-white focus:border-gold-400 focus:outline-none sm:text-sm ${registerFieldErrors.phone ? "border-red-500" : "border-dark-border"}`}
                  />
                  {registerFieldErrors.phone ? <p className="mt-1 text-[11px] font-bold text-red-500">{registerFieldErrors.phone}</p> : null}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-400">المدينة *</label>
                    <input
                      type="text"
                      required
                      minLength={2}
                      maxLength={40}
                      placeholder="مثال: الدقهلية"
                      value={registerData.city}
                      onChange={(e) => {
                        setRegisterData((prev) => ({ ...prev, city: e.target.value }));
                        setRegisterFieldErrors((prev) => ({ ...prev, city: "" }));
                      }}
                      className={`w-full rounded-xl border bg-dark-card px-3 py-2 text-xs text-white focus:border-gold-400 focus:outline-none sm:text-sm ${registerFieldErrors.city ? "border-red-500" : "border-dark-border"}`}
                    />
                    {registerFieldErrors.city ? <p className="mt-1 text-[11px] font-bold text-red-500">{registerFieldErrors.city}</p> : null}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-400">العنوان بالتفصيل *</label>
                    <input
                      type="text"
                      required
                      minLength={5}
                      maxLength={120}
                      placeholder="مثال: المنصورة - شارع الجيش"
                      value={registerData.address}
                      onChange={(e) => {
                        setRegisterData((prev) => ({ ...prev, address: e.target.value }));
                        setRegisterFieldErrors((prev) => ({ ...prev, address: "" }));
                      }}
                      className={`w-full rounded-xl border bg-dark-card px-3 py-2 text-xs text-white focus:border-gold-400 focus:outline-none sm:text-sm ${registerFieldErrors.address ? "border-red-500" : "border-dark-border"}`}
                    />
                    {registerFieldErrors.address ? <p className="mt-1 text-[11px] font-bold text-red-500">{registerFieldErrors.address}</p> : null}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-400">كلمة المرور *</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      placeholder="حد أدنى 8 أحرف"
                      value={registerData.password}
                      onChange={(e) => {
                        setRegisterData((prev) => ({ ...prev, password: e.target.value }));
                        setRegisterFieldErrors((prev) => ({ ...prev, password: "", confirmPassword: "" }));
                      }}
                      className={`w-full rounded-xl border bg-dark-card px-3 py-2 text-left text-xs text-white focus:border-gold-400 focus:outline-none sm:text-sm ${registerFieldErrors.password ? "border-red-500" : "border-dark-border"}`}
                    />
                    {registerFieldErrors.password ? <p className="mt-1 text-[11px] font-bold text-red-500">{registerFieldErrors.password}</p> : null}
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-400">تأكيد كلمة المرور *</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      placeholder="أعد إدخال الرمز"
                      value={registerData.confirmPassword}
                      onChange={(e) => {
                        setRegisterData((prev) => ({ ...prev, confirmPassword: e.target.value }));
                        setRegisterFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
                      }}
                      className={`w-full rounded-xl border bg-dark-card px-3 py-2 text-left text-xs text-white focus:border-gold-400 focus:outline-none sm:text-sm ${registerFieldErrors.confirmPassword ? "border-red-500" : "border-dark-border"}`}
                    />
                    {registerFieldErrors.confirmPassword ? <p className="mt-1 text-[11px] font-bold text-red-500">{registerFieldErrors.confirmPassword}</p> : null}
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
