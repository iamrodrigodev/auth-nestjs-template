import { HttpStatus } from "@nestjs/common";

export enum MensajesError {
  DATOS_INVALIDOS = "Datos de entrada inválidos",
  RECURSO_NO_ENCONTRADO = "Recurso no encontrado",
  RUTA_NO_ENCONTRADA = "La ruta solicitada no existe en el servidor",
  METODO_NO_SOPORTADO = "Método HTTP no soportado para esta ruta",
  ERROR_BASE_DATOS = "Error de conexión con la base de datos, inténtelo de nuevo más tarde",
  USUARIO_NO_ENCONTRADO = "El usuario no existe",
  USUARIO_EMAIL_DUPLICADO = "El correo electrónico ya está registrado",
  USUARIO_DESHABILITADO = "El usuario se encuentra deshabilitado",
  CREDENCIALES_INVALIDAS = "El correo o la clave son incorrectos",
  TOKEN_INVALIDO = "Token de acceso inválido o expirado",
  ACCESO_DENEGADO = "No tienes permisos para acceder a este recurso",
  ERROR_INTERNO = "Error interno del servidor",
}

export const MAPA_CODIGOS_ERROR: Record<MensajesError, number> = {
  [MensajesError.DATOS_INVALIDOS]: HttpStatus.BAD_REQUEST,
  [MensajesError.RECURSO_NO_ENCONTRADO]: HttpStatus.NOT_FOUND,
  [MensajesError.RUTA_NO_ENCONTRADA]: HttpStatus.NOT_FOUND,
  [MensajesError.METODO_NO_SOPORTADO]: HttpStatus.METHOD_NOT_ALLOWED,
  [MensajesError.ERROR_BASE_DATOS]: HttpStatus.SERVICE_UNAVAILABLE,
  [MensajesError.USUARIO_NO_ENCONTRADO]: HttpStatus.NOT_FOUND,
  [MensajesError.USUARIO_EMAIL_DUPLICADO]: HttpStatus.BAD_REQUEST,
  [MensajesError.USUARIO_DESHABILITADO]: HttpStatus.FORBIDDEN,
  [MensajesError.CREDENCIALES_INVALIDAS]: HttpStatus.UNAUTHORIZED,
  [MensajesError.TOKEN_INVALIDO]: HttpStatus.UNAUTHORIZED,
  [MensajesError.ACCESO_DENEGADO]: HttpStatus.FORBIDDEN,
  [MensajesError.ERROR_INTERNO]: HttpStatus.INTERNAL_SERVER_ERROR,
};
