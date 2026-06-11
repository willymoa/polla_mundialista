import { describe, it, expect } from "vitest";
import { calcularPuntos, REGLA_PUNTUACION_DEFAULT } from "@/lib/scoring";

describe("calcularPuntos", () => {
  const real = { golesLocal: 2, golesVisitante: 1 };

  it("otorga puntosMarcadorExacto cuando el marcador es idéntico", () => {
    const resultado = calcularPuntos({ golesLocal: 2, golesVisitante: 1 }, real, REGLA_PUNTUACION_DEFAULT);
    expect(resultado).toEqual({ puntos: 5, tipoAcierto: "EXACTO" });
  });

  it("otorga puntosResultado + bonus cuando acierta el resultado y la diferencia de goles", () => {
    const resultado = calcularPuntos({ golesLocal: 1, golesVisitante: 0 }, real, REGLA_PUNTUACION_DEFAULT);
    expect(resultado).toEqual({ puntos: 4, tipoAcierto: "DIFERENCIA" });
  });

  it("otorga solo puntosResultado cuando acierta el resultado pero no la diferencia", () => {
    const resultado = calcularPuntos({ golesLocal: 3, golesVisitante: 0 }, real, REGLA_PUNTUACION_DEFAULT);
    expect(resultado).toEqual({ puntos: 3, tipoAcierto: "RESULTADO" });
  });

  it("no otorga puntos cuando predice un empate y el real no lo es", () => {
    const resultado = calcularPuntos({ golesLocal: 1, golesVisitante: 1 }, real, REGLA_PUNTUACION_DEFAULT);
    expect(resultado).toEqual({ puntos: 0, tipoAcierto: "NINGUNO" });
  });

  it("no otorga puntos cuando predice el resultado contrario", () => {
    const resultado = calcularPuntos({ golesLocal: 0, golesVisitante: 2 }, real, REGLA_PUNTUACION_DEFAULT);
    expect(resultado).toEqual({ puntos: 0, tipoAcierto: "NINGUNO" });
  });

  it("acierta el resultado en un empate sin diferencia exacta no aplica (cubierto por marcador exacto)", () => {
    const empateReal = { golesLocal: 1, golesVisitante: 1 };
    const resultado = calcularPuntos({ golesLocal: 2, golesVisitante: 2 }, empateReal, REGLA_PUNTUACION_DEFAULT);
    expect(resultado).toEqual({ puntos: 3, tipoAcierto: "RESULTADO" });
  });

  it("respeta reglas de puntuación personalizadas", () => {
    const reglaCustom = { puntosMarcadorExacto: 10, puntosResultado: 5, puntosBonusDiferencia: 2 };
    const resultado = calcularPuntos({ golesLocal: 2, golesVisitante: 1 }, real, reglaCustom);
    expect(resultado).toEqual({ puntos: 10, tipoAcierto: "EXACTO" });
  });
});
