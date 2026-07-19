"use client";
import React, { useState } from "react";
import { X, Plus, Edit2, Trash2, ShieldAlert, ShoppingBag, ClipboardList, Users, Save, Sparkles, Filter, Shapes, UserRoundPlus } from "lucide-react";
import { Product, Order, User, Category, Payment } from "../src/types";
import {
  createUserByAdmin,
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  updateCategory,
  updateOrderStatus as updateOrderStatusApi,
  updateProduct,
} from "../src/lib/api";

interface AdminDashboardProps {
  products: Product[];
  onUpdateProducts: (newProducts: Product[]) => void;
  orders: Order[];
  onUpdateOrders: (newOrders: Order[]) => void;
  categories: Category[];
  onUpdateCategories: (newCategories: Category[]) => void;
  onClose: () => void;
}

export default function AdminDashboard({
  products,
  onUpdateProducts,
  orders,
  onUpdateOrders,
  categories,
  onUpdateCategories,
  onClose
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'orders' | 'customers'>('products');
  const [isSaving, setIsSaving] = useState(false);
  
  // Product CRUD states
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: 0,
    image: "",
    category: ""
  });
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [newUserForm, setNewUserForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "Customer" as User["role"],
  });
  const [adminSuccessMessage, setAdminSuccessMessage] = useState("");

  // Filter orders
  const [orderFilter, setOrderFilter] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered'>('all');

  // Load clients registered or extracted from orders
  const getCustomersList = () => {
    // Collect from registered users first
    const savedUsersStr = localStorage.getItem("th_users");
    const registered: User[] = savedUsersStr ? JSON.parse(savedUsersStr) : [];
    
    // Also extract unique customer info from orders who might be guest checkouts
    const orderCustomers: User[] = orders.filter(o => o.customerPhone).map(o => {
      const parts = (o.customerName || "").split(" ");
      const firstName = parts[0] || "عميل";
      const lastName = parts.slice(1).join(" ") || "زائر";
      return {
        id: o.customerPhone || Math.random().toString(),
        first_name: firstName,
        last_name: lastName,
        phone: o.customerPhone || "",
        role: 'Customer',
        created_at: o.created_at || new Date().toISOString(),
        updated_at: o.created_at || new Date().toISOString()
      };
    });

    // Merge without duplicates based on phone
    const merged = [...registered];
    orderCustomers.forEach(oc => {
      if (!merged.some(m => m.phone === oc.phone)) {
        merged.push(oc);
      }
    });

    return merged;
  };

  const customers = getCustomersList();

  const formatPrice = (price: number) => {
    return price.toLocaleString("en-EG") + " جنيه";
  };

  // --- Product CRUD Actions ---
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: "",
      description: "",
      price: 0,
      image: "https://images.unsplash.com/photo-1596178065887-1198b6148b2b?q=80&w=600&auto=format&fit=crop",
      category: categories[0]?.id || "cat-1"
    });
    setIsEditingProduct(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      description: prod.description,
      price: prod.price,
      image: prod.image,
      category: prod.category
    });
    setIsEditingProduct(true);
  };

  const handleDeleteProduct = (productId: string) => {
    void (async () => {
      if (!window.confirm("هل أنت متأكد من رغبتك في حذف هذا المنتج نهائياً من المتجر؟")) {
        return;
      }

      try {
        setIsSaving(true);
        await deleteProduct(productId);
        onUpdateProducts(products.filter((product) => product.id !== productId));
      } catch (error) {
        alert(error instanceof Error ? error.message : "تعذر حذف المنتج الآن.");
      } finally {
        setIsSaving(false);
      }
    })();
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.description || productForm.price <= 0) {
      alert("الرجاء إدخال الاسم، الوصف، والسعر بشكل صحيح.");
      return;
    }

    void (async () => {
      try {
        setIsSaving(true);

        if (editingProduct) {
          const updatedProduct = await updateProduct(editingProduct.id, {
            name: productForm.name,
            description: productForm.description,
            price: Number(productForm.price),
            image: productForm.image,
            category: productForm.category,
            category_id: productForm.category,
          });

          onUpdateProducts(
            products.map((product) =>
              product.id === editingProduct.id ? updatedProduct : product
            )
          );
        } else {
          const createdProduct = await createProduct({
            category_id: productForm.category,
            category: productForm.category,
            name: productForm.name,
            description: productForm.description,
            price: Number(productForm.price),
            image: productForm.image,
          } as Omit<Product, "id">);

          onUpdateProducts([createdProduct, ...products]);
        }

        setIsEditingProduct(false);
        setEditingProduct(null);
      } catch (error) {
        alert(error instanceof Error ? error.message : "تعذر حفظ المنتج الآن.");
      } finally {
        setIsSaving(false);
      }
    })();
  };

  // --- Order Status Change Actions ---
  const handleUpdateOrderStatus = (orderId: string, status: Order['status']) => {
    void (async () => {
      try {
        const updatedOrder = await updateOrderStatusApi(orderId, { status });
        onUpdateOrders(
          orders.map((order) => (order.id === orderId ? updatedOrder : order))
        );
      } catch (error) {
        alert(error instanceof Error ? error.message : "تعذر تحديث حالة الطلب.");
      }
    })();
  };

  const handleUpdatePaymentStatus = (orderId: string, status: Payment["status"]) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { 
          ...o, 
          payment: o.payment 
            ? { ...o.payment, status } 
            : { 
                id: "pay-" + Math.random().toString(36).substr(2, 9), 
                order_id: o.id, 
                provider: 'Paymob' as const, 
                transaction_id: "TXN-" + Math.floor(100000 + Math.random() * 900000), 
                status, 
                amount: o.total 
              } 
        };
      }
      return o;
    });
    onUpdateOrders(updated);
  };

  const handleAddCategory = () => {
    void (async () => {
      const trimmedName = newCategoryName.trim();
      if (!trimmedName) {
        alert("أدخل اسم القسم الجديد أولاً.");
        return;
      }

      try {
        setIsSaving(true);
        const category = await createCategory({ name: trimmedName });
        onUpdateCategories([category, ...categories]);
        setNewCategoryName("");
      } catch (error) {
        alert(error instanceof Error ? error.message : "تعذر إنشاء القسم.");
      } finally {
        setIsSaving(false);
      }
    })();
  };

  const startEditCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
  };

  const handleSaveCategory = () => {
    void (async () => {
      if (!editingCategoryId) {
        return;
      }

      const trimmedName = editingCategoryName.trim();
      if (!trimmedName) {
        alert("اسم القسم لا يمكن أن يكون فارغاً.");
        return;
      }

      try {
        setIsSaving(true);
        const updatedCategory = await updateCategory(editingCategoryId, { name: trimmedName });
        onUpdateCategories(
          categories.map((category) =>
            category.id === editingCategoryId ? updatedCategory : category
          )
        );
        setEditingCategoryId(null);
        setEditingCategoryName("");
      } catch (error) {
        alert(error instanceof Error ? error.message : "تعذر تعديل القسم.");
      } finally {
        setIsSaving(false);
      }
    })();
  };

  const handleDeleteCategory = (categoryId: string) => {
    void (async () => {
      if (!window.confirm("هل تريد حذف هذا القسم؟")) {
        return;
      }

      try {
        setIsSaving(true);
        await deleteCategory(categoryId);
        onUpdateCategories(categories.filter((category) => category.id !== categoryId));
      } catch (error) {
        alert(error instanceof Error ? error.message : "تعذر حذف القسم.");
      } finally {
        setIsSaving(false);
      }
    })();
  };

  const saveRegisteredUserLocally = (user: User) => {
    const savedUsersStr = localStorage.getItem("th_users");
    const registered: User[] = savedUsersStr ? JSON.parse(savedUsersStr) : [];
    const filtered = registered.filter((existingUser) => existingUser.id !== user.id && existingUser.phone !== user.phone);
    const mergedUsers = [user, ...filtered];
    localStorage.setItem("th_users", JSON.stringify(mergedUsers));
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();

    void (async () => {
      const trimmedFirstName = newUserForm.first_name.trim();
      const trimmedLastName = newUserForm.last_name.trim();
      const trimmedPhone = newUserForm.phone.trim();

      if (!trimmedFirstName || !trimmedLastName || !trimmedPhone || !newUserForm.password) {
        alert("الرجاء إدخال الاسم الأول واسم العائلة والهاتف وكلمة المرور.");
        return;
      }

      if (newUserForm.password !== newUserForm.confirmPassword) {
        alert("كلمتا المرور غير متطابقتين.");
        return;
      }

      try {
        setIsSaving(true);
        setAdminSuccessMessage("");

        const createdUser = await createUserByAdmin({
          first_name: trimmedFirstName,
          last_name: trimmedLastName,
          phone: trimmedPhone,
          password: newUserForm.password,
          role: newUserForm.role,
        });

        saveRegisteredUserLocally(createdUser);

        setNewUserForm({
          first_name: "",
          last_name: "",
          phone: "",
          password: "",
          confirmPassword: "",
          role: "Customer",
        });
        setAdminSuccessMessage("تم إنشاء المستخدم الجديد بنجاح.");
      } catch (error) {
        alert(error instanceof Error ? error.message : "تعذر إنشاء المستخدم حالياً.");
      } finally {
        setIsSaving(false);
      }
    })();
  };

  const filteredOrders = orderFilter === 'all' 
    ? orders 
    : orders.filter(o => {
        const currentStatus = (o.status || 'Pending').toLowerCase();
        if (orderFilter === 'pending') return currentStatus === 'pending';
        if (orderFilter === 'processing') return currentStatus === 'processing';
        if (orderFilter === 'shipped') return currentStatus === 'ready' || currentStatus === 'confirmed';
        if (orderFilter === 'delivered') return currentStatus === 'completed';
        return false;
      });

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Breadcrumb Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-dark-border pb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gold-400 text-dark-bg rounded-xl shadow-lg shrink-0">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">لوحة تحكم معارض طارق هلال</h2>
              <p className="text-xs text-gray-400 mt-1">إدارة المنتجات، متابعة طلبات صالونات الكوافير والعملاء وتعديل المخزون</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-dark-card border border-dark-border hover:border-gold-400 text-gray-400 hover:text-white rounded-xl text-xs font-bold transition-all"
          >
            <X size={16} />
            <span>الخروج والعودة للمتجر</span>
          </button>
        </div>

        {/* Info Stats Quick Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-dark-card border border-dark-border p-4 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] text-gray-400 font-bold">إجمالي المبيعات</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-lg sm:text-2xl font-black text-gold-400 font-mono">
                {formatPrice(orders.filter(o => o.payment?.status === 'Paid').reduce((sum, o) => sum + (o.total || 0), 0))}
              </span>
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border p-4 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] text-gray-400 font-bold">عدد الطلبات المسجلة</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-lg sm:text-2xl font-black text-white font-mono">{orders.length}</span>
              <span className="text-[10px] text-gray-400">طلب</span>
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border p-4 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] text-gray-400 font-bold">المنتجات النشطة بالمعرض</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-lg sm:text-2xl font-black text-white font-mono">{products.length}</span>
              <span className="text-[10px] text-gray-400">صنف متاح</span>
            </div>
          </div>

          <div className="bg-dark-card border border-dark-border p-4 rounded-2xl flex flex-col justify-between">
            <span className="text-[10px] text-gray-400 font-bold">العملاء والباربرز</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-lg sm:text-2xl font-black text-white font-mono">{customers.length}</span>
              <span className="text-[10px] text-gray-400">صاحب صالون</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex bg-dark-card border border-dark-border p-1.5 rounded-2xl">
          <button
            onClick={() => { setActiveTab('products'); setIsEditingProduct(false); }}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'products' ? 'bg-gold-400 text-dark-bg' : 'text-gray-400 hover:text-white'}`}
          >
            <ShoppingBag size={16} />
            <span>إدارة المنتجات والموديلات ({products.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('categories'); setIsEditingProduct(false); }}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'categories' ? 'bg-gold-400 text-dark-bg' : 'text-gray-400 hover:text-white'}`}
          >
            <Shapes size={16} />
            <span>إدارة الأقسام ({categories.length})</span>
          </button>
          
          <button
            onClick={() => { setActiveTab('orders'); setIsEditingProduct(false); }}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'orders' ? 'bg-gold-400 text-dark-bg' : 'text-gray-400 hover:text-white'}`}
          >
            <ClipboardList size={16} />
            <span>متابعة الفواتير والطلبات ({orders.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('customers'); setIsEditingProduct(false); }}
            className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${activeTab === 'customers' ? 'bg-gold-400 text-dark-bg' : 'text-gray-400 hover:text-white'}`}
          >
            <Users size={16} />
            <span>حسابات العملاء المشتركين ({customers.length})</span>
          </button>
        </div>

        {/* TAB 1: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {!isEditingProduct ? (
              <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden p-5">
                <div className="flex items-center justify-between pb-4 border-b border-dark-border/60 mb-5">
                  <h3 className="text-sm sm:text-base font-black text-white">منتجات ومعدات المتجر المعروضة حالياً</h3>
                  <button
                    onClick={handleOpenAddProduct}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 bg-gold-400 hover:bg-gold-500 text-dark-bg px-4 py-2 rounded-xl text-xs font-extrabold transition-all shadow-md"
                  >
                    <Plus size={16} />
                    <span>إضافة منتج جديد</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-dark-border/40 text-gray-400 font-bold pb-2">
                        <th className="py-3 px-2">المنتج</th>
                        <th className="py-3 px-2">القسم</th>
                        <th className="py-3 px-2">السعر الحالي</th>
                        <th className="py-3 px-2 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-border/20">
                      {products.map((prod) => (
                        <tr key={prod.id} className="hover:bg-dark-bg/40 transition-colors">
                          <td className="py-3 px-2 flex items-center gap-3">
                            <img src={prod.image} alt={prod.name} className="w-10 h-10 rounded-lg object-cover border border-dark-border shrink-0" />
                            <div>
                              <span className="font-bold text-gray-200 block">{prod.name}</span>
                              <span className="text-[10px] text-gray-500 block truncate max-w-[200px]">{prod.description}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2">
                            <span className="px-2 py-0.5 rounded bg-dark-bg border border-dark-border text-gray-400 text-[10px]">
                              {categories.find(c => c.id === prod.category)?.name || prod.category}
                            </span>
                          </td>
                          <td className="py-3 px-2 font-bold text-gold-400 font-mono">{formatPrice(prod.price)}</td>
                          <td className="py-3 px-2 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenEditProduct(prod)}
                                className="p-1.5 rounded-lg bg-dark-bg hover:bg-gold-400/10 text-gray-400 hover:text-gold-400 border border-dark-border"
                                title="تعديل المنتج"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(prod.id)}
                                disabled={isSaving}
                                className="p-1.5 rounded-lg bg-dark-bg hover:bg-red-500/10 text-gray-400 hover:text-red-500 border border-dark-border"
                                title="حذف المنتج"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            ) : (
              /* PRODUCT ADD/EDIT FORM VIEW */
              <form onSubmit={handleSaveProduct} className="bg-dark-card border border-dark-border p-5 rounded-2xl space-y-4">
                <div className="pb-3 border-b border-dark-border/60">
                  <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                    <Sparkles className="text-gold-400" size={16} />
                    <span>{editingProduct ? `تعديل صنف: ${editingProduct.name}` : "إضافة موديل جديد للمعرض"}</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 font-bold block">اسم الموديل / المنتج بالكامل *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: كرسي حلاقة هيدروليك جلد طبيعي أسود كلاسيك"
                      value={productForm.name}
                      onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-dark-bg border border-dark-border focus:border-gold-400 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 font-bold block">القسم الرئيسي والنوع *</label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-dark-bg border border-dark-border focus:border-gold-400 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 font-bold block">السعر الحالي للبيع (بالجنيه المصري) *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="8500"
                      value={productForm.price || ""}
                      onChange={(e) => setProductForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                      className="w-full bg-dark-bg border border-dark-border focus:border-gold-400 rounded-xl py-2 px-3 text-xs text-white focus:outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 font-bold block">رابط الصورة الرئيسية *</label>
                    <input
                      type="text"
                      required
                      placeholder="https://images.unsplash.com/..."
                      value={productForm.image}
                      onChange={(e) => setProductForm(prev => ({ ...prev, image: e.target.value }))}
                      className="w-full bg-dark-bg border border-dark-border focus:border-gold-400 rounded-xl py-2 px-3 text-xs text-white focus:outline-none font-mono text-left"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-bold block">الوصف بالتفصيل ومميزات التصنيع والمقاسات *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="اكتب مواصفات الموديل، خامات الجلد، قوة الهيدروليك وسعة الشامبو والمغاسل..."
                    value={productForm.description}
                    onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-dark-bg border border-dark-border focus:border-gold-400 rounded-xl py-2 px-3 text-xs text-white focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsEditingProduct(false)}
                    className="py-3 bg-dark-bg border border-dark-border hover:border-white text-gray-400 hover:text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    إلغاء وتراجع
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="py-3 bg-gold-400 hover:bg-gold-500 text-dark-bg rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Save size={16} />
                    <span>حفظ الموديل بالمعرض</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: CATEGORIES MANAGEMENT */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
            <div className="xl:col-span-3 bg-dark-card border border-dark-border rounded-2xl p-5 space-y-4">
              <h3 className="text-sm sm:text-base font-black text-white">كل الأقسام الحالية وإضافة قسم جديد</h3>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="اسم قسم جديد"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 bg-dark-bg border border-dark-border focus:border-gold-400 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-gold-400 text-dark-bg text-xs font-black hover:bg-gold-500"
                >
                  إضافة قسم
                </button>
              </div>

              <div className="space-y-2 max-h-[420px] overflow-y-auto">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center gap-2 rounded-xl border border-dark-border/40 bg-dark-bg/40 p-2.5">
                    {editingCategoryId === category.id ? (
                      <>
                        <input
                          type="text"
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          className="flex-1 bg-dark-bg border border-dark-border focus:border-gold-400 rounded-lg py-1.5 px-2 text-xs text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleSaveCategory}
                          disabled={isSaving}
                          className="px-2.5 py-1.5 rounded-lg bg-gold-400 text-dark-bg text-[11px] font-black"
                        >
                          حفظ
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategoryId(null);
                            setEditingCategoryName("");
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-dark-bg border border-dark-border text-[11px] text-gray-300"
                        >
                          إلغاء
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-xs text-gray-200 font-bold">{category.name}</span>
                        <button
                          type="button"
                          onClick={() => startEditCategory(category)}
                          className="p-1.5 rounded-lg bg-dark-bg border border-dark-border text-gray-400 hover:text-gold-400"
                          title="تعديل القسم"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={isSaving}
                          className="p-1.5 rounded-lg bg-dark-bg border border-dark-border text-gray-400 hover:text-red-500"
                          title="حذف القسم"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="xl:col-span-2 bg-dark-card border border-dark-border rounded-2xl p-5 space-y-4">
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <UserRoundPlus size={16} className="text-gold-400" />
                <span>إنشاء مستخدم جديد</span>
              </h3>

              {adminSuccessMessage && (
                <div className="rounded-xl border border-green-500/40 bg-green-500/10 p-3 text-xs font-bold text-green-400">
                  {adminSuccessMessage}
                </div>
              )}

              <form onSubmit={handleCreateUser} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="الاسم الأول"
                    value={newUserForm.first_name}
                    onChange={(e) => setNewUserForm((prev) => ({ ...prev, first_name: e.target.value }))}
                    className="w-full bg-dark-bg border border-dark-border focus:border-gold-400 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="اسم العائلة"
                    value={newUserForm.last_name}
                    onChange={(e) => setNewUserForm((prev) => ({ ...prev, last_name: e.target.value }))}
                    className="w-full bg-dark-bg border border-dark-border focus:border-gold-400 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>

                <input
                  type="text"
                  required
                  placeholder="رقم الهاتف"
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-dark-bg border border-dark-border focus:border-gold-400 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                />

                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm((prev) => ({ ...prev, role: e.target.value as User["role"] }))}
                  className="w-full bg-dark-bg border border-dark-border focus:border-gold-400 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                >
                  <option value="Customer">عميل</option>
                  <option value="Moderator">مشرف</option>
                  <option value="Admin">مدير</option>
                </select>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="password"
                    required
                    placeholder="كلمة المرور"
                    value={newUserForm.password}
                    onChange={(e) => setNewUserForm((prev) => ({ ...prev, password: e.target.value }))}
                    className="w-full bg-dark-bg border border-dark-border focus:border-gold-400 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                  />
                  <input
                    type="password"
                    required
                    placeholder="تأكيد كلمة المرور"
                    value={newUserForm.confirmPassword}
                    onChange={(e) => setNewUserForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full bg-dark-bg border border-dark-border focus:border-gold-400 rounded-xl py-2 px-3 text-xs text-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-2.5 rounded-xl bg-gold-400 hover:bg-gold-500 text-dark-bg text-xs font-black"
                >
                  إنشاء المستخدم
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-dark-border/60 mb-5">
                <h3 className="text-sm sm:text-base font-black text-white">فواتير وحجوزات الصالونات</h3>
                
                {/* Filter Selector */}
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-gray-400" />
                  <span className="text-[10px] text-gray-400 font-bold">تصفية حسب:</span>
                  <select
                    value={orderFilter}
                    onChange={(e) => setOrderFilter(e.target.value as typeof orderFilter)}
                    className="bg-dark-bg border border-dark-border rounded-lg py-1.5 px-2.5 text-[10px] text-white focus:outline-none"
                  >
                    <option value="all">كل الطلبات</option>
                    <option value="pending">قيد التأكيد ⏳</option>
                    <option value="processing">جاري التجهيز ⚙️</option>
                    <option value="shipped">جاري الشحن 🚚</option>
                    <option value="delivered">تم التسليم ✅</option>
                  </select>
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="p-10 text-center">
                  <ClipboardList size={36} className="text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">لا توجد طلبات تطابق التصفية المحددة حالياً.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="bg-dark-bg/60 border border-dark-border p-4 rounded-xl space-y-3">
                      {/* Order info line */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-dark-border/40 pb-2 text-xs">
                        <div>
                          <span className="text-gray-400">كود الطلب:</span>{" "}
                          <span className="font-mono text-gold-400 font-bold">{order.orderNumber}</span>
                          <span className="text-gray-500 mx-2">|</span>
                          <span className="text-gray-400">
                            {order.created_at
                              ? `${new Date(order.created_at).toLocaleDateString("ar-EG")} - ${new Date(order.created_at).toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' })}`
                              : "غير مسجل"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">قيمة الإجمالي:</span>
                          <span className="font-mono font-black text-white">{formatPrice(order.total || 0)}</span>
                        </div>
                      </div>

                      {/* Customer info */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] bg-dark-card/50 p-2.5 rounded-lg border border-dark-border/40">
                        <p className="text-gray-400">العميل المستلم: <span className="text-white font-bold">{order.customerName}</span></p>
                        <p className="text-gray-400">الهاتف والواتس: <span className="text-white font-bold font-mono">{order.customerPhone}</span></p>
                        <p className="text-gray-400">الموقع والعنوان: <span className="text-white">{order.city} - {order.address}</span></p>
                      </div>

                      {/* Items details list */}
                      <div className="space-y-1.5 pl-3">
                        <p className="text-[10px] text-gray-400 font-bold">المنتجات المطلوبة في الفاتورة:</p>
                        {(order.items || []).map((item, index) => (
                          <div key={index} className="flex justify-between text-[11px] text-gray-300">
                            <span>• {item.product_name} <span className="text-gray-500">(عدد: {item.quantity})</span></span>
                            <span className="font-mono text-gold-400">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Status selectors */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-dark-border/40 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-gray-400">طريقة الدفع:</span>
                          <span className="px-2 py-0.5 rounded bg-dark-card border border-dark-border text-gold-400 text-[10px] font-bold">
                            {order.payment?.provider === 'Paymob' ? 'فيزا/ماستركارد (Paymob)' : 'الدفع عند الاستلام'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Payment status dropdown */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-gray-400">حالة الدفع:</span>
                            <select
                              value={order.payment?.status === 'Paid' ? 'paid' : order.payment?.status === 'Failed' ? 'failed' : 'pending'}
                              onChange={(e) => {
                                const mappedStatus = e.target.value === 'paid' ? 'Paid' : e.target.value === 'failed' ? 'Failed' : 'Pending';
                                handleUpdatePaymentStatus(order.id, mappedStatus);
                              }}
                              className={`rounded-lg py-1 px-2 text-[10px] font-bold text-white focus:outline-none border ${order.payment?.status === 'Paid' ? 'bg-green-500/10 border-green-500/40 text-green-400' : order.payment?.status === 'Failed' ? 'bg-red-500/10 border-red-500/40 text-red-400' : 'bg-yellow-500/10 border-yellow-500/40 text-yellow-500'}`}
                            >
                              <option value="pending" className="bg-dark-bg text-white">قيد الدفع ⏳</option>
                              <option value="paid" className="bg-dark-bg text-white">مدفوع بالكامل ✅</option>
                              <option value="failed" className="bg-dark-bg text-white">فشل الدفع ❌</option>
                            </select>
                          </div>

                          {/* Fulfillment status dropdown */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-gray-400">حالة الطلب:</span>
                            <select
                              value={(order.status || 'Pending').toLowerCase()}
                              onChange={(e) => {
                                const raw = e.target.value;
                                const mappedStatus = raw === 'pending' ? 'Pending' : raw === 'processing' ? 'Processing' : raw === 'shipped' ? 'Ready' : raw === 'delivered' ? 'Completed' : 'Cancelled';
                                handleUpdateOrderStatus(order.id, mappedStatus);
                              }}
                              className={`rounded-lg py-1 px-2 text-[10px] font-bold text-white focus:outline-none border ${(order.status || 'Pending').toLowerCase() === 'completed' ? 'bg-green-500/10 border-green-500/40 text-green-400' : (order.status || 'Pending').toLowerCase() === 'cancelled' ? 'bg-red-500/10 border-red-500/40 text-red-400' : 'bg-gold-500/10 border-gold-400/40 text-gold-400'}`}
                            >
                              <option value="pending" className="bg-dark-bg text-white">⏳ قيد التأكيد</option>
                              <option value="processing" className="bg-dark-bg text-white">⚙️ جاري التجهيز</option>
                              <option value="shipped" className="bg-dark-bg text-white">🚚 جاري الشحن</option>
                              <option value="completed" className="bg-dark-bg text-white">✅ تم التسليم</option>
                              <option value="cancelled" className="bg-dark-bg text-white">❌ ملغي</option>
                            </select>
                          </div>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: CUSTOMERS MANAGEMENT */}
        {activeTab === 'customers' && (
          <div className="bg-dark-card border border-dark-border rounded-2xl p-5">
            <h3 className="text-sm sm:text-base font-black text-white pb-4 border-b border-dark-border/60 mb-5">صالونات التجميل والحلاقين المشتركين</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-dark-border/40 text-gray-400 font-bold pb-2">
                    <th className="py-3 px-2">الاسم</th>
                    <th className="py-3 px-2">رقم الهاتف</th>
                    <th className="py-3 px-2">العنوان والمدينة</th>
                    <th className="py-3 px-2">البريد الإلكتروني</th>
                    <th className="py-3 px-2 text-center">حالة الحساب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border/20">
                  {customers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-dark-bg/40 transition-colors">
                      <td className="py-3.5 px-2 font-bold text-white">{cust.first_name} {cust.last_name}</td>
                      <td className="py-3.5 px-2 font-mono text-gray-300">{cust.phone || "—"}</td>
                      <td className="py-3.5 px-2 text-gray-400">الدقهلية - المنصورة</td>
                      <td className="py-3.5 px-2 font-mono text-gray-400">{cust.phone ? `${cust.phone}@tareq.com` : "customer@tareq.com"}</td>
                      <td className="py-3.5 px-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${cust.role === 'Admin' ? "bg-red-500/10 text-red-400 border border-red-500/30" : "bg-gold-400/10 text-gold-500 border border-gold-400/30"}`}>
                          {cust.role === 'Admin' ? "مدير نظام" : "كوافير معتمد"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
