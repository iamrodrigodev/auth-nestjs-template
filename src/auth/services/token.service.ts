import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Usuario } from "@entities/usuario.entity";
import { CargaUtilJwt } from "@interfaces/jwt-carga-util.interface";

@Injectable()
export class ServicioToken {
  private readonly logger = new Logger(ServicioToken.name);

  constructor(
    private readonly servicioJwt: JwtService,
    private readonly servicioConfig: ConfigService,
  ) {}

  generarTokenAcceso(usuario: Usuario): string {
    const expiracionJwt =
      this.servicioConfig.get<string>("JWT_EXPIRACION") || "1h";

    const cargaUtil: CargaUtilJwt = {
      sub: usuario.id,
      email: usuario.email,
    };

    this.logger.debug(
      `[JWT_GENERACION] Generando token JWT con expiración: ${expiracionJwt}`,
    );

    return this.servicioJwt.sign(cargaUtil);
  }
}
