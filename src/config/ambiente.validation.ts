import { plainToInstance } from "class-transformer";
import {
  IsEnum,
  IsNumber,
  IsString,
  IsOptional,
  validateSync,
} from "class-validator";

enum Ambiente {
  Desarrollo = "development",
  Produccion = "production",
  Pruebas = "test",
}

class VariablesAmbiente {
  @IsEnum(Ambiente)
  AMBIENTE!: Ambiente;

  @IsNumber()
  PUERTO!: number;

  @IsString()
  BD_HOST!: string;

  @IsNumber()
  BD_PUERTO!: number;

  @IsString()
  BD_USUARIO!: string;

  @IsString()
  BD_CONTRASENA!: string;

  @IsString()
  BD_NOMBRE!: string;

  @IsString()
  JWT_SECRETO!: string;

  @IsString()
  JWT_EXPIRACION!: string;

  @IsString()
  @IsOptional()
  ORIGEN_CORS!: string;
}

export function validar(config: Record<string, unknown>) {
  const configuracionValidada = plainToInstance(VariablesAmbiente, config, {
    enableImplicitConversion: true,
  });

  const errores = validateSync(configuracionValidada, {
    skipMissingProperties: false,
  });

  if (errores.length > 0) {
    throw new Error(errores.toString());
  }

  return configuracionValidada;
}
