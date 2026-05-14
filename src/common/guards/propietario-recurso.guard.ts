import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  CAMPOS_USUARIO_RECURSO,
  CAMPOS_CORREO_RECURSO,
  CLAVE_RECURSO_PROPIO,
  OpcionesRecursoPropio,
} from "@decorators/recurso-propio.decorator";
import { MensajesError } from "@constants/mensajes-error.const";
import { Rol } from "@enums/rol.enum";
import { RolUsuario } from "@entities/rol.entity";
import { Usuario } from "@entities/usuario.entity";

interface PeticionConUsuario {
  user?: Usuario;
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
  body?: unknown;
}

@Injectable()
export class GuardPropietarioRecurso implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const opciones = this.reflector.getAllAndOverride<OpcionesRecursoPropio>(
      CLAVE_RECURSO_PROPIO,
      [context.getHandler(), context.getClass()],
    );

    if (!opciones) {
      return true;
    }

    const peticion = context.switchToHttp().getRequest<PeticionConUsuario>();
    const usuario = peticion.user;

    if (!usuario) {
      throw new ForbiddenException(MensajesError.ACCESO_DENEGADO);
    }

    if (this.tieneRolPermitido(usuario, opciones.rolesPermitidos)) {
      return true;
    }

    if (this.coincidePorId(peticion, usuario, opciones)) {
      return true;
    }

    if (this.coincidePorCorreo(peticion, usuario, opciones)) {
      return true;
    }

    throw new ForbiddenException(MensajesError.ACCESO_DENEGADO);
  }

  private coincidePorId(
    peticion: PeticionConUsuario,
    usuario: Usuario,
    opciones: OpcionesRecursoPropio,
  ): boolean {
    const campos = opciones.campos?.length
      ? opciones.campos
      : CAMPOS_USUARIO_RECURSO;
    const valor =
      this.buscarValor(campos, peticion.params) ??
      this.buscarValor(campos, peticion.query) ??
      this.buscarValor(campos, peticion.body);

    if (valor === undefined) {
      return false;
    }

    const id = Number(valor);

    if (!Number.isInteger(id) || id <= 0) {
      return false;
    }

    return id === usuario.id;
  }

  private coincidePorCorreo(
    peticion: PeticionConUsuario,
    usuario: Usuario,
    opciones: OpcionesRecursoPropio,
  ): boolean {
    const campos = opciones.camposCorreo?.length
      ? opciones.camposCorreo
      : CAMPOS_CORREO_RECURSO;
    const valor =
      this.buscarValor(campos, peticion.params) ??
      this.buscarValor(campos, peticion.query) ??
      this.buscarValor(campos, peticion.body);

    if (typeof valor !== "string") {
      return false;
    }

    return (
      this.normalizarCorreo(valor) === this.normalizarCorreo(usuario.email)
    );
  }

  private buscarValor(campos: string[], origen: unknown): unknown {
    if (!origen || typeof origen !== "object") {
      return undefined;
    }

    const registro = origen as Record<string, unknown>;

    for (const campo of campos) {
      if (registro[campo] !== undefined) {
        return registro[campo];
      }
    }

    for (const valor of Object.values(registro)) {
      const encontrado = this.buscarValor(campos, valor);
      if (encontrado !== undefined) {
        return encontrado;
      }
    }

    return undefined;
  }

  private tieneRolPermitido(
    usuario: Usuario,
    rolesPermitidos: Rol[] | undefined,
  ): boolean {
    if (!rolesPermitidos?.length) {
      return false;
    }

    return rolesPermitidos.some((rol) =>
      usuario.roles?.some(
        (rolUsuario) => this.obtenerNombreRol(rolUsuario) === rol,
      ),
    );
  }

  private obtenerNombreRol(rol: Rol | RolUsuario): Rol {
    return typeof rol === "string" ? rol : rol.nombre;
  }

  private normalizarCorreo(correo: string): string {
    return correo.trim().toLowerCase();
  }
}
