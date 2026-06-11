import Link from "next/link";
import { requirePollaAccess, esAdminPolla } from "@/lib/permissions";
import { PollaEstadoBanner } from "@/components/PollaEstadoBanner";

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

  return (
    <div className="flex flex-1 flex-col">
      <nav className="flex flex-wrap items-center gap-4 border-b border-gray-200 bg-white px-6 py-3">
        <span className="font-bold text-brand-primary">{polla.nombre}</span>
        <Link href={base} className="text-sm text-brand-primary/70 hover:text-brand-primary">
          Resumen
        </Link>
        <Link href={`${base}/equipos`} className="text-sm text-brand-primary/70 hover:text-brand-primary">
          Equipos
        </Link>
        <Link href={`${base}/partidos`} className="text-sm text-brand-primary/70 hover:text-brand-primary">
          Partidos
        </Link>
        <Link href={`${base}/pronosticos`} className="text-sm text-brand-primary/70 hover:text-brand-primary">
          Mis pronósticos
        </Link>
        <Link href={`${base}/ranking`} className="text-sm text-brand-primary/70 hover:text-brand-primary">
          Ranking
        </Link>
        {esAdmin && (
          <Link href={`${base}/resultados`} className="text-sm text-brand-primary/70 hover:text-brand-primary">
            Resultados
          </Link>
        )}
        {esAdmin && (
          <Link href={`${base}/configuracion`} className="text-sm text-brand-primary/70 hover:text-brand-primary">
            Configuración
          </Link>
        )}
        <Link href={`/org/${orgSlug}/pollas`} className="ml-auto text-sm text-brand-primary/70 hover:text-brand-primary">
          ← Pollas
        </Link>
      </nav>
      <PollaEstadoBanner estado={polla.estado} />
      {children}
    </div>
  );
}
