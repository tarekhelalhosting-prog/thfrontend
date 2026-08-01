"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, PencilLine, Plus, Star, Trash2, User } from "lucide-react";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import CartDrawer from "../../../components/CartDrawer";
import AccountModal from "../../../components/AccountModal";
import PageState from "../../components/ui/PageState";
import InlineBanner from "../../components/ui/InlineBanner";
import { useAuthSession } from "../../hooks/useAuthSession";
import { useCart } from "../../hooks/useCart";
import {
  cancelOrder,
  createUserAddress,
  deleteUserAddress,
  deleteUserProfile,
  fetchCategories,
  fetchCurrentUser,
  fetchOrders,
  fetchUserAddressById,
  fetchUserAddresses,
  setDefaultUserAddress,
  updateUserAddress,
  updateUserProfile,
} from "../../lib/api";
import {
  hasValidationErrors,
  validateAddressTitle,
  validateCity,
  validateCountry,
  validateName,
  validateStreet,
} from "../../lib/form-validation";
import { Address, Category, Order } from "../../types";

type AddressFormState = {
  title: string;
  country: string;
  city: string;
  street: string;
  is_default: boolean;
};

const emptyAddressForm: AddressFormState = {
  title: "",
  country: "Egypt",
  city: "",
  street: "",
  is_default: false,
};

export default function ProfilePage() {
  type ProfileField = "firstName" | "lastName";
  type AddressField = "title" | "country" | "city" | "street";

  const router = useRouter();
  const { currentUser, isHydrated, login, logout, clearSession } = useAuthSession();
  const hydratedUserForCart = isHydrated ? currentUser : null;
  const { cartItems: hydratedCart, cartCount, updateQuantity: updateCartQuantity, removeItem: removeCartItem } = useCart(hydratedUserForCart);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [profileFieldErrors, setProfileFieldErrors] = useState<Partial<Record<ProfileField, string>>>({});
  const [addressFieldErrors, setAddressFieldErrors] = useState<Partial<Record<AddressField, string>>>({});

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressForm, setAddressForm] = useState<AddressFormState>(emptyAddressForm);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const currentUserId = currentUser?.id;
  const currentUserPhone = currentUser?.phone ?? "";
  const currentUserFirstName = currentUser?.first_name ?? "";
  const currentUserLastName = currentUser?.last_name ?? "";
  const currentUserRole = currentUser?.role ?? "Customer";
  const lastLoadedProfileKeyRef = useRef<string | null>(null);


  const sortedAddresses = useMemo(
    () => [...addresses].sort((left, right) => Number(right.is_default) - Number(left.is_default)),
    [addresses]
  );
  const sortedOrders = useMemo(
    () => [...orders].sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime()),
    [orders]
  );
  const isOrderCancellable = (order: Order) => order.status === "Pending" || order.status === "Confirmed";
  const shouldShowAccountLoader =
    isLoading &&
    !firstName &&
    !lastName &&
    !currentUserFirstName &&
    !currentUserLastName;

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const fetchedCategories = await fetchCategories();
        if (!cancelled) {
          setCategories(fetchedCategories);
        }
      } catch {
        if (!cancelled) {
          setCategories([]);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (currentUserFirstName || currentUserLastName) {
      setFirstName(currentUserFirstName);
      setLastName(currentUserLastName);
    }
  }, [currentUserFirstName, currentUserLastName]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const profileLoadKey = currentUserId || currentUserPhone || "session-recovery";

    if (lastLoadedProfileKeyRef.current === profileLoadKey) {
      return;
    }

    lastLoadedProfileKeyRef.current = profileLoadKey;

    let cancelled = false;

    void (async () => {
      try {
        setIsLoading(true);
        const [freshUser, userAddresses, userOrders] = await Promise.all([fetchCurrentUser(), fetchUserAddresses(), fetchOrders()]);

        if (cancelled) {
          return;
        }

        const resolvedProfileKey = freshUser.id || freshUser.phone || profileLoadKey;
        lastLoadedProfileKeyRef.current = resolvedProfileKey;

        if (
          freshUser.first_name !== currentUserFirstName ||
          freshUser.last_name !== currentUserLastName ||
          freshUser.phone !== currentUserPhone ||
          freshUser.role !== currentUserRole
        ) {
          login(freshUser);
        }

        setFirstName(freshUser.first_name);
        setLastName(freshUser.last_name);
        setAddresses(userAddresses);
        setOrders(userOrders);
      } catch (error) {
        lastLoadedProfileKeyRef.current = null;

        if (!cancelled) {
          if (error instanceof Error && error.message === "AUTH_UNAUTHORIZED") {
            clearSession();
            router.replace("/");
            return;
          }

          setErrorMessage(error instanceof Error ? error.message : "تعذر تحميل بيانات الملف الشخصي حاليا.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      lastLoadedProfileKeyRef.current = null;
    };
  }, [clearSession, currentUserFirstName, currentUserId, currentUserLastName, currentUserPhone, currentUserRole, isHydrated, login, router]);

  const navigateToStore = (categoryId = "all", query = "") => {
    const params = new URLSearchParams();

    if (categoryId !== "all") {
      params.set("category", categoryId);
    }

    if (query.trim()) {
      params.set("search", query);
    }

    const queryString = params.toString();
    router.push(queryString ? `/?${queryString}` : "/");
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    navigateToStore(categoryId, searchTerm);
  };

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setMessage("");

    void (async () => {
      const nextErrors: Partial<Record<ProfileField, string>> = {
        firstName: validateName(firstName, "الاسم الأول"),
        lastName: validateName(lastName, "اسم العائلة"),
      };

      setProfileFieldErrors(nextErrors);

      if (hasValidationErrors(nextErrors)) {
        setErrorMessage("يرجى تصحيح بيانات الحساب قبل الحفظ.");
        return;
      }

      try {
        setIsSavingProfile(true);
        const updatedUser = await updateUserProfile({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        });

        login({
          ...updatedUser,
          phone: currentUser?.phone || updatedUser.phone,
          id: currentUser?.id || updatedUser.id,
        });

        setMessage("تم تحديث بيانات الملف الشخصي بنجاح.");
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "تعذر تحديث الملف الشخصي.");
      } finally {
        setIsSavingProfile(false);
      }
    })();
  };

  const refreshAddresses = async () => {
    const latest = await fetchUserAddresses();
    setAddresses(latest);
  };

  const handleAddressSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setMessage("");

    void (async () => {
      const { title, country, city, street, is_default } = addressForm;
      const nextErrors: Partial<Record<AddressField, string>> = {
        title: validateAddressTitle(title),
        country: validateCountry(country),
        city: validateCity(city),
        street: validateStreet(street),
      };

      setAddressFieldErrors(nextErrors);

      if (hasValidationErrors(nextErrors)) {
        setErrorMessage("يرجى مراجعة بيانات العنوان.");
        return;
      }

      try {
        setIsSavingAddress(true);

        if (editingAddressId) {
          await updateUserAddress(editingAddressId, {
            title: title.trim(),
            country: country.trim(),
            city: city.trim(),
            street: street.trim(),
          });

          if (is_default) {
            await setDefaultUserAddress(editingAddressId);
          }

          setMessage("تم تحديث العنوان بنجاح.");
        } else {
          const createdAddress = await createUserAddress({
            title: title.trim(),
            country: country.trim(),
            city: city.trim(),
            street: street.trim(),
            is_default,
          });

          if (is_default) {
            await setDefaultUserAddress(createdAddress.id);
          }

          setMessage("تمت إضافة العنوان بنجاح.");
        }

        await refreshAddresses();
        setAddressForm(emptyAddressForm);
        setEditingAddressId(null);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "تعذر حفظ بيانات العنوان.");
      } finally {
        setIsSavingAddress(false);
      }
    })();
  };

  const startEditAddress = (addressId: string) => {
    setErrorMessage("");
    setMessage("");

    void (async () => {
      try {
        const address = await fetchUserAddressById(addressId);
        setEditingAddressId(address.id);
        setAddressForm({
          title: address.title,
          country: address.country,
          city: address.city,
          street: address.street,
          is_default: address.is_default,
        });
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "تعذر فتح بيانات العنوان.");
      }
    })();
  };

  const removeAddress = (addressId: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا العنوان؟")) {
      return;
    }

    setErrorMessage("");
    setMessage("");

    void (async () => {
      try {
        await deleteUserAddress(addressId);
        await refreshAddresses();
        setMessage("تم حذف العنوان.");
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "تعذر حذف العنوان.");
      }
    })();
  };

  const makeAddressDefault = (addressId: string) => {
    setErrorMessage("");
    setMessage("");

    void (async () => {
      try {
        await setDefaultUserAddress(addressId);
        await refreshAddresses();
        setMessage("تم تعيين العنوان الافتراضي.");
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "تعذر تعيين العنوان الافتراضي.");
      }
    })();
  };

  const handleCancelOrder = (orderId: string) => {
    if (!window.confirm("هل تريد إلغاء هذا الطلب؟")) {
      return;
    }

    setErrorMessage("");
    setMessage("");
    setCancellingOrderId(orderId);

    void (async () => {
      try {
        await cancelOrder(orderId);
        setOrders((current) =>
          current.map((order) => (order.id === orderId ? { ...order, status: "Cancelled" } : order))
        );
        setMessage("تم إلغاء الطلب.");
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "تعذر إلغاء الطلب.");
      } finally {
        setCancellingOrderId(null);
      }
    })();
  };

  const handleDeleteProfile = () => {
    if (!window.confirm("حذف الحساب نهائي. هل تريد الاستمرار؟")) {
      return;
    }

    setErrorMessage("");
    setMessage("");

    void (async () => {
      try {
        await deleteUserProfile();
        clearSession();
        router.replace("/");
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "تعذر حذف الحساب.");
      }
    })();
  };

  if (!isHydrated || !currentUser) {
    return <div className="min-h-screen bg-dark-bg" />;
  }

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100">
      <Header
        cartCount={cartCount}
        onCartClick={() => setIsCartOpen(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        categories={categories}
        onContactClick={() => window.open("https://wa.me/201021750655", "_blank")}
        currentUser={currentUser}
        onAccountClick={() => {}}
        onAdminClick={() => router.push("/admin")}
        onLogout={() => {
          logout();
          router.replace("/");
        }}
        currentView="profile"
      />

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-2xl border border-dark-border bg-dark-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-gold-400/30 bg-gold-50 p-3 text-gold-600">
                <User size={20} />
              </div>
              <div>
                <h1 className="text-xl font-black text-white sm:text-2xl">الملف الشخصي</h1>
                <p className="text-xs text-gray-500 sm:text-sm">إدارة بيانات الحساب والعناوين المستخدمة في الطلبات.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigateToStore("all")}
              className="rounded-xl border border-dark-border bg-dark-bg px-4 py-2 text-xs font-bold text-gray-300 hover:border-gold-400 hover:text-gold-500"
            >
              العودة للمتجر
            </button>
          </div>
        </div>

        {errorMessage ? <InlineBanner tone="error" message={errorMessage} className="mb-4" /> : null}

        {message ? <InlineBanner tone="success" message={message} className="mb-4" /> : null}

        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-dark-border bg-dark-card p-5 lg:col-span-1">
            <h2 className="mb-4 text-lg font-black text-white">بيانات الحساب</h2>

            {shouldShowAccountLoader ? (
              <PageState variant="loading" title="جاري تحميل بيانات الحساب..." />
            ) : (
              <form className="space-y-3" noValidate onSubmit={handleProfileSubmit}>
                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-500">الاسم الأول</label>
                  <input
                    value={firstName}
                    minLength={2}
                    maxLength={30}
                    onChange={(event) => {
                      setFirstName(event.target.value);
                      setProfileFieldErrors((prev) => ({ ...prev, firstName: "" }));
                    }}
                    className={`w-full rounded-xl border bg-dark-bg px-3 py-2 text-sm text-gray-200 focus:border-gold-400 focus:outline-none ${profileFieldErrors.firstName ? "border-red-500" : "border-dark-border"}`}
                  />
                  {profileFieldErrors.firstName ? <p className="mt-1 text-[11px] font-bold text-red-500">{profileFieldErrors.firstName}</p> : null}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-500">اسم العائلة</label>
                  <input
                    value={lastName}
                    minLength={2}
                    maxLength={30}
                    onChange={(event) => {
                      setLastName(event.target.value);
                      setProfileFieldErrors((prev) => ({ ...prev, lastName: "" }));
                    }}
                    className={`w-full rounded-xl border bg-dark-bg px-3 py-2 text-sm text-gray-200 focus:border-gold-400 focus:outline-none ${profileFieldErrors.lastName ? "border-red-500" : "border-dark-border"}`}
                  />
                  {profileFieldErrors.lastName ? <p className="mt-1 text-[11px] font-bold text-red-500">{profileFieldErrors.lastName}</p> : null}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-gray-500">رقم الهاتف</label>
                  <input
                    value={currentUser.phone}
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-dark-border bg-dark-bg px-3 py-2 text-sm text-gray-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="w-full rounded-xl bg-gold-400 px-4 py-2.5 text-sm font-black text-dark-bg hover:bg-gold-500 disabled:opacity-60"
                >
                  {isSavingProfile ? "جاري الحفظ..." : "حفظ التعديلات"}
                </button>

                <button
                  type="button"
                  onClick={handleDeleteProfile}
                  className="w-full rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-500/15"
                >
                  حذف الحساب
                </button>
              </form>
            )}
          </section>

          <section className="rounded-2xl border border-dark-border bg-dark-card p-5 lg:col-span-2">
            <h2 className="mb-4 text-lg font-black text-white">العناوين</h2>

            <form className="grid gap-3 rounded-2xl border border-dark-border bg-dark-bg p-4 sm:grid-cols-2" noValidate onSubmit={handleAddressSubmit}>
              <div>
                <label className="mb-1 block text-xs font-bold text-gray-500">عنوان مختصر</label>
                <input
                  value={addressForm.title}
                  minLength={2}
                  maxLength={20}
                  onChange={(event) => {
                    setAddressForm((prev) => ({ ...prev, title: event.target.value }));
                    setAddressFieldErrors((prev) => ({ ...prev, title: "" }));
                  }}
                  placeholder="Home / Office"
                  className={`w-full rounded-xl border bg-dark-card px-3 py-2 text-sm text-gray-200 focus:border-gold-400 focus:outline-none ${addressFieldErrors.title ? "border-red-500" : "border-dark-border"}`}
                />
                {addressFieldErrors.title ? <p className="mt-1 text-[11px] font-bold text-red-500">{addressFieldErrors.title}</p> : null}
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-gray-500">الدولة</label>
                <input
                  value={addressForm.country}
                  minLength={2}
                  maxLength={40}
                  onChange={(event) => {
                    setAddressForm((prev) => ({ ...prev, country: event.target.value }));
                    setAddressFieldErrors((prev) => ({ ...prev, country: "" }));
                  }}
                  className={`w-full rounded-xl border bg-dark-card px-3 py-2 text-sm text-gray-200 focus:border-gold-400 focus:outline-none ${addressFieldErrors.country ? "border-red-500" : "border-dark-border"}`}
                />
                {addressFieldErrors.country ? <p className="mt-1 text-[11px] font-bold text-red-500">{addressFieldErrors.country}</p> : null}
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-gray-500">المدينة</label>
                <input
                  value={addressForm.city}
                  minLength={2}
                  maxLength={40}
                  onChange={(event) => {
                    setAddressForm((prev) => ({ ...prev, city: event.target.value }));
                    setAddressFieldErrors((prev) => ({ ...prev, city: "" }));
                  }}
                  className={`w-full rounded-xl border bg-dark-card px-3 py-2 text-sm text-gray-200 focus:border-gold-400 focus:outline-none ${addressFieldErrors.city ? "border-red-500" : "border-dark-border"}`}
                />
                {addressFieldErrors.city ? <p className="mt-1 text-[11px] font-bold text-red-500">{addressFieldErrors.city}</p> : null}
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold text-gray-500">الشارع</label>
                <input
                  value={addressForm.street}
                  minLength={5}
                  maxLength={120}
                  onChange={(event) => {
                    setAddressForm((prev) => ({ ...prev, street: event.target.value }));
                    setAddressFieldErrors((prev) => ({ ...prev, street: "" }));
                  }}
                  className={`w-full rounded-xl border bg-dark-card px-3 py-2 text-sm text-gray-200 focus:border-gold-400 focus:outline-none ${addressFieldErrors.street ? "border-red-500" : "border-dark-border"}`}
                />
                {addressFieldErrors.street ? <p className="mt-1 text-[11px] font-bold text-red-500">{addressFieldErrors.street}</p> : null}
              </div>

              <label className="sm:col-span-2 flex items-center gap-2 text-xs text-gray-500">
                <input
                  type="checkbox"
                  checked={addressForm.is_default}
                  onChange={(event) => setAddressForm((prev) => ({ ...prev, is_default: event.target.checked }))}
                />
                تعيين هذا العنوان كافتراضي
              </label>

              <div className="sm:col-span-2 flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={isSavingAddress}
                  className="inline-flex items-center gap-1 rounded-xl bg-gold-400 px-4 py-2 text-sm font-black text-dark-bg hover:bg-gold-500 disabled:opacity-60"
                >
                  {editingAddressId ? <PencilLine size={14} /> : <Plus size={14} />}
                  <span>{isSavingAddress ? "جاري الحفظ..." : editingAddressId ? "تحديث العنوان" : "إضافة عنوان"}</span>
                </button>

                {editingAddressId ? (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAddressId(null);
                      setAddressForm(emptyAddressForm);
                    }}
                    className="rounded-xl border border-dark-border bg-dark-card px-4 py-2 text-sm font-bold text-gray-400 hover:text-gray-200"
                  >
                    إلغاء التعديل
                  </button>
                ) : null}
              </div>
            </form>

            <div className="mt-4 space-y-3">
              {isLoading ? (
                <PageState variant="loading" title="جاري تحميل العناوين..." />
              ) : sortedAddresses.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-dark-border bg-dark-bg px-4 py-8 text-center text-sm text-gray-500">
                  لا يوجد أي عنوان مضاف حتى الآن.
                </div>
              ) : (
                sortedAddresses.map((address) => (
                  <article key={address.id} className="rounded-2xl border border-dark-border bg-dark-bg p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm font-black text-white">
                        <MapPin size={15} className="text-gold-500" />
                        <span>{address.title || "Address"}</span>
                        {address.is_default ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-gold-400/40 bg-gold-50 px-2 py-0.5 text-[10px] font-bold text-gold-700">
                            <Star size={10} />
                            افتراضي
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEditAddress(address.id)}
                          className="rounded-lg border border-dark-border px-2.5 py-1 text-xs font-bold text-gray-400 hover:text-gray-200"
                        >
                          تعديل
                        </button>
                        {!address.is_default ? (
                          <button
                            type="button"
                            onClick={() => makeAddressDefault(address.id)}
                            className="rounded-lg border border-gold-400/30 bg-gold-50 px-2.5 py-1 text-xs font-bold text-gold-700"
                          >
                            تعيين افتراضي
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => removeAddress(address.id)}
                          className="rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-600"
                        >
                          <span className="inline-flex items-center gap-1">
                            <Trash2 size={12} /> حذف
                          </span>
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-300">
                      {address.country} - {address.city}
                    </p>
                    <p className="mt-1 text-sm text-gray-400">{address.street}</p>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-dark-border bg-dark-card p-5 lg:col-span-3">
            <h2 className="mb-4 text-lg font-black text-white">طلباتي</h2>

            {isLoading ? (
              <PageState variant="loading" title="جاري تحميل الطلبات..." />
            ) : sortedOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-dark-border bg-dark-bg px-4 py-8 text-center text-sm text-gray-500">
                لا يوجد أي طلبات سابقة حتى الآن.
              </div>
            ) : (
              <div className="space-y-3">
                {sortedOrders.map((order) => (
                  <article key={order.id} className="rounded-2xl border border-dark-border bg-dark-bg p-4">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-black text-white">
                        طلب رقم <span className="font-mono text-gold-400">{order.orderNumber || order.id}</span>
                      </div>
                      <span className="rounded-full border border-gold-400/30 bg-gold-50 px-2.5 py-0.5 text-[11px] font-bold text-gold-700">
                        {order.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString("ar-EG")} - {order.items?.length ?? 0} منتج
                    </p>
                    <p className="mt-1 text-sm font-bold text-gray-200">الإجمالي: {order.total.toLocaleString("en-EG")} جنيه</p>

                    {isOrderCancellable(order) ? (
                      <button
                        type="button"
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingOrderId === order.id}
                        className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-600 disabled:opacity-60"
                      >
                        {cancellingOrderId === order.id ? "جاري الإلغاء..." : "إلغاء الطلب"}
                      </button>
                    ) : null}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer
        categories={categories}
        onCategorySelect={(categoryId) => navigateToStore(categoryId)}
        onContactClick={() => window.open("https://wa.me/201021750655", "_blank")}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={hydratedCart}
        onUpdateQuantity={(id, quantityDelta) => updateCartQuantity(id, quantityDelta)}
        onRemoveItem={(id) => removeCartItem(id)}
        onCheckout={() => {
          setIsCartOpen(false);
          navigateToStore("all");
        }}
      />

      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        currentUser={null}
        onLogin={login}
        orders={orders}
      />
    </div>
  );
}
