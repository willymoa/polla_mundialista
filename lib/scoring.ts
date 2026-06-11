import type { TipoAcierto } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type Marcador = { golesLocal: number; golesVisitante: number };

export type ReglaPuntuacionInput = {
  puntosMarcadorExacto: number;
  puntosResultado: number;
  puntosBonusDiferencia: number;
};

export const REGLA_PUNTUACION_DEFAULT: ReglaPuntuacionInput = {
  puntosMarcadorExacto: 5,
  puntosResultado: 3,
  puntosBonusDiferencia: 1,
};

function signoResultado(marcador: Marcador): number {
  return Math.sign(marcador.golesLocal - marcador.golesVisitante);
}

export function calcularPuntos(
  pronostico: Marcador,
  real: Marcador,
  regla: ReglaPuntuacionInput = REGLA_PUNTUACION_DEFAULT
): { puntos: number; tipoAcierto: TipoAcierto } {
  if (
    pronostico.golesLocal === real.golesLocal &&
    pronostico.golesVisitante === real.golesVisitante
  ) {
    return { puntos: regla.puntosMarcadorExacto, tipoAcierto: "EXACTO" };
  }

  const resultadoPron = signoResultado(pronostico);
  const resultadoReal = signoResultado(real);

  if (resultadoPron !== resultadoReal) {
    return { puntos: 0, tipoAcierto: "NINGUNO" };
  }

  const diffPron = pronostico.golesLocal - pronostico.golesVisitante;
  const diffReal = real.golesLocal - real.golesVisitante;

  if (resultadoPron !== 0 && diffPron === diffReal) {
    return {
      puntos: regla.puntosResultado + regla.puntosBonusDiferencia,
      tipoAcierto: "DIFERENCIA",
    };
  }

  return { puntos: regla.puntosResultado, tipoAcierto: "RESULTADO" };
}

export async function recalcularPuntosPartido(partidoId: string) {
  const partido = await prisma.partido.findUnique({
    where: { id: partidoId },
    include: {
      pronosticos: true,
      polla: { include: { reglaPuntuacion: true } },
    },
  });

  if (!partido) throw new Error("Partido no encontrado");

  if (partido.golesLocalReal === null || partido.golesVisitanteReal === null) {
    return;
  }

  const regla = partido.polla.reglaPuntuacion ?? REGLA_PUNTUACION_DEFAULT;
  const real: Marcador = {
    golesLocal: partido.golesLocalReal,
    golesVisitante: partido.golesVisitanteReal,
  };

  for (const pronostico of partido.pronosticos) {
    const { puntos, tipoAcierto } = calcularPuntos(
      { golesLocal: pronostico.golesLocal, golesVisitante: pronostico.golesVisitante },
      real,
      regla
    );

    await prisma.pronostico.update({
      where: { id: pronostico.id },
      data: { puntos, tipoAcierto },
    });
  }

  await recalcularRankingPolla(partido.pollaId);
}

export async function recalcularRankingPolla(pollaId: string) {
  const [participantes, pronosticos] = await Promise.all([
    prisma.participantePolla.findMany({ where: { pollaId } }),
    prisma.pronostico.findMany({ where: { pollaId } }),
  ]);

  for (const participante of participantes) {
    const propios = pronosticos.filter((p) => p.userId === participante.userId);

    const puntosTotales = propios.reduce((suma, p) => suma + p.puntos, 0);
    const marcadoresExactos = propios.filter((p) => p.tipoAcierto === "EXACTO").length;
    const aciertosResultado = propios.filter((p) => p.tipoAcierto !== "NINGUNO").length;

    await prisma.participantePolla.update({
      where: { id: participante.id },
      data: { puntosTotales, marcadoresExactos, aciertosResultado },
    });
  }
}
