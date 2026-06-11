import Link from "next/link";
import {
  Building2,
  Trophy,
  SlidersHorizontal,
  CalendarCheck,
  Users,
} from "lucide-react";

const caracteristicas = [
  {
    icon: Building2,
    titulo: "Multiempresa",
    descripcion:
      "Cada organización administra sus propias pollas de forma totalmente aislada.",
  },
  {
    icon: Trophy,
    titulo: "Rankings automáticos",
    descripcion:
      "Los puntos y posiciones se recalculan solos al cargar los resultados.",
  },
  {
    icon: SlidersHorizontal,
    titulo: "Reglas personalizables",
    descripcion:
      "Define tu propio sistema de puntuación para marcador exacto, resultado y bonus.",
  },
  {
    icon: CalendarCheck,
    titulo: "Pronósticos por partido",
    descripcion:
      "Cada partido se bloquea automáticamente al iniciar para evitar trampas.",
  },
  {
    icon: Users,
    titulo: "Para todos los grupos",
    descripcion: "Ideal para empresas, universidades, familias y amigos.",
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <section className="flex flex-col items-center justify-center gap-6 px-4 py-12 text-center sm:px-6 sm:py-20">
        <h1 className="text-3xl font-bold text-brand-primary sm:text-4xl md:text-5xl">
          Polla Mundialista Pro
        </h1>
        <p className="max-w-xl text-lg text-brand-primary/80">
          Crea pollas deportivas para tu empresa, familia o grupo.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/registro"
            className="rounded-lg bg-brand-accent px-6 py-3 font-semibold text-white shadow transition hover:opacity-90"
          >
            Crear cuenta
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-brand-primary px-6 py-3 font-semibold text-brand-primary transition hover:bg-brand-primary hover:text-white"
          >
            Iniciar sesión
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 px-4 pb-12 sm:grid-cols-2 sm:px-6 sm:pb-20 lg:grid-cols-3">
        {caracteristicas.map(({ icon: Icon, titulo, descripcion }) => (
          <div
            key={titulo}
            className="flex flex-col gap-3 rounded-xl bg-white p-6 shadow-sm"
          >
            <Icon className="h-8 w-8 text-brand-accent" />
            <h2 className="text-lg font-semibold text-brand-primary">
              {titulo}
            </h2>
            <p className="text-sm text-brand-primary/70">{descripcion}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
