import { Product, Category, Order, OrderItem, Payment, ProductImage, ProductVariant, User } from "../types";

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
  payment?: Partial<Payment>;
};

type ApiAuthResponse = {
  token?: string;
  access?: string;
  access_token?: string;
  refresh?: string;
  user?: ApiUser;
};

function readStringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalizeUserRole(rawRole: unknown): User["role"] {
  const normalized = readStringValue(rawRole).trim().toLowerCase();

  if (normalized === "admin" || normalized === "superadmin" || normalized === "super_admin") {
    return "Admin";
  }

  if (normalized === "moderator" || normalized === "staff" || normalized === "manager") {
    return "Moderator";
  }

  return "Customer";
}

function parseAuthPayload(payload: unknown): { user: ApiUser; token?: string } {
  const record = (payload ?? {}) as Record<string, unknown>;
  const nestedUser = record.user as ApiUser | undefined;
  const userPayload = nestedUser ?? (record as ApiUser);
  const token =
    readStringValue(record.token) ||
    readStringValue(record.access) ||
    readStringValue(record.access_token) ||
    undefined;

  return {
    user: userPayload,
    token,
  };
}
function buildAuthHeaders(withJson = true): HeadersInit {
  const headers: Record<string, string> = {};

  if (withJson) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

async function fetchFromFirstAvailable(
  paths: string[],
  init: RequestInit = {}
): Promise<Response> {
  let lastResponse: Response | null = null;

  for (const path of paths) {
    const response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      cache: "no-store",
      credentials: "include",
    });

    if (response.status === 404) {
      lastResponse = response;
      continue;
    }

    return response;
  }

  return (
    lastResponse ??
    new Response(null, {
      status: 404,
    })
  );
}

function hasMeaningfulUserData(user: ApiUser): boolean {
  const source = user as Record<string, unknown>;
  return Boolean(
    readStringValue(source.id) ||
      readStringValue(source.first_name) ||
      readStringValue(source.firstName) ||
      readStringValue(source.phone) ||
      readStringValue(source.phone_number)
  );
}

function mapDjangoPayment(djangoPayment: Partial<Payment> | undefined, order: ApiOrder): Payment | undefined {
  if (!djangoPayment && !order.id) {
    return undefined;
  }

  if (!djangoPayment) {
    return {
      id: `pay-${order.id || "pending"}`,
      order_id: order.id || "",
      provider: "Paymob",
      transaction_id: order.orderNumber || order.id || "",
      status: "Pending",
      amount: Number(order.total || 0),
      paid_at: null,
    };
  }

  return {
    id: readStringValue(djangoPayment.id) || `pay-${order.id || "pending"}`,
    order_id: readStringValue(djangoPayment.order_id) || order.id || "",
    provider: djangoPayment.provider || "Paymob",
    transaction_id: readStringValue(djangoPayment.transaction_id) || order.orderNumber || order.id || "",
    status: djangoPayment.status || "Pending",
    amount: Number(djangoPayment.amount ?? order.total ?? 0),
    paid_at: typeof djangoPayment.paid_at === "string" ? djangoPayment.paid_at : null,
  };
}

function mapDjangoOrderItem(item: ApiOrderItem): OrderItem {
  return {
    id: readStringValue(item.id) || `item-${Math.random().toString(36).slice(2, 9)}`,
    order_id: readStringValue(item.order_id) || "",
    product_variant_id: readStringValue(item.product_variant_id) || readStringValue(item.productId) || "",
    product_name: readStringValue(item.product_name) || readStringValue(item.productName) || "",
    variant_description: readStringValue(item.variant_description) || "Default",
    price: Number(item.price || 0),
    quantity: Number(item.quantity || 1),
    subtotal: Number(item.subtotal || Number(item.price || 0) * Number(item.quantity || 1)),
  };
}

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
    id: String(djangoCat.id || ""),
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

  const source = djangoUser as Record<string, unknown>;
  const firstName = readStringValue(source.first_name) || readStringValue(source.firstName);
  const lastName = readStringValue(source.last_name) || readStringValue(source.lastName);
  const phone = readStringValue(source.phone) || readStringValue(source.phone_number);
  const createdAt = readStringValue(source.created_at) || readStringValue(source.createdAt);
  const updatedAt = readStringValue(source.updated_at) || readStringValue(source.updatedAt);
  const deletedAt = source.deleted_at ?? source.deletedAt ?? null;

  return {
    id: readStringValue(source.id) || "",
    first_name: firstName,
    last_name: lastName,
    phone,
    role: normalizeUserRole(source.role),
    created_at: createdAt || new Date().toISOString(),
    updated_at: updatedAt || new Date().toISOString(),
    deleted_at: typeof deletedAt === "string" ? deletedAt : null,
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
    payment: mapDjangoPayment(djangoOrder.payment, djangoOrder),
    items: Array.isArray(djangoOrder.items) ? djangoOrder.items.map(mapDjangoOrderItem) : djangoOrder.items,
  };
}

// --- API ACTIONS ---

// Fetch all products from Django API
export async function fetchProducts(): Promise<Product[]> {
  const response = await fetchFromFirstAvailable([
    "/products/products/",
  ]);
  if (!response.ok) {
    throw new Error("حدث خطأ أثناء جلب المنتجات من الخادم");
  }
  const data = await response.json();
  return Array.isArray(data) ? data.map(mapDjangoProduct) : [];
}

// Fetch all categories from Django API
export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(`${BASE_URL}/categories/`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("حدث خطأ أثناء جلب الأقسام من الخادم");
  }
  const data = await response.json();
  return Array.isArray(data) ? data.map(mapDjangoCategory) : [];
}

// Fetch all orders (Admin only) from Django API
export async function fetchOrders(): Promise<Order[]> {
  const response = await fetch(`${BASE_URL}/orders/`, {
    credentials: "include",
    headers: buildAuthHeaders(false),
    cache: "no-store",
  });
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

  const response = await fetch(`${BASE_URL}/orders/`, {
    method: "POST",
    credentials: "include",
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
  const response = await fetch(`${BASE_URL}/auth/login/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    throw new Error("رقم الهاتف أو كلمة المرور غير صحيحة");
  }
  const data = (await response.json()) as ApiAuthResponse;
  const parsed = parseAuthPayload(data);
  const user = hasMeaningfulUserData(parsed.user)
    ? mapDjangoUser(parsed.user)
    : await fetchCurrentUser();

  return {
    user,
    token: undefined,
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

  const response = await fetch(`${BASE_URL}/auth/register/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(djangoPayload),
  });
  if (!response.ok) {
    throw new Error("فشل تسجيل الحساب، رقم الهاتف قد يكون مسجلاً بالفعل");
  }

  return loginUser({
    phone: userData.phone,
    password: userData.password,
  });
}

export async function createUserByAdmin(userData: {
  first_name: string;
  last_name: string;
  phone: string;
  password?: string;
  role?: User["role"];
}): Promise<User> {
  const djangoPayload = {
    first_name: userData.first_name,
    last_name: userData.last_name,
    phone: userData.phone,
    password: userData.password,
    role: userData.role || "Customer",
  };

  const response = await fetch(`${BASE_URL}/auth/register/`, {
    method: "POST",
    credentials: "include",
    headers: buildAuthHeaders(),
    body: JSON.stringify(djangoPayload),
  });

  if (!response.ok) {
    throw new Error("فشل إنشاء المستخدم الجديد، تحقق من البيانات ثم حاول مرة أخرى");
  }

  const data = (await response.json()) as { user?: ApiUser } | ApiUser;
  const parsed = parseAuthPayload(data);

  if (hasMeaningfulUserData(parsed.user)) {
    return mapDjangoUser(parsed.user);
  }

  return mapDjangoUser(data as ApiUser);
}

export async function fetchCurrentUser(): Promise<User> {
  const response = await fetch(`${BASE_URL}/auth/me/`, {
    method: "GET",
    credentials: "include",
    headers: buildAuthHeaders(),
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 403) {
    throw new Error("AUTH_UNAUTHORIZED");
  }

  if (!response.ok) {
    throw new Error("تعذر جلب بيانات المستخدم الحالية");
  }

  const data = (await response.json()) as { user?: ApiUser } | ApiUser;
  const parsed = parseAuthPayload(data);
  return mapDjangoUser(parsed.user);
}

export async function logoutUser(): Promise<void> {
  await fetch(`${BASE_URL}/auth/logout/`, {
    method: "POST",
    credentials: "include",
    headers: buildAuthHeaders(),
  });
}

// Update order status (Admin only)
export async function updateOrderStatus(orderId: string, updates: { status?: Order["status"] }): Promise<Order> {
  const response = await fetch(`${BASE_URL}/orders/${orderId}/`, {
    method: "PATCH",
    credentials: "include",
    headers: buildAuthHeaders(),
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
  const response = await fetchFromFirstAvailable([
    "/products/products/",
  ], {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify({
      name: productData.name,
      description: productData.description,
      category: productData.category_id || productData.category,
      price: productData.price,
      image: productData.image,
    }),
  });
  if (!response.ok) {
    throw new Error("فشل إضافة المنتج الجديد");
  }
  const data = await response.json();
  return mapDjangoProduct(data);
}

export async function updateProduct(productId: string, productData: Partial<Product>): Promise<Product> {
  const response = await fetchFromFirstAvailable([
    `/products/products/${productId}/`,
  ], {
    method: "PUT",
    headers: buildAuthHeaders(),
    body: JSON.stringify({
      ...productData,
      category: productData.category_id || productData.category,
    }),
  });
  if (!response.ok) {
    throw new Error("فشل تعديل المنتج");
  }
  const data = await response.json();
  return mapDjangoProduct(data);
}

export async function deleteProduct(productId: string): Promise<boolean> {
  const response = await fetchFromFirstAvailable([
    `/products/products/${productId}/`,
  ], {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("فشل حذف المنتج");
  }
  return true;
}

export async function createCategory(categoryData: { name: string; image?: string }): Promise<Category> {
  const response = await fetch(`${BASE_URL}/categories/`, {
    method: "POST",
    credentials: "include",
    headers: buildAuthHeaders(),
    body: JSON.stringify({
      name: categoryData.name,
      media_url: categoryData.image || "",
      image: categoryData.image || "",
    }),
  });

  if (!response.ok) {
    throw new Error("فشل إنشاء القسم");
  }

  const data = await response.json();
  return mapDjangoCategory(data);
}

export async function updateCategory(categoryId: string, categoryData: { name: string; image?: string }): Promise<Category> {
  const response = await fetch(`${BASE_URL}/categories/${categoryId}/`, {
    method: "PUT",
    credentials: "include",
    headers: buildAuthHeaders(),
    body: JSON.stringify({
      name: categoryData.name,
      media_url: categoryData.image || "",
      image: categoryData.image || "",
    }),
  });

  if (!response.ok) {
    throw new Error("فشل تعديل القسم");
  }

  const data = await response.json();
  return mapDjangoCategory(data);
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/categories/${categoryId}/`, {
    method: "DELETE",
    credentials: "include",
    headers: buildAuthHeaders(false),
  });

  if (!response.ok) {
    throw new Error("فشل حذف القسم");
  }
}
