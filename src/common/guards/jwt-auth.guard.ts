import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";
import { MensajesError } from "@constants/mensajes-error.const";

@Injectable()
export class GuardAuthJwt extends AuthGuard("jwt") {
  private readonly logger = new Logger(GuardAuthJwt.name);

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const peticion = context.switchToHttp().getRequest<{ url: string }>();
    this.logger.debug(
      `[SEGURIDAD_JWT] Verificando autenticación para: ${peticion.url}`,
    );

    return super.canActivate(context);
  }

  handleRequest<TUser>(err: Error | null, usuario: TUser | false): TUser {
    if (err || !usuario) {
      this.logger.warn(
        `[SEGURIDAD_JWT_ERROR] Autenticación fallida: ${err?.message ?? "Token inválido"}`,
      );
      throw err ?? new UnauthorizedException(MensajesError.TOKEN_INVALIDO);
    }

    return usuario;
  }
}
