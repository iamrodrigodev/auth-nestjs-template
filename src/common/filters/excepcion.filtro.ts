import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { FastifyReply, FastifyRequest } from "fastify";
import { QueryFailedError } from "typeorm";
import { MensajesError } from "@constants/mensajes-error.const";
import {
  ErroresDeCampo,
  FabricaRespuestaError,
} from "@common/filters/fabrica-respuesta-error";

interface RespuestaHttpException {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

@Catch()
export class ExcepcionFiltro implements ExceptionFilter {
  private readonly logger = new Logger(ExcepcionFiltro.name);

  catch(excepcion: Error | HttpException, host: ArgumentsHost): void {
    const contexto = host.switchToHttp();
    const respuesta = contexto.getResponse<FastifyReply>();
    const peticion = contexto.getRequest<FastifyRequest>();

    const estado = this.obtenerEstado(excepcion);
    const mensaje = this.obtenerMensaje(excepcion, estado);
    const errores = this.obtenerErrores(excepcion);

    this.registrarError(excepcion, estado, peticion.url);

    const cuerpoError = FabricaRespuestaError.construir(
      estado,
      mensaje,
      peticion.url,
      errores,
    );

    void respuesta.status(estado).send(cuerpoError);
  }

  private obtenerEstado(excepcion: Error | HttpException): number {
    if (excepcion instanceof HttpException) {
      return excepcion.getStatus();
    }

    if (excepcion instanceof QueryFailedError) {
      return HttpStatus.SERVICE_UNAVAILABLE;
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private obtenerMensaje(
    excepcion: Error | HttpException,
    estado: number,
  ): string {
    if (excepcion instanceof HttpException) {
      const respuestaExcepcion = excepcion.getResponse() as
        | RespuestaHttpException
        | string;

      if (typeof respuestaExcepcion === "object") {
        if (Array.isArray(respuestaExcepcion.message)) {
          return MensajesError.DATOS_INVALIDOS;
        }

        return respuestaExcepcion.message ?? excepcion.message;
      }

      return excepcion.message;
    }

    if (estado === HttpStatus.SERVICE_UNAVAILABLE) {
      return MensajesError.ERROR_BASE_DATOS;
    }

    return MensajesError.ERROR_INTERNO;
  }

  private obtenerErrores(
    excepcion: Error | HttpException,
  ): ErroresDeCampo | undefined {
    if (!(excepcion instanceof HttpException)) {
      return undefined;
    }

    const respuestaExcepcion = excepcion.getResponse() as
      | RespuestaHttpException
      | string;

    if (
      typeof respuestaExcepcion === "object" &&
      Array.isArray(respuestaExcepcion.message)
    ) {
      return respuestaExcepcion.message;
    }

    return undefined;
  }

  private registrarError(
    excepcion: Error | HttpException,
    estado: number,
    ruta: string,
  ): void {
    if (estado >= 500) {
      this.logger.error(
        `[ERROR_FATAL] Error no controlado en ${ruta}`,
        excepcion.stack,
      );
      return;
    }

    this.logger.warn(
      `[ERROR_CONTROLADO] Error controlado en ${ruta}: ${excepcion.message}`,
    );
  }
}
