import Link from "next/link";
import { requireSuperAdmin } from "@/lib/permissions";

export default async function AdminPlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSuperAdmin();

  return (
    <div className="flex flex-1 flex-col">
      <nav className="flex flex-wrap items-center gap-4 border-b border-gray-200 bg-white px-6 py-3">
        <span className="font-bold text-brand-primary">Panel SUPER ADMIN</span>
        <Link href="/admin-platform" className="text-sm text-brand-primary/70 hover:text-brand-primary">
          Resumen
        </Link>
        <Link href="/admin-platform/organizaciones" className="text-sm text-brand-primary/70 hover:text-brand-primary">
          Organizaciones
        </Link>
        <Link href="/admin-platform/planes" className="text-sm text-brand-primary/70 hover:text-brand-primary">
          Planes
        </Link>
        <a href="/dashboard" className="ml-auto text-sm text-brand-primary/70 hover:text-brand-primary">
          ← Mi cuenta
        </a>
      </nav>
      {children}
    </div>
  );
}
