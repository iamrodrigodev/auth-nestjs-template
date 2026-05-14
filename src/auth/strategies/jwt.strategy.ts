import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ServicioAuth } from "@auth/auth.service";
import { CargaUtilJwt } from "@interfaces/jwt-carga-util.interface";
import { Usuario } from "@entities/usuario.entity";
import { MensajesError } from "@constants/mensajes-error.const";

@Injectable()
export class EstrategiaJwt extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(EstrategiaJwt.name);

  constructor(
    private readonly servicioConfig: ConfigService,
    private readonly servicioAuth: ServicioAuth,
  ) {
    const secreto = servicioConfig.get<string>("JWT_SECRETO");
    if (!secreto) {
      throw new Error("JWT_SECRETO no está configurado");
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secreto,
    });
  }

  async validate(cargaUtil: CargaUtilJwt): Promise<Usuario> {
    const { sub: idUsuario } = cargaUtil;
    const usuario = await this.servicioAuth.validarUsuarioPorId(idUsuario);

    if (!usuario) {
      this.logger.warn(
        `[SEGURIDAD_JWT_ERROR] Token válido pero usuario no encontrado: ${idUsuario}`,
      );
      throw new UnauthorizedException(MensajesError.TOKEN_INVALIDO);
    }

    return usuario;
  }
}
