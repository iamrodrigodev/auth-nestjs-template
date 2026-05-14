import { Transform } from "class-transformer";
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ArrayUnique,
} from "class-validator";
import { Rol } from "@enums/rol.enum";

export class RegistroDto {
  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsEmail({}, { message: "El email debe ser válido" })
  @IsNotEmpty({ message: "El email es requerido" })
  email!: string;

  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsString({ message: "Los nombres deben ser un texto" })
  @IsNotEmpty({ message: "Los nombres son requeridos" })
  @MinLength(2, { message: "Los nombres deben tener al menos 2 caracteres" })
  @MaxLength(100, {
    message: "Los nombres no pueden tener más de 100 caracteres",
  })
  nombres!: string;

  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsString({ message: "Los apellidos deben ser un texto" })
  @IsNotEmpty({ message: "Los apellidos son requeridos" })
  @MinLength(2, { message: "Los apellidos deben tener al menos 2 caracteres" })
  @MaxLength(100, {
    message: "Los apellidos no pueden tener más de 100 caracteres",
  })
  apellidos!: string;

  @IsString({ message: "La contraseña debe ser un texto" })
  @IsNotEmpty({ message: "La contraseña es requerida" })
  @MinLength(8, { message: "La contraseña debe tener al menos 8 caracteres" })
  @MaxLength(50, {
    message: "La contraseña no puede tener más de 50 caracteres",
  })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      "La contraseña debe contener al menos una mayúscula, una minúscula y un número o carácter especial",
  })
  contrasena!: string;

  @IsOptional()
  @IsArray({ message: "Los roles deben ser un arreglo" })
  @ArrayUnique({ message: "Los roles no deben repetirse" })
  @IsEnum(Rol, {
    each: true,
    message: "Los roles deben ser valores válidos (USUARIO o ADMINISTRADOR)",
  })
  roles?: Rol[];

  @Transform(({ value }) => value?.trim())
  @IsOptional()
  @IsString({ message: "El teléfono debe ser un texto" })
  @Matches(/^9\d{8}$/, {
    message: "El teléfono debe tener 9 dígitos y empezar con 9",
  })
  numeroTelefono?: string;

  @Transform(({ value }) => value?.toLowerCase().trim())
  @IsOptional()
  @IsString({ message: "La dirección debe ser un texto" })
  @MinLength(5, { message: "La dirección debe tener al menos 5 caracteres" })
  @MaxLength(500, {
    message: "La dirección no puede tener más de 500 caracteres",
  })
  direccion?: string;
}
