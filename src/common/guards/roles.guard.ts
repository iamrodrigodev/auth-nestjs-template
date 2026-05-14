import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Rol } from "@enums/rol.enum";
import { RolUsuario } from "@entities/rol.entity";
import { CLAVE_ROLES } from "@decorators/roles.decorator";
import { MensajesError } from "@constants/mensajes-error.const";

@Injectable()
export class GuardRoles implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesRequeridos = this.reflector.getAllAndOverride<Rol[]>(
      CLAVE_ROLES,
      [context.getHandler(), context.getClass()],
    );

    if (!rolesRequeridos || rolesRequeridos.length === 0) {
      return true;
    }

    const { user: usuario } = context.switchToHttp().getRequest<{
      user?: { roles?: Array<Rol | RolUsuario> };
    }>();

    const autorizado = rolesRequeridos.some((rol) =>
      usuario?.roles?.some(
        (rolUsuario) => this.obtenerNombreRol(rolUsuario) === rol,
      ),
    );

    if (!autorizado) {
      throw new ForbiddenException(MensajesError.ACCESO_DENEGADO);
    }

    return true;
  }

  private obtenerNombreRol(rol: Rol | RolUsuario): Rol {
    return typeof rol === "string" ? rol : rol.nombre;
  }
}
