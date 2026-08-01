import Link from "next/link";
import PageState from "../components/ui/PageState";

export default function NotFound() {
  return (
    <PageState
      variant="error"
      title="الصفحة غير موجودة"
      message="الرابط الذي فتحته غير صحيح أو تم نقله، تأكد من الرابط أو عد إلى الصفحة الرئيسية."
      fullPage
      action={
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-gold-400 px-6 py-2.5 text-xs font-extrabold text-dark-bg transition-colors hover:bg-gold-500"
        >
          العودة للرئيسية
        </Link>
      }
    />
  );
}
