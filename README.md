# Polla Mundialista Pro

Plataforma SaaS multitenant para crear y administrar **pollas de pronósticos deportivos** (recreativas, sin apuestas con dinero real). Distintas organizaciones —empresas, universidades, familias, grupos de amigos— pueden registrarse, crear sus propias pollas para un torneo, invitar participantes, registrar resultados y consultar un ranking con desempates.

## Arquitectura

- **Multitenant por organización**: cada `Organizacion` agrupa `Membresia`s (usuarios con rol `OWNER` / `ADMIN` / `MIEMBRO`) y sus propias `Polla`s.
- **Multitenant por polla**: cada `Polla` tiene sus `ParticipantePolla` (rol `ADMIN_POLLA` / `PARTICIPANTE` / `ESPECTADOR`), `Equipo`s, `Partido`s, `Pronostico`s y su `ReglaPuntuacion`.
- **Aislamiento en el servidor**: toda consulta a modelos de negocio pasa por los helpers de [`lib/permissions.ts`](lib/permissions.ts) y [`lib/tenant.ts`](lib/tenant.ts) (`requireOrgRole`, `requirePollaAccess`, `requirePollaRole`), que validan sesión, membresía, rol y pertenencia al tenant antes de tocar la base de datos. Nunca se confía solo en el frontend.
- **Roles globales**: `USER` / `SUPER_ADMIN` (panel de plataforma en `/admin-platform`).

## Stack tecnológico

- [Next.js 15](https://nextjs.org/) (App Router, Server Components + Server Actions)
- TypeScript estricto
- [Prisma ORM 5](https://www.prisma.io/) + PostgreSQL
- Tailwind CSS 3 (paleta de marca personalizada)
- [Auth.js / NextAuth v5](https://authjs.dev/) con proveedor Credentials + `bcryptjs`, sesiones JWT
- Zod + React Hook Form (`@hookform/resolvers`)
- [recharts](https://recharts.org/) para gráficos
- [Vitest](https://vitest.dev/) para pruebas unitarias del motor de puntuación
- pnpm como gestor de paquetes

## Requisitos

- Node.js 20+
- pnpm (`corepack enable` si no lo tienes)
- PostgreSQL 14+ corriendo localmente (o accesible vía `DATABASE_URL`)

## Instalación local

```bash
pnpm install
```

### Variables de entorno

Copia `.env.example` a `.env` y ajusta los valores:

```bash
cp .env.example .env
```

Variables requeridas:

- `DATABASE_URL`: cadena de conexión a PostgreSQL, p. ej. `postgresql://postgres:postgres@localhost:5432/polla_mundialista_saas`
- `NEXTAUTH_SECRET`: secreto para firmar las sesiones JWT (genera uno con `openssl rand -base64 32`)
- `NEXTAUTH_URL`: URL base de la app (`http://localhost:3000` en local)
- `NODE_ENV`: `development` en local

### Base de datos y Prisma

Crea la base de datos local (ejemplo con `psql`):

```bash
psql -U postgres -h localhost -c "CREATE DATABASE polla_mundialista_saas;"
```

Aplica las migraciones:

```bash
pnpm exec prisma migrate dev
```

Carga los datos de ejemplo (planes, organización demo, polla demo, equipos, partidos y pronósticos):

```bash
pnpm exec prisma db seed
```

### Levantar el proyecto

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Pruebas

El motor de puntuación (`lib/scoring.ts`) tiene pruebas unitarias con Vitest:

```bash
pnpm test
```

### Lint y build

```bash
pnpm lint
pnpm build
```

## Usuarios de prueba (seed)

| Rol | Email | Contraseña |
| --- | --- | --- |
| Super admin de la plataforma | `superadmin@polla.com` | `SuperAdmin123456` |
| Dueño de la organización "Universidad Icesi" | `owner@empresa.com` | `Owner123456` |
| Participante | `ana@polla.com` | `Participante123456` |
| Participante | `juan@polla.com` | `Participante123456` |
| Participante | `maria@polla.com` | `Participante123456` |
| Participante | `pedro@polla.com` | `Participante123456` |

La organización demo `universidad-icesi` tiene una polla `mundial-2026-demo` con equipos, un partido finalizado (con pronósticos y puntos ya calculados) y partidos pendientes para probar pronósticos y bloqueo.

## Estructura del proyecto

```
app/
  page.tsx                         Landing pública
  login/, registro/                Autenticación
  onboarding/                      Crear organización o unirse con código
  dashboard/                       Panel global del usuario (sus organizaciones y pollas)
  admin-platform/                  Panel SUPER_ADMIN (organizaciones y planes)
  org/[orgSlug]/
    page.tsx                       Dashboard de la organización
    configuracion/                 Edición de la organización (OWNER)
    miembros/                      Miembros e invitaciones (OWNER/ADMIN)
    pollas/
      page.tsx                     Listado de pollas
      nueva/                       Crear polla
      [pollaSlug]/
        page.tsx                   Dashboard de la polla + ranking destacado
        equipos/                   CRUD de equipos
        partidos/                  CRUD de partidos
        pronosticos/               Pronósticos del usuario (con bloqueo)
        resultados/                Captura de resultados (recalcula puntos)
        ranking/                   Tabla de posiciones con desempates
        configuracion/             Edición de la polla, participantes y reglas de puntuación
components/                        Formularios y tablas reutilizables (cliente)
lib/
  prisma.ts                        Cliente Prisma singleton
  auth.ts                          Configuración de NextAuth
  permissions.ts                   Helpers de autorización multitenant
  tenant.ts                        Resolución de organización/polla por slug
  validations.ts                   Esquemas Zod
  slug.ts, codigos.ts, locks.ts    Utilidades (slugs, códigos de invitación, bloqueo de pronósticos)
  scoring.ts                       Motor de puntuación y recálculo de ranking
prisma/
  schema.prisma                    Esquema de datos
  seed.ts                          Datos de ejemplo
```

## Seguridad multitenant

- Ningún usuario ve datos de una organización o polla a la que no pertenece.
- Toda consulta de negocio filtra por `organizacionId` o `pollaId` y pasa por `requireOrgRole` / `requirePollaAccess` / `requirePollaRole`.
- Un participante solo puede crear o editar sus propios pronósticos, y solo mientras el partido no esté bloqueado (`lib/locks.ts`, según `lockMode`: `PER_MATCH` o `GLOBAL_DEADLINE`).
- `SUPER_ADMIN` es el único rol con acceso a `/admin-platform` (gestión de organizaciones y planes a nivel plataforma).

## Despliegue en Render

El repositorio incluye [`render.yaml`](render.yaml) (Blueprint) con:

- Una base de datos **PostgreSQL** gestionada por Render.
- Un **Web Service** Node conectado al repositorio, con `DATABASE_URL` enlazada automáticamente a la base de datos y `NEXTAUTH_SECRET` generado como variable secreta.

Pasos:

1. En Render, crea un nuevo **Blueprint** apuntando a este repositorio (Render detectará `render.yaml`).
2. Define `NEXTAUTH_URL` con la URL pública asignada al servicio (p. ej. `https://polla-mundialista-pro.onrender.com`).
3. El **build command** ejecuta `pnpm install && pnpm prisma generate && pnpm prisma migrate deploy && pnpm build` (usa `migrate deploy`, no `migrate dev`, en producción).
4. El **start command** es `pnpm start`, que ejecuta `next start -p $PORT` (Render inyecta `$PORT`).
5. Tras el primer deploy, ejecuta el seed **una sola vez** de forma manual (Shell de Render):

   ```bash
   pnpm seed:prod
   ```

6. `next.config.ts` tiene `output: "standalone"` para una imagen de despliegue más liviana.

> **Nota:** el plan free de Render duerme el servicio tras periodos de inactividad. La primera petición tras "despertar" puede tardar varios segundos.

## Próximas mejoras

- Pagos por plan (pasarela de pago para planes BÁSICO/PRO/EMPRESA).
- API de resultados en vivo (integración con un proveedor de datos deportivos).
- Exportación de rankings y participantes a Excel.
- Notificaciones por email (invitaciones, recordatorios de pronósticos próximos a bloquear).
