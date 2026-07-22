import { Product, Category, Order, OrderItem, Payment, ProductImage, ProductVariant, ProductVariantAttribute, User, Address, CartItem } from "../types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
const CLOUDINARY_UPLOAD_ENDPOINT = "/api/cloudinary/upload";
const PRODUCT_IMAGE_PLACEHOLDER = "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=600";

// Raw shapes as returned by the Django REST Framework serializers.
// ProductImageSerializer only exposes (id, image, is_primary) and
// ProductVariantSerializer only exposes (id, price, image, attributes) -
// neither includes the parent FK, so those are reattached during mapping.
type ApiProductImage = {
  id?: string | number;
  image?: string;
  is_primary?: boolean;
};

type ApiProductVariantAttribute = {
  id?: string | number;
  attribute_type?: string;
  value?: string;
};

type ApiProductVariant = {
  id?: string | number;
  price?: string | number;
  image?: string;
  attributes?: ApiProductVariantAttribute[];
};

type ApiProduct = Omit<Partial<Product>, "images" | "variants" | "category"> & {
  images?: ApiProductImage[];
  variants?: ApiProductVariant[];
  media_url?: string;
  category?: string | number;
};

export type CloudinaryUploadResult = {
  url: string;
  public_id?: string;
  width?: number;
  height?: number;
};

type ApiUser = Partial<User>;

// OrderItemReadSerializer only returns (id, product_name, variant_description,
// price, quantity, subtotal) - no order/product_variant FK, so those stay
// blank in the mapped OrderItem (they are not needed for display).
type ApiOrderItem = {
  id?: string | number;
  product_name?: string;
  variant_description?: string;
  price?: string | number;
  quantity?: number;
  subtotal?: string | number;
};

// OrderSerializer exposes bare FK ids (`user`, `address`) - never nested
// objects - and has no `payment` field at all.
type ApiOrder = {
  id?: string | number;
  user?: string | number;
  address?: string | number;
  status?: string;
  subtotal?: string | number;
  discount?: string | number;
  total?: string | number;
  created_at?: string;
  updated_at?: string;
  items?: ApiOrderItem[];
};

type ApiPayment = {
  payment_id?: string | number;
  id?: string | number;
  order_id?: string | number;
  provider?: string;
  transaction_id?: string | null;
  status?: string;
  amount?: string | number;
  paid_at?: string | null;
};

type ApiAuthResponse = {
  token?: string;
  access?: string;
  access_token?: string;
  refresh?: string;
  user?: ApiUser;
};

type ApiAddress = Partial<Address> & {
  user?: string;
  user_id?: string;
};

// Raw shape returned by CartItemReadSerializer - already flattened for
// display (no nested product/variant objects), so it maps almost 1:1 onto
// the frontend's `CartItem` shape.
type ApiCartItem = {
  cart_item_id?: string | number;
  product_variant?: string | number;
  product_name?: string;
  variant_description?: string;
  variant_image?: string | null;
  unit_price?: string | number;
  quantity?: number;
  subtotal?: string | number;
};

type ApiCart = {
  cart_id?: string | number;
  items?: ApiCartItem[];
  subtotal?: string | number;
  total_quantity?: number;
};

type ApiEnvelope<T> = {
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, unknown>;
};

type ProductVariantAttributePayload = {
  attribute_type: string;
  value: string;
};

type ProductVariantPayload = {
  id?: string;
  price: string | number;
  image?: string;
  public_id?: string;
  attributes: ProductVariantAttributePayload[];
};

type ProductPayload = {
  name: string;
  description: string;
  category: string | number;
  variants?: ProductVariantPayload[];
};

function isAddressLikeRecord(value: unknown): value is ApiAddress {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return Boolean(
    "street" in record ||
    "city" in record ||
    "country" in record ||
    "title" in record ||
    "is_default" in record
  );
}

function findAddressPayload(value: unknown): ApiAddress[] {
  if (Array.isArray(value)) {
    if (value.every((item) => isAddressLikeRecord(item))) {
      return value as ApiAddress[];
    }

    for (const item of value) {
      const nestedMatch = findAddressPayload(item);
      if (nestedMatch.length > 0) {
        return nestedMatch;
      }
    }

    return [];
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  if (isAddressLikeRecord(value)) {
    return [value];
  }

  for (const nestedValue of Object.values(value as Record<string, unknown>)) {
    const nestedMatch = findAddressPayload(nestedValue);
    if (nestedMatch.length > 0) {
      return nestedMatch;
    }
  }

  return [];
}

function extractAddressList(payload: ApiEnvelope<ApiAddress[]> | ApiAddress[] | Record<string, unknown>): ApiAddress[] {
  return findAddressPayload(payload);
}

function readStringValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return "";
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

// The Django `OrderStatus`/`PaymentStatus` TextChoices store their UPPERCASE
// value (e.g. "PENDING", "PAID") on the model, and that's exactly what the
// API sends back - normalized here to the Title Case union the rest of the
// UI already renders and filters against.
function normalizeOrderStatus(rawStatus: unknown): Order["status"] {
  const normalized = readStringValue(rawStatus).trim().toUpperCase();
  const known: Record<string, Order["status"]> = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    PROCESSING: "Processing",
    READY: "Ready",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    REFUNDED: "Refunded",
  };

  return known[normalized] || "Pending";
}

// Sends the UI's Title Case status back as the UPPERCASE code the backend's
// ChoiceField validates against (e.g. "Confirmed" -> "CONFIRMED").
function denormalizeOrderStatus(status: Order["status"]): string {
  return status.trim().toUpperCase();
}

function normalizePaymentStatus(rawStatus: unknown): Payment["status"] {
  const normalized = readStringValue(rawStatus).trim().toUpperCase();
  const known: Record<string, Payment["status"]> = {
    PENDING: "Pending",
    PAID: "Paid",
    FAILED: "Failed",
    CANCELLED: "Cancelled",
  };

  return known[normalized] || "Pending";
}

function parseAuthPayload(payload: unknown): { user: ApiUser; token?: string } {
  const record = (payload ?? {}) as Record<string, unknown>;
  const envelopeData = (record.data ?? null) as Record<string, unknown> | null;
  const nestedUser = record.user as ApiUser | undefined;
  const nestedEnvelopeUser = (envelopeData?.user ?? undefined) as ApiUser | undefined;
  const userPayload = nestedUser ?? nestedEnvelopeUser ?? (envelopeData as ApiUser | null) ?? (record as ApiUser);
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

export async function uploadProductImageToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(CLOUDINARY_UPLOAD_ENDPOINT, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let message = "تعذر رفع الصورة إلى Cloudinary";

    try {
      const payload = await response.json() as { message?: string };
      if (payload.message) {
        message = payload.message;
      }
    } catch {
      // keep default error message
    }

    throw new Error(message);
  }

  return response.json() as Promise<CloudinaryUploadResult>;
}

export async function createProductImage(payload: {
  product_id: string;
  image: string;
  public_id?: string;
  is_primary?: boolean;
}): Promise<ProductImage> {
  const response = await fetchWithAutoRefresh("/product-images/", {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify({
      product_id: payload.product_id,
      image: payload.image,
      ...(payload.public_id ? { public_id: payload.public_id } : {}),
      is_primary: payload.is_primary ?? false,
    }),
  }, true);

  if (!response.ok) {
    throw new Error("تعذر حفظ صورة المنتج");
  }

  const data = await response.json();

  return {
    id: readStringValue(data.id) || `img-${Math.random().toString(36).slice(2, 9)}`,
    product_id: readStringValue(data.product_id) || payload.product_id,
    media_url: readStringValue(data.image) || readStringValue(data.media_url) || payload.image,
    is_primary: Boolean(data.is_primary ?? payload.is_primary),
    sort_order: Number(data.sort_order ?? 1),
  };
}

export async function updateProductImage(
  imageId: string,
  updates: { is_primary?: boolean; image?: string }
): Promise<ProductImage> {
  const response = await fetchWithAutoRefresh(`/product-images/${imageId}/`, {
    method: "PATCH",
    headers: buildAuthHeaders(),
    body: JSON.stringify(updates),
  }, true);

  if (!response.ok) {
    throw new Error("تعذر تحديث صورة المنتج");
  }

  const data = await response.json();

  return {
    id: readStringValue(data.id) || imageId,
    product_id: readStringValue(data.product_id),
    media_url: readStringValue(data.image) || readStringValue(data.media_url) || updates.image || "",
    is_primary: Boolean(data.is_primary ?? updates.is_primary),
    sort_order: Number(data.sort_order ?? 0),
  };
}

export async function deleteProductImage(imageId: string): Promise<void> {
  const response = await fetchWithAutoRefresh(`/product-images/${imageId}/`, {
    method: "DELETE",
    headers: buildAuthHeaders(false),
  }, true);

  if (!response.ok) {
    throw new Error("تعذر حذف صورة المنتج");
  }
}

let refreshRequest: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshRequest) {
    refreshRequest = (async () => {
      const response = await fetch(`${BASE_URL}/auth/refresh/`, {
        method: "POST",
        credentials: "include",
        headers: buildAuthHeaders(false),
        cache: "no-store",
      });

      return response.ok;
    })();
  }

  try {
    return await refreshRequest;
  } finally {
    refreshRequest = null;
  }
}

async function fetchWithAutoRefresh(
  path: string,
  init: RequestInit = {},
  retryOnUnauthorized = false
): Promise<Response> {
  const runRequest = () =>
    fetch(`${BASE_URL}${path}`, {
      ...init,
      cache: init.cache ?? "no-store",
      credentials: "include",
    });

  const response = await runRequest();

  if (!retryOnUnauthorized || response.status !== 401) {
    return response;
  }

  const refreshed = await refreshAccessToken();

  if (!refreshed) {
    return response;
  }

  return runRequest();
}

async function fetchFromFirstAvailable(
  paths: string[],
  init: RequestInit = {},
  retryOnUnauthorized = false
): Promise<Response> {
  let lastResponse: Response | null = null;

  for (const path of paths) {
    const response = await fetchWithAutoRefresh(path, init, retryOnUnauthorized);

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

// The `OrderSerializer` never embeds a nested `payment`, so this always
// synthesizes a placeholder "Pending/COD" payment from the order itself
// unless an actual Payment payload was fetched separately (e.g. via
// `fetchPaymentStatus`) and passed in.
function mapDjangoPayment(djangoPayment: ApiPayment | undefined, order: ApiOrder & { id: string }): Payment | undefined {
  if (!djangoPayment) {
    return {
      id: `pay-${order.id || "pending"}`,
      order_id: order.id || "",
      provider: "Paymob",
      transaction_id: "",
      status: "Pending",
      amount: Number(order.total || 0),
      paid_at: null,
    };
  }

  return {
    id: readStringValue(djangoPayment.id ?? djangoPayment.payment_id) || `pay-${order.id || "pending"}`,
    order_id: readStringValue(djangoPayment.order_id) || order.id || "",
    provider: "Paymob",
    transaction_id: readStringValue(djangoPayment.transaction_id),
    status: normalizePaymentStatus(djangoPayment.status),
    amount: Number(djangoPayment.amount ?? order.total ?? 0),
    paid_at: typeof djangoPayment.paid_at === "string" ? djangoPayment.paid_at : null,
  };
}

function mapDjangoOrderItem(item: ApiOrderItem): OrderItem {
  return {
    id: readStringValue(item.id) || `item-${Math.random().toString(36).slice(2, 9)}`,
    order_id: "",
    product_variant_id: "",
    product_name: readStringValue(item.product_name),
    variant_description: readStringValue(item.variant_description) || "Default",
    price: Number(item.price || 0),
    quantity: Number(item.quantity || 1),
    subtotal: Number(item.subtotal || Number(item.price || 0) * Number(item.quantity || 1)),
  };
}

// --- MAPPING UTILITIES ---

// ProductImageSerializer returns { id, image, is_primary } with no FK or
// ordering field, so `product_id` and `sort_order` are reattached here.
function mapDjangoProductImage(rawImage: ApiProductImage, productId: string, index: number): ProductImage {
  return {
    id: readStringValue(rawImage?.id) || `img-${productId}-${index}`,
    product_id: productId,
    media_url: readStringValue(rawImage?.image),
    is_primary: Boolean(rawImage?.is_primary),
    sort_order: index,
  };
}

// ProductVariantAttributeSerializer returns { id, attribute_type, value }
// with no FK back to the variant, so `product_variant_id` is reattached here.
function mapDjangoVariantAttribute(rawAttribute: ApiProductVariantAttribute, variantId: string): ProductVariantAttribute {
  return {
    id: Number(rawAttribute?.id) || 0,
    product_variant_id: variantId,
    attribute_type: readStringValue(rawAttribute?.attribute_type),
    value: readStringValue(rawAttribute?.value),
  };
}

// ProductVariantSerializer returns { id, price, image, attributes } with no
// FK back to the product, so `product_id` is reattached here, and `image` is
// remapped to the UI-facing `media_url` field.
function mapDjangoProductVariant(rawVariant: ApiProductVariant, productId: string): ProductVariant {
  const variantId = readStringValue(rawVariant?.id) || `variant-${productId}-${Math.random().toString(36).slice(2, 9)}`;

  return {
    id: variantId,
    product_id: productId,
    price: Number(rawVariant?.price ?? 0),
    media_url: readStringValue(rawVariant?.image) || null,
    attributes: Array.isArray(rawVariant?.attributes)
      ? rawVariant.attributes.map((attribute) => mapDjangoVariantAttribute(attribute, variantId))
      : [],
  };
}

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

  const productId = readStringValue(djangoProd.id);

  const variants: ProductVariant[] = Array.isArray(djangoProd.variants)
    ? djangoProd.variants.map((variant) => mapDjangoProductVariant(variant, productId))
    : [];

  // The backend has no explicit image ordering field, so images are mapped
  // in the order returned, then re-sorted with the primary image first so
  // the storefront gallery and product card thumbnail stay consistent.
  const images: ProductImage[] = (Array.isArray(djangoProd.images) ? djangoProd.images : [])
    .map((image, index) => mapDjangoProductImage(image, productId, index))
    .sort((left, right) => Number(right.is_primary) - Number(left.is_primary))
    .map((image, index) => ({ ...image, sort_order: index }));

  // Extract primary image or fallback to first, or generic placeholder
  const primaryImg = images.find((img) => img.is_primary) || images[0];
  const imageUrl = primaryImg?.media_url || djangoProd.media_url || PRODUCT_IMAGE_PLACEHOLDER;

  // Extract price from first variant, or use flat price
  const price = variants[0]?.price ?? Number(djangoProd.price ?? 0);

  // `category` is a PrimaryKeyRelatedField on the backend (just the id), and
  // `category_id` is never actually sent by the API, so both UI-facing
  // fields are derived from the same `category` value here.
  const categoryValue = readStringValue(djangoProd.category);

  return {
    ...djangoProd,
    id: productId,
    category_id: categoryValue,
    name: djangoProd.name || "",
    description: djangoProd.description || "",
    images,
    variants,
    price: Number(price),
    image: imageUrl,
    category: categoryValue,
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

// `OrderSerializer` only ever returns bare FK ids for `user`/`address` and
// never a nested payment - so `customerName`/`customerPhone`/`address` stay
// generic placeholders here; callers that already know the real customer
// (e.g. the profile page showing the logged-in user's own orders, or the
// checkout flow that already has the selected Address in hand) should
// override those UI-compatibility fields with the real data they have.
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

  const orderId = readStringValue(djangoOrder.id);

  return {
    id: orderId,
    user_id: readStringValue(djangoOrder.user) || null,
    address_id: readStringValue(djangoOrder.address) || null,
    status: normalizeOrderStatus(djangoOrder.status),
    subtotal: Number(djangoOrder.subtotal || 0),
    discount: Number(djangoOrder.discount || 0),
    total: Number(djangoOrder.total || 0),
    created_at: djangoOrder.created_at || new Date().toISOString(),
    updated_at: djangoOrder.updated_at || new Date().toISOString(),

    // UI compatibility fields
    orderNumber: orderId ? `TH-${orderId.padStart(6, "0")}` : "",
    customerName: "عميل صالون",
    customerPhone: "",
    city: "القاهرة",
    address: "العنوان بالتفصيل",
    payment: mapDjangoPayment(undefined, { ...djangoOrder, id: orderId }),
    items: Array.isArray(djangoOrder.items) ? djangoOrder.items.map(mapDjangoOrderItem) : [],
  };
}

export function mapDjangoAddress(djangoAddress: ApiAddress): Address {
  const source = (djangoAddress ?? {}) as Record<string, unknown>;
  const now = new Date().toISOString();

  return {
    id: readStringValue(source.id) || "",
    user_id: readStringValue(source.user_id) || readStringValue(source.user) || "",
    title: readStringValue(source.title),
    country: readStringValue(source.country),
    city: readStringValue(source.city),
    street: readStringValue(source.street),
    is_default: Boolean(source.is_default),
    created_at: readStringValue(source.created_at) || now,
    updated_at: readStringValue(source.updated_at) || now,
  };
}

// --- API ACTIONS ---

// Fetch all products from Django API, following pagination until every page is collected
export async function fetchProducts(): Promise<Product[]> {
  const collected: ApiProduct[] = [];
  let nextPath: string | null = "/products/?page_size=100";

  while (nextPath) {
    const response = await fetchFromFirstAvailable([nextPath]);
    if (!response.ok) {
      throw new Error("حدث خطأ أثناء جلب المنتجات من الخادم");
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      collected.push(...data);
      break;
    }

    if (data && Array.isArray(data.results)) {
      collected.push(...data.results);
      const nextUrl = typeof data.next === "string" ? data.next : null;
      nextPath = nextUrl ? nextUrl.slice(nextUrl.indexOf("/products/")) : null;
    } else {
      break;
    }
  }

  return collected.map(mapDjangoProduct);
}

export async function fetchProductById(productId: string): Promise<Product> {
  const response = await fetchFromFirstAvailable([
    `/products/${productId}/`,
  ]);

  if (!response.ok) {
    throw new Error("تعذر جلب بيانات المنتج");
  }

  const data = await response.json();
  return mapDjangoProduct(data);
}

// Fetch all categories from Django API
export async function fetchCategories(): Promise<Category[]> {
  const response = await fetchWithAutoRefresh("/categories/", {}, true);
  if (!response.ok) {
    throw new Error("حدث خطأ أثناء جلب الأقسام من الخادم");
  }
  const data = await response.json();
  return Array.isArray(data) ? data.map(mapDjangoCategory) : [];
}

// Fetch all orders visible to the current user (their own orders, or every
// order for staff/admin accounts) from Django API, following DRF's default
// pagination until every page is collected.
export async function fetchOrders(): Promise<Order[]> {
  const collected: ApiOrder[] = [];
  let nextPath: string | null = "/orders/?page_size=100";

  while (nextPath) {
    const response = await fetchWithAutoRefresh(nextPath, {
      headers: buildAuthHeaders(false),
    }, true);

    if (!response.ok) {
      throw new Error("حدث خطأ أثناء جلب الطلبات من الخادم");
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      collected.push(...data);
      break;
    }

    if (data && Array.isArray(data.results)) {
      collected.push(...data.results);
      const nextUrl = typeof data.next === "string" ? data.next : null;
      nextPath = nextUrl ? nextUrl.slice(nextUrl.indexOf("/orders/")) : null;
    } else {
      break;
    }
  }

  return collected.map(mapDjangoOrder);
}

export async function fetchOrderById(orderId: string): Promise<Order> {
  const response = await fetchWithAutoRefresh(`/orders/${orderId}/`, {
    headers: buildAuthHeaders(false),
  }, true);

  if (!response.ok) {
    throw new Error("تعذر جلب بيانات الطلب");
  }

  const data = await response.json();
  return mapDjangoOrder(data);
}

async function readErrorDetail(response: Response, fallbackMessage: string): Promise<string> {
  try {
    const payload = await response.json();
    const record = (payload ?? {}) as Record<string, unknown>;

    if (typeof record.detail === "string") {
      return record.detail;
    }

    const firstField = Object.values(record).find((value) => Array.isArray(value) && value.length > 0) as
      | unknown[]
      | undefined;

    if (firstField && typeof firstField[0] === "string") {
      return firstField[0];
    }
  } catch {
    // fall through to default message below
  }

  return fallbackMessage;
}

// Submit a new order to the Django API. The backend derives the order's
// items/subtotal/total from the user's current server-side cart (and clears
// that cart once the order is created) - the only thing the client sends is
// which of the user's own addresses to ship to.
export async function createOrder(addressId: string): Promise<Order> {
  const response = await fetchWithAutoRefresh("/orders/", {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify({ address: addressId }),
  }, true);

  if (!response.ok) {
    throw new Error(await readErrorDetail(response, "فشل إرسال الطلب، الرجاء المحاولة مرة أخرى"));
  }

  const data = await response.json();
  return mapDjangoOrder(data);
}

// Cancel one of the current user's own orders (or any order, for staff).
export async function cancelOrder(orderId: string): Promise<void> {
  const response = await fetchWithAutoRefresh(`/orders/${orderId}/cancel/`, {
    method: "PATCH",
    headers: buildAuthHeaders(),
  }, true);

  if (!response.ok) {
    throw new Error(await readErrorDetail(response, "تعذر إلغاء الطلب"));
  }
}

export type PaymentIntention = {
  paymentId: string;
  merchantOrderId: string;
  checkoutUrl: string;
  clientSecret: string;
};

// Task 6: create a Paymob payment intention for a pending order and return
// the hosted checkout URL to redirect the browser to.
export async function createPaymentIntention(orderId: string): Promise<PaymentIntention> {
  const response = await fetchWithAutoRefresh(`/orders/${orderId}/pay/`, {
    method: "POST",
    headers: buildAuthHeaders(),
  }, true);

  if (!response.ok) {
    throw new Error(await readErrorDetail(response, "تعذر إنشاء عملية الدفع الإلكتروني، حاول مرة أخرى"));
  }

  const data = await response.json();

  return {
    paymentId: readStringValue(data.payment_id),
    merchantOrderId: readStringValue(data.merchant_order_id),
    checkoutUrl: readStringValue(data.checkout_url),
    clientSecret: readStringValue(data.client_secret),
  };
}

export type PaymentStatusResult = {
  orderStatus: Order["status"];
  paymentStatus: Payment["status"];
  transactionId: string | null;
};

// Polling endpoint for the (non-authoritative) redirect back from Paymob's
// hosted checkout page - only the order's own owner may call this.
export async function fetchPaymentStatus(orderId: string): Promise<PaymentStatusResult> {
  const response = await fetchWithAutoRefresh(`/orders/${orderId}/payment-status/`, {
    headers: buildAuthHeaders(false),
  }, true);

  if (!response.ok) {
    throw new Error(await readErrorDetail(response, "تعذر جلب حالة الدفع"));
  }

  const data = await response.json();

  return {
    orderStatus: normalizeOrderStatus(data.order_status),
    paymentStatus: normalizePaymentStatus(data.payment_status),
    transactionId: typeof data.transaction_id === "string" ? data.transaction_id : null,
  };
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
    credentials: "omit",
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

  const response = await fetchWithAutoRefresh("/auth/register/", {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify(djangoPayload),
  }, true);

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
  const response = await fetchWithAutoRefresh("/auth/me/", {
    method: "GET",
    headers: buildAuthHeaders(),
    cache: "no-store",
  }, true);

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

export async function updateUserProfile(updates: { first_name: string; last_name: string }): Promise<User> {
  const response = await fetchWithAutoRefresh("/users/update_profile/", {
    method: "PUT",
    headers: buildAuthHeaders(),
    body: JSON.stringify(updates),
  }, true);

  if (!response.ok) {
    throw new Error("تعذر تحديث بيانات الملف الشخصي");
  }

  const payload = (await response.json()) as ApiEnvelope<ApiUser> | ApiUser;
  const userPayload = "data" in (payload as ApiEnvelope<ApiUser>)
    ? (payload as ApiEnvelope<ApiUser>).data
    : (payload as ApiUser);

  return mapDjangoUser(userPayload ?? updates);
}

export async function deleteUserProfile(): Promise<void> {
  const response = await fetchWithAutoRefresh("/users/delete_profile/", {
    method: "DELETE",
    headers: buildAuthHeaders(false),
  }, true);

  if (!response.ok) {
    throw new Error("تعذر حذف الملف الشخصي");
  }
}

export async function fetchUserAddresses(): Promise<Address[]> {
  const response = await fetchWithAutoRefresh("/users/get_addresses/", {
    method: "GET",
    headers: buildAuthHeaders(),
  }, true);

  if (!response.ok) {
    throw new Error("تعذر جلب العناوين");
  }

  const payload = (await response.json()) as ApiEnvelope<ApiAddress[]> | ApiAddress[] | Record<string, unknown>;
  return extractAddressList(payload).map(mapDjangoAddress);
}

export async function fetchUserAddressById(addressId: string): Promise<Address> {
  const response = await fetchWithAutoRefresh(`/users/get_address_by_id/${addressId}/`, {
    method: "GET",
    headers: buildAuthHeaders(),
  }, true);

  if (!response.ok) {
    throw new Error("تعذر جلب بيانات العنوان");
  }

  const payload = (await response.json()) as ApiEnvelope<ApiAddress> | ApiAddress;
  const addressPayload = "data" in (payload as ApiEnvelope<ApiAddress>)
    ? (payload as ApiEnvelope<ApiAddress>).data
    : (payload as ApiAddress);

  return mapDjangoAddress(addressPayload ?? {});
}

export async function createUserAddress(address: {
  title: string;
  country: string;
  city: string;
  street: string;
  is_default?: boolean;
}): Promise<Address> {
  const response = await fetchWithAutoRefresh("/users/add_address/", {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify(address),
  }, true);

  if (!response.ok) {
    throw new Error("تعذر إضافة العنوان الجديد");
  }

  const payload = (await response.json()) as ApiEnvelope<ApiAddress> | ApiAddress;
  const addressPayload = "data" in (payload as ApiEnvelope<ApiAddress>)
    ? (payload as ApiEnvelope<ApiAddress>).data
    : (payload as ApiAddress);

  return mapDjangoAddress(addressPayload ?? address);
}

export async function updateUserAddress(
  addressId: string,
  address: { title: string; country: string; city: string; street: string }
): Promise<Address> {
  const response = await fetchWithAutoRefresh(`/users/update_address/${addressId}/`, {
    method: "PUT",
    headers: buildAuthHeaders(),
    body: JSON.stringify(address),
  }, true);

  if (!response.ok) {
    throw new Error("تعذر تحديث العنوان");
  }

  const payload = (await response.json()) as ApiEnvelope<ApiAddress> | ApiAddress;
  const addressPayload = "data" in (payload as ApiEnvelope<ApiAddress>)
    ? (payload as ApiEnvelope<ApiAddress>).data
    : (payload as ApiAddress);

  return mapDjangoAddress(addressPayload ?? address);
}

export async function setDefaultUserAddress(addressId: string): Promise<Address> {
  const response = await fetchWithAutoRefresh(`/users/set_default_address/${addressId}/`, {
    method: "PUT",
    headers: buildAuthHeaders(),
  }, true);

  if (!response.ok) {
    throw new Error("تعذر تعيين العنوان الافتراضي");
  }

  const payload = (await response.json()) as ApiEnvelope<ApiAddress> | ApiAddress;
  const addressPayload = "data" in (payload as ApiEnvelope<ApiAddress>)
    ? (payload as ApiEnvelope<ApiAddress>).data
    : (payload as ApiAddress);

  return mapDjangoAddress(addressPayload ?? {});
}

export async function deleteUserAddress(addressId: string): Promise<void> {
  const response = await fetchWithAutoRefresh(`/users/delete_address/${addressId}/`, {
    method: "DELETE",
    headers: buildAuthHeaders(false),
  }, true);

  if (!response.ok) {
    throw new Error("تعذر حذف العنوان");
  }
}

export async function logoutUser(): Promise<void> {
  await fetchWithAutoRefresh("/auth/logout/", {
    method: "POST",
    headers: buildAuthHeaders(),
  }, true);
}

// Update order status (Admin/Moderator only). The backend's ChoiceField
// validates against the raw UPPERCASE enum value, so the UI's Title Case
// status is denormalized before sending.
export async function updateOrderStatus(orderId: string, updates: { status?: Order["status"] }): Promise<Order> {
  const response = await fetchWithAutoRefresh(`/orders/${orderId}/`, {
    method: "PATCH",
    headers: buildAuthHeaders(),
    body: JSON.stringify({
      ...updates,
      status: updates.status ? denormalizeOrderStatus(updates.status) : undefined,
    }),
  }, true);
  if (!response.ok) {
    throw new Error(await readErrorDetail(response, "فشل تحديث حالة الطلب"));
  }
  const data = await response.json();
  return mapDjangoOrder(data);
}

// Product CRUD (Admin only)
export async function createProduct(productData: ProductPayload): Promise<Product> {
  const response = await fetchFromFirstAvailable([
    "/products/",
  ], {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify({
      name: productData.name,
      description: productData.description,
      category: productData.category,
      variants: productData.variants || [],
    }),
  }, true);
  if (!response.ok) {
    throw new Error("فشل إضافة المنتج الجديد");
  }
  const data = await response.json();
  return mapDjangoProduct(data);
}

export async function updateProduct(productId: string, productData: Partial<ProductPayload>): Promise<Product> {
  const response = await fetchFromFirstAvailable([
    `/products/${productId}/`,
  ], {
    method: "PUT",
    headers: buildAuthHeaders(),
    body: JSON.stringify({
      ...productData,
      category: productData.category,
    }),
  }, true);
  if (!response.ok) {
    throw new Error("فشل تعديل المنتج");
  }
  const data = await response.json();
  return mapDjangoProduct(data);
}

export async function deleteProduct(productId: string): Promise<boolean> {
  const response = await fetchFromFirstAvailable([
    `/products/${productId}/`,
  ], {
    method: "DELETE",
  }, true);
  if (!response.ok) {
    throw new Error("فشل حذف المنتج");
  }
  return true;
}

// Soft-deleted products recycle bin (Admin only)
export async function fetchDeletedProducts(): Promise<Product[]> {
  const response = await fetchWithAutoRefresh("/products/deleted/", {
    headers: buildAuthHeaders(false),
  }, true);
  if (!response.ok) {
    throw new Error("تعذر جلب المنتجات المحذوفة");
  }
  const data = await response.json();
  const results = Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];
  return results.map(mapDjangoProduct);
}

export async function restoreProduct(productId: string): Promise<Product> {
  const response = await fetchWithAutoRefresh(`/products/${productId}/restore/`, {
    method: "PATCH",
    headers: buildAuthHeaders(false),
  }, true);
  if (!response.ok) {
    throw new Error("فشل استرجاع المنتج");
  }
  return fetchProductById(productId);
}

export async function hardDeleteProduct(productId: string): Promise<void> {
  const response = await fetchWithAutoRefresh(`/products/${productId}/hard-delete/`, {
    method: "DELETE",
    headers: buildAuthHeaders(false),
  }, true);
  if (!response.ok) {
    throw new Error("فشل الحذف النهائي للمنتج");
  }
}

// The nested `variants` update on PUT/PATCH /products/{id}/ now only edits
// variants that are sent with an existing `id` - it no longer creates or
// deletes variants implicitly. Adding/removing a variant on an existing
// product must go through this dedicated endpoint instead.
export async function createProductVariant(payload: {
  product_id: string;
  price: string | number;
  image?: string;
  attributes: ProductVariantAttributePayload[];
}): Promise<ProductVariant> {
  const response = await fetchWithAutoRefresh("/product-variants/", {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify({
      product_id: payload.product_id,
      price: payload.price,
      ...(payload.image ? { image: payload.image } : {}),
      attributes: payload.attributes,
    }),
  }, true);
  if (!response.ok) {
    throw new Error("تعذر إضافة الـ Variant الجديد");
  }
  const data = await response.json();
  return mapDjangoProductVariant(data, payload.product_id);
}

export async function deleteProductVariant(variantId: string): Promise<void> {
  const response = await fetchWithAutoRefresh(`/product-variants/${variantId}/`, {
    method: "DELETE",
    headers: buildAuthHeaders(false),
  }, true);
  if (!response.ok) {
    throw new Error("تعذر حذف الـ Variant");
  }
}

export async function createCategory(categoryData: { name: string; image?: string; public_id?: string }): Promise<Category> {
  const response = await fetchWithAutoRefresh("/categories/", {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify({
      name: categoryData.name,
      media_url: categoryData.image || "",
      image: categoryData.image || "",
      ...(categoryData.public_id ? { public_id: categoryData.public_id } : {}),
    }),
  }, true);

  if (!response.ok) {
    throw new Error("فشل إنشاء القسم");
  }

  const data = await response.json();
  return mapDjangoCategory(data);
}

export async function updateCategory(categoryId: string, categoryData: { name: string; image?: string; public_id?: string }): Promise<Category> {
  const response = await fetchWithAutoRefresh(`/categories/${categoryId}/`, {
    method: "PUT",
    headers: buildAuthHeaders(),
    body: JSON.stringify({
      name: categoryData.name,
      media_url: categoryData.image || "",
      image: categoryData.image || "",
      ...(categoryData.public_id ? { public_id: categoryData.public_id } : {}),
    }),
  }, true);

  if (!response.ok) {
    throw new Error("فشل تعديل القسم");
  }

  const data = await response.json();
  return mapDjangoCategory(data);
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const response = await fetchWithAutoRefresh(`/categories/${categoryId}/`, {
    method: "DELETE",
    headers: buildAuthHeaders(false),
  }, true);

  if (!response.ok) {
    throw new Error("فشل حذف القسم");
  }
}

// Cart (Authenticated users only - CartViewSet uses IsAuthenticated).
// CartItemReadSerializer already returns a flattened, display-ready shape
// (no nested product/variant objects), so mapping is a straight field rename.
function mapDjangoCartItem(rawItem: ApiCartItem): CartItem {
  const quantity = Number(rawItem?.quantity ?? 1);
  const unitPrice = Number(rawItem?.unit_price ?? 0);

  return {
    cart_item_id: readStringValue(rawItem?.cart_item_id) || undefined,
    product_variant_id: readStringValue(rawItem?.product_variant),
    product_name: readStringValue(rawItem?.product_name),
    variant_description: readStringValue(rawItem?.variant_description),
    image: readStringValue(rawItem?.variant_image) || PRODUCT_IMAGE_PLACEHOLDER,
    unit_price: unitPrice,
    quantity,
    subtotal: Number(rawItem?.subtotal ?? unitPrice * quantity),
  };
}

export async function fetchCart(): Promise<CartItem[]> {
  const response = await fetchWithAutoRefresh("/cart/", {
    headers: buildAuthHeaders(false),
  }, true);

  if (!response.ok) {
    throw new Error("تعذر جلب سلة المشتريات");
  }

  const data = (await response.json()) as ApiCart;
  const items = Array.isArray(data?.items) ? data.items : [];
  return items.map(mapDjangoCartItem);
}

export async function addCartItem(productVariantId: string, quantity = 1): Promise<CartItem> {
  const response = await fetchWithAutoRefresh("/cart/items/", {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify({
      product_variant: productVariantId,
      quantity,
    }),
  }, true);

  if (!response.ok) {
    throw new Error("تعذر إضافة المنتج إلى السلة");
  }

  const data = await response.json();
  return mapDjangoCartItem(data);
}

export async function updateCartItem(cartItemId: string, quantity: number): Promise<CartItem> {
  const response = await fetchWithAutoRefresh(`/cart/items/${cartItemId}/update/`, {
    method: "PATCH",
    headers: buildAuthHeaders(),
    body: JSON.stringify({ quantity }),
  }, true);

  if (!response.ok) {
    throw new Error("تعذر تحديث كمية المنتج في السلة");
  }

  const data = await response.json();
  return mapDjangoCartItem(data);
}

export async function removeCartItem(cartItemId: string): Promise<void> {
  const response = await fetchWithAutoRefresh(`/cart/items/${cartItemId}/remove/`, {
    method: "DELETE",
    headers: buildAuthHeaders(false),
  }, true);

  if (!response.ok) {
    throw new Error("تعذر حذف المنتج من السلة");
  }
}

export async function clearCart(): Promise<void> {
  const response = await fetchWithAutoRefresh("/cart/clear/", {
    method: "DELETE",
    headers: buildAuthHeaders(false),
  }, true);

  if (!response.ok) {
    throw new Error("تعذر تفريغ السلة");
  }
}

export async function fetchCartCount(): Promise<number> {
  const response = await fetchWithAutoRefresh("/cart/count/", {
    headers: buildAuthHeaders(false),
  }, true);

  if (!response.ok) {
    throw new Error("تعذر جلب عدد عناصر السلة");
  }

  const data = await response.json();
  return Number(data?.count ?? 0);
}
