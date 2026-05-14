import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ControladorAuth } from "@auth/auth.controller";
import { ServicioAuth } from "@auth/auth.service";
import { Usuario } from "@entities/usuario.entity";
import { RolUsuario } from "@entities/rol.entity";
import { EstrategiaJwt } from "@auth/strategies/jwt.strategy";
import { ServicioToken } from "@auth/services/token.service";

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, RolUsuario])],
  controllers: [ControladorAuth],
  providers: [ServicioAuth, EstrategiaJwt, ServicioToken],
  exports: [ServicioAuth],
})
export class ModuloAuth {}
