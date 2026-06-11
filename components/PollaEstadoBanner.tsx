import type { EstadoPolla } from "@prisma/client";
import { mensajeEstadoPolla } from "@/lib/polla-estado";

export function PollaEstadoBanner({ estado }: { estado: EstadoPolla }) {
  const mensaje = mensajeEstadoPolla(estado);
  if (!mensaje) return null;

  const esOculta = estado === "OCULTA";
  return (
    <div
      className={`border-b px-4 py-3 text-sm sm:px-6 ${
        esOculta
          ? "border-gray-300 bg-gray-100 text-gray-800"
          : "border-amber-200 bg-amber-50 text-amber-900"
      }`}
    >
      {mensaje}
    </div>
  );
}
