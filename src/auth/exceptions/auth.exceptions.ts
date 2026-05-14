import { HttpStatus } from "@nestjs/common";
import { MensajesError } from "@constants/mensajes-error.const";
import { ExcepcionNegocio } from "@common/exceptions/excepcion-negocio";

export class CredencialesInvalidasExcepcion extends ExcepcionNegocio {
  constructor() {
    super(MensajesError.CREDENCIALES_INVALIDAS, HttpStatus.UNAUTHORIZED);
  }
}

export class UsuarioInactivoExcepcion extends ExcepcionNegocio {
  constructor() {
    super(MensajesError.USUARIO_DESHABILITADO, HttpStatus.FORBIDDEN);
  }
}

export class EmailExistenteExcepcion extends ExcepcionNegocio {
  constructor() {
    super(MensajesError.USUARIO_EMAIL_DUPLICADO, HttpStatus.BAD_REQUEST);
  }
}
