import type { Order, User } from "@/types";

// The backend exposes no endpoint that lists all registered users/customers/admins
// (only `/auth/me/` for the current user, and orders embed a role-less
// `{id, first_name, last_name, phone}` user object). This is the only real,
// per-user data available in bulk on the frontend: every distinct customer who
// has placed at least one order, deduped by phone number. It cannot tell
// customers and admins/moderators apart, so it is shared between the
// customers and users admin pages instead of maintaining separate fake lists.
export function extractUsersFromOrders(orders: Order[]): User[] {
  const users = new Map<string, User>();

  orders.forEach((order) => {
    const phone = order.customerPhone?.trim();
    if (!phone || users.has(phone)) {
      return;
    }

    const [first_name = "مستخدم", ...rest] = (order.customerName || "").split(" ");
    users.set(phone, {
      id: order.user_id ? String(order.user_id) : phone,
      first_name,
      last_name: rest.join(" ") || "",
      phone,
      role: "Customer",
      is_active: true,
      created_at: order.created_at,
      updated_at: order.updated_at,
      deleted_at: null,
    });
  });

  return Array.from(users.values());
}
