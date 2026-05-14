import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { getRepositoryToken } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { ModuloApp } from "@app/app.module";
import { RolUsuario } from "@entities/rol.entity";
import { Usuario } from "@entities/usuario.entity";
import { Rol } from "@enums/rol.enum";
import { Client } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const USUARIO_PRUEBA = {
  email: process.env.SEED_USUARIO_EMAIL ?? "usuario.prueba@plantilla.local",
  nombres: process.env.SEED_USUARIO_NOMBRES ?? "usuario",
  apellidos: process.env.SEED_USUARIO_APELLIDOS ?? "prueba",
  contrasena: process.env.SEED_USUARIO_CONTRASENA ?? "Prueba123*",
  numeroTelefono: process.env.SEED_USUARIO_TELEFONO ?? "912345678",
  direccion: process.env.SEED_USUARIO_DIRECCION ?? "dirección de prueba",
};

async function ejecutarSemilla(): Promise<void> {
  const logger = new Logger("Semilla");

  const client = new Client({
    host: process.env.BD_HOST ?? "localhost",
    port: parseInt(process.env.BD_PUERTO ?? "5432"),
    user: process.env.BD_USUARIO ?? "postgres",
    password: process.env.BD_CONTRASENA ?? "postgres123",
    database: process.env.BD_NOMBRE ?? "auth_db",
  });

  try {
    await client.connect();
    await client.query("CREATE SCHEMA IF NOT EXISTS seguridad;");
    logger.log('Esquema "seguridad" creado/verificado.');
  } catch (error) {
    logger.error('Error al asegurar el esquema "seguridad":', error);
  } finally {
    await client.end();
  }

  const app = await NestFactory.createApplicationContext(ModuloApp, {
    logger: ["error", "warn", "log"],
  });

  try {
    const repositorioRol = app.get<Repository<RolUsuario>>(
      getRepositoryToken(RolUsuario),
    );
    const repositorioUsuario = app.get<Repository<Usuario>>(
      getRepositoryToken(Usuario),
    );

    const roles = await crearRolesBase(repositorioRol);
    await crearUsuarioPrueba(repositorioUsuario, roles);

    logger.log(
      `[SEMILLA_ROLES] Roles base creados/verificados: ${roles.length}`,
    );
    logger.log(
      `[SEMILLA_USUARIO] Usuario de prueba listo: ${USUARIO_PRUEBA.email}`,
    );
  } finally {
    await app.close();
  }
}

async function crearRolesBase(
  repositorioRol: Repository<RolUsuario>,
): Promise<RolUsuario[]> {
  const nombresRoles = Object.values(Rol);
  const rolesExistentes = await repositorioRol.find({
    where: { nombre: In(nombresRoles) },
  });
  const nombresExistentes = new Set(rolesExistentes.map((rol) => rol.nombre));
  const rolesNuevos = nombresRoles
    .filter((rol) => !nombresExistentes.has(rol))
    .map((nombre) => repositorioRol.create({ nombre }));

  if (rolesNuevos.length === 0) {
    return rolesExistentes;
  }

  const rolesGuardados = await repositorioRol.save(rolesNuevos);
  return [...rolesExistentes, ...rolesGuardados];
}

async function crearUsuarioPrueba(
  repositorioUsuario: Repository<Usuario>,
  roles: RolUsuario[],
): Promise<void> {
  const rolUsuario = roles.find((rol) => rol.nombre === Rol.USUARIO);

  if (!rolUsuario) {
    throw new Error("No se encontró el rol USUARIO para la semilla");
  }

  const usuarioExistente = await repositorioUsuario.findOne({
    where: { email: USUARIO_PRUEBA.email },
    relations: { roles: true },
    select: {
      id: true,
      email: true,
      nombres: true,
      apellidos: true,
      contrasena: true,
      estado: true,
      numeroTelefono: true,
      direccion: true,
      creadoEn: true,
      actualizadoEn: true,
    },
  });

  const datosUsuario = {
    email: USUARIO_PRUEBA.email,
    nombres: USUARIO_PRUEBA.nombres,
    apellidos: USUARIO_PRUEBA.apellidos,
    contrasena: USUARIO_PRUEBA.contrasena,
    estado: 1 as const,
    numeroTelefono: USUARIO_PRUEBA.numeroTelefono,
    direccion: USUARIO_PRUEBA.direccion,
    roles: [rolUsuario],
  };

  if (!usuarioExistente) {
    await repositorioUsuario.save(repositorioUsuario.create(datosUsuario));
    return;
  }

  repositorioUsuario.merge(usuarioExistente, datosUsuario);
  await repositorioUsuario.save(usuarioExistente);
}

ejecutarSemilla().catch((error: unknown) => {
  const logger = new Logger("Semilla");
  const mensaje = error instanceof Error ? error.stack : String(error);
  logger.error("[SEMILLA_ERROR] No se pudo ejecutar la semilla", mensaje);
  process.exit(1);
});
