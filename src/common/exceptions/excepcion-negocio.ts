import { HttpException, HttpStatus } from "@nestjs/common";
import {
  MAPA_CODIGOS_ERROR,
  MensajesError,
} from "@constants/mensajes-error.const";

export class ExcepcionNegocio extends HttpException {
  constructor(mensaje: MensajesError, estado?: HttpStatus) {
    super(mensaje, estado ?? MAPA_CODIGOS_ERROR[mensaje]);
  }
}

export class RecursoNoEncontradoExcepcion extends ExcepcionNegocio {
  constructor(mensaje: MensajesError = MensajesError.RECURSO_NO_ENCONTRADO) {
    super(mensaje, HttpStatus.NOT_FOUND);
  }
}
