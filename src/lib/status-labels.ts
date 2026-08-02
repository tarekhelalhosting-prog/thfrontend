const STATUS_LABELS: Record<string, string> = {
  all: "الكل",
  pending: "قيد الانتظار",
  confirmed: "تم الدفع",
  processing: "جاري التجهيز",
  ready: "جاهز للاستلام",
  completed: "تم التسليم",
  cancelled: "تم الإلغاء",
  refunded: "تم الاسترداد",
  paid: "تم الدفع",
  failed: "فشل الدفع",
};

export function translateStatusLabel(status: string): string {
  const normalized = status.trim().toLowerCase();
  return STATUS_LABELS[normalized] || status;
}