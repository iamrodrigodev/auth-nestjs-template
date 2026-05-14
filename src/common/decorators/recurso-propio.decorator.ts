import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";
import { GuardAuthJwt } from "@guards/jwt-auth.guard";
import { GuardPropietarioRecurso } from "@guards/propietario-recurso.guard";
import { Rol } from "@enums/rol.enum";

export const CLAVE_RECURSO_PROPIO = "recurso_propio";

export interface OpcionesRecursoPropio {
  campos?: string[];
  camposCorreo?: string[];
  rolesPermitidos?: Rol[];
}

export const CAMPOS_USUARIO_RECURSO = [
  "usuarioId",
  "idUsuario",
  "usuario_id",
  "id_usuario",
];

export const CAMPOS_CORREO_RECURSO = [
  "correo",
  "email",
  "correoUsuario",
  "emailUsuario",
  "correo_usuario",
  "email_usuario",
];

export function RecursoPropio(opciones: OpcionesRecursoPropio = {}) {
  return applyDecorators(
    SetMetadata(CLAVE_RECURSO_PROPIO, opciones),
    UseGuards(GuardAuthJwt, GuardPropietarioRecurso),
  );
}
