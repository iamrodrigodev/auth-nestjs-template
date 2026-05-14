import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ModuloAuth } from "@auth/auth.module";
import { obtenerConfiguracionBaseDatos } from "@config/base-datos.config";
import { validar } from "@config/ambiente.validation";
import { ModuloSeguridad } from "@security/seguridad.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env"],
      validate: validar,
      cache: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: obtenerConfiguracionBaseDatos,
    }),

    ModuloSeguridad,
    ModuloAuth,
  ],
})
export class ModuloApp {}
