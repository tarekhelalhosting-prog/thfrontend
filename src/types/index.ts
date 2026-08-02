export interface User {
  id: string; // UUID (PK)
  first_name: string;
  last_name: string;
  phone: string; // Unique, used for login & communication
  role: 'Admin' | 'Moderator' | 'Customer';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null; // Soft Delete
}

export interface Address {
  id: string; // UUID (PK)
  user_id: string; // FK to User
  title: string; // Home - Work - etc.
  country: string;
  city: string;
  street: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string; // UUID (PK)
  name: string;
  media_url: string; // Category image URL
  public_id?: string; // Cloudinary public_id for the category image
  description?: string; // category description
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null; // Soft Delete
  
  // UI Compatibility Field
  image?: string; // fallback to media_url
}

export interface Product {
  id: string; // UUID (PK)
  category_id: string; // FK to Category
  name: string;
  description: string;
  created_by?: string; // FK to User
  updated_by?: string; // FK to User
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null; // Soft Delete

  // Related Django Entities (automatically included or fetched via prefetch_related / select_related)
  images?: ProductImage[];
  variants?: ProductVariant[];
  category_obj?: Category; // Nested Category info

  // UI Compatibility Fields derived from existing schema entities only
  price: number; // mapped from default/first variant price
  image: string; // mapped from the primary ProductImage media_url
  category: string; // mapped from category_id

  // Legacy optional UI fields kept for compile compatibility in unused components.
  originalPrice?: number;
  rating?: number;
  reviewsCount?: number;
  discountBadge?: string;
  features?: string[];
  isBestSeller?: boolean;
  isOnOffer?: boolean;
}

export interface SalonBundle {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  itemsList?: string[];
}

export interface ProductImage {
  id: string; // UUID (PK)
  product_id: string; // FK to Product
  media_url: string; // Cloudinary URL
  public_id?: string; // Cloudinary public_id for the image
  is_primary: boolean;
  sort_order: number;
}

export interface ProductVariant {
  id: string; // UUID (PK)
  product_id: string; // FK to Product
  price: number; // final price for this variant
  media_url?: string | null; // optional specific variant image
  public_id?: string | null; // Cloudinary public_id for the variant image
  created_at?: string;
  updated_at?: string;
  attributes?: ProductVariantAttribute[]; // fetched variant attributes
}

export interface ProductVariantAttribute {
  id: number; // PK
  product_variant_id: string; // FK to ProductVariant
  attribute_type: string; // attribute type e.g. Color, Size, Volume...
  value: string; // attribute value (e.g. Black, XL)
}

export interface Offer {
  id: string; // BigAutoField (PK)
  name: string;
  offer_type: 'PERCENTAGE' | 'FIXED' | 'BUY_X_GET_Y';
  value: number | null; // percentage or fixed amount; optional for Buy X Get Y
  starts_at: string; // ISO datetime
  ends_at: string; // ISO datetime
  is_active: boolean;
  offer_products: OfferProduct[];
  created_at?: string;
  updated_at?: string;
}

export interface OfferProduct {
  id?: string; // BigAutoField (PK), absent for not-yet-saved rows in a form
  product: string; // FK to Product
  product_name?: string; // read-only, from OfferProductSerializer
  variant?: string | null; // FK to ProductVariant, null = applies to whole product
  variant_description?: string | null; // read-only, from OfferProductSerializer
  item_type: 'REQUIRED' | 'GIFT';
  quantity: number;
}

// Singleton site settings (always pk=1 server-side, GET/PATCH only, no create/delete).
export interface Order {
  id: string; // UUID (PK)
  user_id?: string | null; // FK to User
  address_id?: string | null; // FK to Address
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Ready' | 'Completed' | 'Cancelled' | 'Refunded';
  subtotal: number;
  discount: number;
  total: number;
  created_at: string;
  updated_at: string;

  // Nested relations
  items?: OrderItem[];

  // UI Compatibility fields
  orderNumber?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  city?: string;
  address?: string;
}

export interface OrderItem {
  id: string; // PK
  order_id: string; // FK to Order
  product_variant_id: string; // FK to ProductVariant
  product_name: string; // name at purchase time
  variant_description: string; // e.g. Black - M
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Payment {
  id: string; // PK
  order_id: string; // FK to Order
  provider: 'Paymob';
  transaction_id: string;
  status: 'Pending' | 'Paid' | 'Failed' | 'Cancelled';
  amount: number;
  paid_at?: string | null;
}

export interface CartItem {
  cart_item_id?: string; // backend CartItem PK; present once persisted server-side (authenticated users only)
  product_variant_id: string; // FK to ProductVariant - unique key for a cart line (backend enforces one line per variant per cart)
  product_name: string;
  variant_description: string; // e.g. "Black - M", empty string when the variant has no attributes
  image: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface Review {
  id: string;
  name: string;
  city: string;
  text: string;
  rating: number;
  image?: string;
}

