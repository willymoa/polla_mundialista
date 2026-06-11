import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Correo inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registroSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo inválido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type RegistroInput = z.infer<typeof registroSchema>;

export const crearOrganizacionSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
});

export type CrearOrganizacionInput = z.infer<typeof crearOrganizacionSchema>;

export const unirseCodigoSchema = z.object({
  codigo: z.string().min(4, "El código debe tener al menos 4 caracteres"),
});

export type UnirseCodigoInput = z.infer<typeof unirseCodigoSchema>;

export const editarOrganizacionSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  logoUrl: z.union([z.string().url("URL inválida"), z.literal("")]).optional(),
  brandColor: z
    .union([z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color inválido"), z.literal("")])
    .optional(),
});

export type EditarOrganizacionInput = z.infer<typeof editarOrganizacionSchema>;

export const crearInvitacionSchema = z.object({
  roleAsignado: z.enum(["ADMIN", "MIEMBRO"]),
  emailInvitado: z.union([z.string().email("Correo inválido"), z.literal("")]).optional(),
  diasExpiracion: z.number().int().min(1).max(90),
});

export type CrearInvitacionInput = z.infer<typeof crearInvitacionSchema>;

export const actualizarMembresiaSchema = z.object({
  membresiaId: z.string().min(1),
  role: z.enum(["ADMIN", "MIEMBRO"]),
  estado: z.enum(["ACTIVO", "SUSPENDIDO"]),
});

export type ActualizarMembresiaInput = z.infer<typeof actualizarMembresiaSchema>;

export const crearPollaSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  descripcion: z.string().optional(),
  torneo: z.string().optional(),
  lockMode: z.enum(["PER_MATCH", "GLOBAL_DEADLINE"]),
  esPublica: z.boolean(),
});

export type CrearPollaInput = z.infer<typeof crearPollaSchema>;

export const editarPollaSchema = crearPollaSchema.extend({
  estado: z.enum([
    "BORRADOR",
    "ACTIVA",
    "FINALIZADA",
    "ARCHIVADA",
    "OCULTA",
    "INACTIVA",
  ]),
});

export type EditarPollaInput = z.infer<typeof editarPollaSchema>;

export const actualizarParticipanteSchema = z.object({
  participanteId: z.string().min(1),
  role: z.enum(["ADMIN_POLLA", "PARTICIPANTE", "ESPECTADOR"]),
  estado: z.enum(["ACTIVO", "SUSPENDIDO"]),
  pago: z.boolean(),
});

export type ActualizarParticipanteInput = z.infer<typeof actualizarParticipanteSchema>;

export const agregarParticipanteSchema = z.object({
  userId: z.string().min(1, "Selecciona un miembro"),
  role: z.enum(["ADMIN_POLLA", "PARTICIPANTE", "ESPECTADOR"]),
});

export type AgregarParticipanteInput = z.infer<typeof agregarParticipanteSchema>;

export const eliminarParticipanteSchema = z.object({
  participanteId: z.string().min(1),
});

export type EliminarParticipanteInput = z.infer<typeof eliminarParticipanteSchema>;

export const equipoSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  grupo: z.string().optional(),
  banderaUrl: z.union([z.string().url("URL inválida"), z.literal("")]).optional(),
});

export type EquipoInput = z.infer<typeof equipoSchema>;

export const partidoSchema = z
  .object({
    equipoLocalId: z.string().min(1, "Selecciona el equipo local"),
    equipoVisitanteId: z.string().min(1, "Selecciona el equipo visitante"),
    fechaHora: z.string().min(1, "La fecha y hora son obligatorias"),
    fase: z.string().optional(),
    estado: z.enum(["PENDIENTE", "CERRADO", "FINALIZADO"]),
  })
  .refine((data) => data.equipoLocalId !== data.equipoVisitanteId, {
    message: "El equipo local y visitante deben ser diferentes",
    path: ["equipoVisitanteId"],
  });

export type PartidoInput = z.infer<typeof partidoSchema>;

export const pronosticoSchema = z.object({
  golesLocal: z.number().int().min(0, "Debe ser 0 o más").max(99, "Valor demasiado alto"),
  golesVisitante: z.number().int().min(0, "Debe ser 0 o más").max(99, "Valor demasiado alto"),
});

export type PronosticoInput = z.infer<typeof pronosticoSchema>;

export const resultadoSchema = z.object({
  golesLocalReal: z.number().int().min(0, "Debe ser 0 o más").max(99, "Valor demasiado alto"),
  golesVisitanteReal: z.number().int().min(0, "Debe ser 0 o más").max(99, "Valor demasiado alto"),
  estado: z.enum(["PENDIENTE", "CERRADO", "FINALIZADO"]),
});

export type ResultadoInput = z.infer<typeof resultadoSchema>;

export const reglaPuntuacionSchema = z.object({
  puntosMarcadorExacto: z.number().int().min(0, "Debe ser 0 o más"),
  puntosResultado: z.number().int().min(0, "Debe ser 0 o más"),
  puntosBonusDiferencia: z.number().int().min(0, "Debe ser 0 o más"),
  puntosCampeon: z.number().int().min(0, "Debe ser 0 o más").nullable(),
  puntosFinalista: z.number().int().min(0, "Debe ser 0 o más").nullable(),
  puntosGoleador: z.number().int().min(0, "Debe ser 0 o más").nullable(),
  permiteEditarHastaInicio: z.boolean(),
});

export type ReglaPuntuacionFormInput = z.infer<typeof reglaPuntuacionSchema>;

export const cambiarPlanOrganizacionSchema = z.object({
  organizacionId: z.string().min(1),
  planId: z.string().min(1),
});

export type CambiarPlanOrganizacionInput = z.infer<typeof cambiarPlanOrganizacionSchema>;

export const editarPlanSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  maxPollas: z.number().int().min(0, "Debe ser 0 o más"),
  maxParticipantesPorPolla: z.number().int().min(0, "Debe ser 0 o más"),
  permiteLogo: z.boolean(),
  permiteExportarExcel: z.boolean(),
  permiteMultiplesAdmins: z.boolean(),
});

export type EditarPlanInput = z.infer<typeof editarPlanSchema>;

export const actualizarPerfilSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo inválido"),
});

export type ActualizarPerfilInput = z.infer<typeof actualizarPerfilSchema>;

export const cambiarPasswordSchema = z
  .object({
    passwordActual: z.string().min(1, "La contraseña actual es obligatoria"),
    passwordNueva: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmacion: z.string().min(1, "Confirma la nueva contraseña"),
  })
  .refine((data) => data.passwordNueva === data.confirmacion, {
    message: "Las contraseñas no coinciden",
    path: ["confirmacion"],
  });

export type CambiarPasswordInput = z.infer<typeof cambiarPasswordSchema>;

export const actualizarUsuarioOrgSchema = z.object({
  userId: z.string().min(1),
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo inválido"),
});

export type ActualizarUsuarioOrgInput = z.infer<typeof actualizarUsuarioOrgSchema>;

export const resetPasswordAdminSchema = z
  .object({
    userId: z.string().min(1),
    passwordNueva: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    confirmacion: z.string().min(1, "Confirma la contraseña"),
  })
  .refine((data) => data.passwordNueva === data.confirmacion, {
    message: "Las contraseñas no coinciden",
    path: ["confirmacion"],
  });

export type ResetPasswordAdminInput = z.infer<typeof resetPasswordAdminSchema>;

export const crearUsuarioOrgSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Correo inválido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
  role: z.enum(["ADMIN", "MIEMBRO"]),
});

export type CrearUsuarioOrgInput = z.infer<typeof crearUsuarioOrgSchema>;
