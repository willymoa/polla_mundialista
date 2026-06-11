import { requireSuperAdmin } from "@/lib/permissions";
import { AppNav } from "@/components/AppNav";

export default async function AdminPlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSuperAdmin();

  const links = [
    { href: "/admin-platform", label: "Resumen" },
    { href: "/admin-platform/organizaciones", label: "Organizaciones" },
    { href: "/admin-platform/planes", label: "Planes" },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <AppNav
        title="Panel SUPER ADMIN"
        links={links}
        backLink={{ href: "/dashboard", label: "Mi cuenta" }}
      />
      {children}
    </div>
  );
}
