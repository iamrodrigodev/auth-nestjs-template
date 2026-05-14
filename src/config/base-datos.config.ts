import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";

export const obtenerConfiguracionBaseDatos = (
  servicioConfig: ConfigService,
): TypeOrmModuleOptions => ({
  type: "postgres",
  host: servicioConfig.get<string>("BD_HOST"),
  port: servicioConfig.get<number>("BD_PUERTO"),
  username: servicioConfig.get<string>("BD_USUARIO"),
  password: servicioConfig.get<string>("BD_CONTRASENA"),
  database: servicioConfig.get<string>("BD_NOMBRE"),
  entities: [__dirname + "/../**/*.entity{.ts,.js}"],
  synchronize: servicioConfig.get<string>("AMBIENTE") === "development",
  logging: servicioConfig.get<string>("AMBIENTE") === "development",
  ssl:
    servicioConfig.get<string>("AMBIENTE") === "production"
      ? { rejectUnauthorized: false }
      : false,
});
