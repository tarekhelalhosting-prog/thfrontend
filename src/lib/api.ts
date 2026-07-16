import { Product, Category, Order, OrderItem, ProductImage, ProductVariant, User } from "../types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

type ApiProduct = Partial<Product> & {
  images?: ProductImage[];
  variants?: ProductVariant[];
  media_url?: string;
};

type ApiUser = Partial<User>;

type ApiOrderItem = Partial<OrderItem> & {
  productId?: string;
  productName?: string;
};

type ApiOrder = Partial<Order> & {
  items?: ApiOrderItem[];
  user?: ApiUser;
};

// --- MAPPING UTILITIES ---

export function mapDjangoProduct(djangoProd: ApiProduct): Product {
  if (!djangoProd) {
    return {
      id: "",
      category_id: "",
      name: "",
      description: "",
      price: 0,
      image: "",
      category: "",
    };
  }
  
  // Extract primary image or fallback to first, or generic placeholder
  const primaryImg = djangoProd.images?.find((img) => img.is_primary) || djangoProd.images?.[0];
  const imageUrl = primaryImg?.media_url || djangoProd.media_url || djangoProd.image || "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600";
  
  // Extract price from first variant, or use flat price
  const price = djangoProd.variants?.[0]?.price || djangoProd.price || 0;
  
  return {
    ...djangoProd,
    id: djangoProd.id || "",
    category_id: djangoProd.category_id || "",
    name: djangoProd.name || "",
    description: djangoProd.description || "",
    price: Number(price),
    image: imageUrl,
    category: djangoProd.category || djangoProd.category_id || "",
  };
}

export function mapDjangoCategory(djangoCat: Partial<Category>): Category {
  if (!djangoCat) {
    return {
      id: "",
      name: "",
      media_url: "",
      image: "",
    };
  }
  return {
    ...djangoCat,
    id: djangoCat.id || "",
    name: djangoCat.name || "",
    media_url: djangoCat.media_url || "",
    image: djangoCat.media_url || djangoCat.image || "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=400"
  };
}

export function mapDjangoUser(djangoUser: ApiUser): User {
  if (!djangoUser) {
    const now = new Date().toISOString();
    return {
      id: "",
      first_name: "",
      last_name: "",
      phone: "",
      role: "Customer",
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };
  }
  return {
    id: djangoUser.id || "",
    first_name: djangoUser.first_name || "",
    last_name: djangoUser.last_name || "",
    phone: djangoUser.phone || "",
    role: djangoUser.role || "Customer",
    created_at: djangoUser.created_at || new Date().toISOString(),
    updated_at: djangoUser.updated_at || new Date().toISOString(),
    deleted_at: djangoUser.deleted_at || null
  };
}

export function mapDjangoOrder(djangoOrder: ApiOrder): Order {
  if (!djangoOrder) {
    const now = new Date().toISOString();
    return {
      id: "",
      user_id: null,
      address_id: null,
      status: "Pending",
      subtotal: 0,
      discount: 0,
      total: 0,
      created_at: now,
      updated_at: now,
    };
  }

  return {
    ...djangoOrder,
    id: djangoOrder.id || "",
    user_id: djangoOrder.user_id || null,
    address_id: djangoOrder.address_id || null,
    status: djangoOrder.status || 'Pending',
    subtotal: Number(djangoOrder.subtotal || 0),
    discount: Number(djangoOrder.discount || 0),
    total: Number(djangoOrder.total || 0),
    created_at: djangoOrder.created_at || new Date().toISOString(),
    updated_at: djangoOrder.updated_at || new Date().toISOString(),
    
    // UI compatibility fields
    orderNumber: djangoOrder.id?.slice(0, 8).toUpperCase() || djangoOrder.orderNumber || "",
    customerName: djangoOrder.customerName || (djangoOrder.user ? `${djangoOrder.user.first_name} ${djangoOrder.user.last_name}` : "عميل صالون"),
    customerPhone: djangoOrder.customerPhone || djangoOrder.user?.phone || "",
    city: djangoOrder.city || "القاهرة",
    address: djangoOrder.address || "العنوان بالتفصيل",
  };
}

// --- API ACTIONS ---

// Fetch all products from Django API
export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(`${BASE_URL}/products`);
  if (!response.ok) {
    throw new Error("حدث خطأ أثناء جلب المنتجات من الخادم");
  }
  const data = await response.json();
  return Array.isArray(data) ? data.map(mapDjangoProduct) : [];
}

// Fetch all categories from Django API
export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(`${BASE_URL}/categories`);
  if (!response.ok) {
    throw new Error("حدث خطأ أثناء جلب الأقسام من الخادم");
  }
  const data = await response.json();
  return Array.isArray(data) ? data.map(mapDjangoCategory) : [];
}

// Fetch all orders (Admin only) from Django API
export async function fetchOrders(): Promise<Order[]> {
  const response = await fetch(`${BASE_URL}/orders`);
  if (!response.ok) {
    throw new Error("حدث خطأ أثناء جلب الطلبات من الخادم");
  }
  const data = await response.json();
  return Array.isArray(data) ? data.map(mapDjangoOrder) : [];
}

// Submit a new order to the Django API
export async function createOrder(orderData: Partial<Order>): Promise<Order> {
  // Construct payload mapping for Django "Orders" & "Order Items"
  const djangoPayload = {
    user_id: orderData.user_id || null,
    address_id: orderData.address_id || null,
    status: "Pending",
    subtotal: orderData.subtotal || orderData.total || 0,
    discount: orderData.discount || 0,
    total: orderData.total || 0,
    items: orderData.items?.map((item) => ({
      product_variant_id: item.product_variant_id, // references specific selected ProductVariant UUID
      product_name: item.product_name,
      variant_description: item.variant_description || "Default",
      price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity
    })) || []
  };

  const response = await fetch(`${BASE_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(djangoPayload),
  });
  if (!response.ok) {
    throw new Error("فشل إرسال الطلب، الرجاء المحاولة مرة أخرى");
  }
  const data = await response.json();
  return mapDjangoOrder(data);
}

// Login user via Django API using Phone Number as unique ID
export async function loginUser(credentials: { phone: string; password?: string }): Promise<{ user: User; token?: string }> {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    throw new Error("رقم الهاتف أو كلمة المرور غير صحيحة");
  }
  const data = await response.json();
  return {
    user: mapDjangoUser(data.user),
    token: data.token
  };
}

// Register a new salon user via Django API
export async function registerUser(userData: { first_name: string; last_name: string; phone: string; password?: string }): Promise<{ user: User; token?: string }> {
  const djangoPayload = {
    first_name: userData.first_name,
    last_name: userData.last_name,
    phone: userData.phone,
    password: userData.password,
    role: "Customer"
  };

  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(djangoPayload),
  });
  if (!response.ok) {
    throw new Error("فشل تسجيل الحساب، رقم الهاتف قد يكون مسجلاً بالفعل");
  }
  const data = await response.json();
  return {
    user: mapDjangoUser(data.user),
    token: data.token
  };
}

// Update order status (Admin only)
export async function updateOrderStatus(orderId: string, updates: { status?: Order["status"] }): Promise<Order> {
  const response = await fetch(`${BASE_URL}/orders/${orderId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error("فشل تحديث حالة الطلب");
  }
  const data = await response.json();
  return mapDjangoOrder(data);
}

// Product CRUD (Admin only)
export async function createProduct(productData: Omit<Product, "id">): Promise<Product> {
  const response = await fetch(`${BASE_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  });
  if (!response.ok) {
    throw new Error("فشل إضافة المنتج الجديد");
  }
  const data = await response.json();
  return mapDjangoProduct(data);
}

export async function updateProduct(productId: string, productData: Partial<Product>): Promise<Product> {
  const response = await fetch(`${BASE_URL}/products/${productId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(productData),
  });
  if (!response.ok) {
    throw new Error("فشل تعديل المنتج");
  }
  const data = await response.json();
  return mapDjangoProduct(data);
}

export async function deleteProduct(productId: string): Promise<boolean> {
  const response = await fetch(`${BASE_URL}/products/${productId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("فشل حذف المنتج");
  }
  return true;
}
