import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { GuardPropietarioRecurso } from "@guards/propietario-recurso.guard";
import { GuardRoles } from "@guards/roles.guard";

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt", session: false }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (servicioConfig: ConfigService) => {
        const secreto = servicioConfig.get<string>("JWT_SECRETO");
        const expiracion = servicioConfig.get<string>("JWT_EXPIRACION") || "1h";

        if (!secreto) {
          throw new Error("JWT_SECRETO no está configurado");
        }

        return {
          secret: secreto,
          signOptions: {
            expiresIn: expiracion as any,
          },
        };
      },
    }),
  ],
  providers: [GuardPropietarioRecurso, GuardRoles],
  exports: [PassportModule, JwtModule, GuardPropietarioRecurso, GuardRoles],
})
export class ModuloSeguridad {}
