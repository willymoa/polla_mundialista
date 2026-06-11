import { requirePollaAccess, esAdminPolla } from "@/lib/permissions";
import { PollaEstadoBanner } from "@/components/PollaEstadoBanner";
import { AppNav } from "@/components/AppNav";

export default async function PollaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgSlug: string; pollaSlug: string }>;
}) {
  const { orgSlug, pollaSlug } = await params;
  const { polla, membresiaOrg, participante } = await requirePollaAccess(orgSlug, pollaSlug);

  const esAdmin = esAdminPolla(membresiaOrg, participante);
  const base = `/org/${orgSlug}/pollas/${pollaSlug}`;

  const links = [
    { href: base, label: "Resumen" },
    { href: `${base}/equipos`, label: "Equipos" },
    { href: `${base}/partidos`, label: "Partidos" },
    { href: `${base}/pronosticos`, label: "Mis pronósticos" },
    { href: `${base}/ranking`, label: "Ranking" },
    ...(esAdmin ? [{ href: `${base}/resultados`, label: "Resultados" }] : []),
    ...(esAdmin ? [{ href: `${base}/configuracion`, label: "Configuración" }] : []),
  ];

  return (
    <div className="flex flex-1 flex-col">
      <AppNav
        title={polla.nombre}
        links={links}
        backLink={{ href: `/org/${orgSlug}/pollas`, label: "Pollas" }}
      />
      <PollaEstadoBanner estado={polla.estado} />
      {children}
    </div>
  );
}
