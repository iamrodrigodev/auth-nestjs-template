import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { instanceToPlain } from "class-transformer";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { ApiRespuesta } from "@common/dto/api-respuesta.dto";
import { MensajesRespuesta } from "@constants/mensajes-respuesta.const";

@Injectable()
export class RespuestaInterceptor<T> implements NestInterceptor<
  T,
  Record<string, unknown>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Record<string, unknown>> {
    const respuesta = context.switchToHttp().getResponse();
    const estado = respuesta.statusCode as number;

    return next.handle().pipe(
      map((datos: T | ApiRespuesta<T>) => {
        if (datos instanceof ApiRespuesta) {
          return this.limpiarNulos(datos);
        }

        if (this.esObjetoConMensaje(datos)) {
          const { mensaje, ...resto } = datos as Record<string, unknown> & {
            mensaje: string;
          };
          const contenido =
            Object.keys(resto).length > 0 ? (resto as T) : undefined;

          return this.limpiarNulos(
            ApiRespuesta.exito(mensaje, contenido, estado),
          );
        }

        return this.limpiarNulos(
          ApiRespuesta.exito(
            MensajesRespuesta.OPERACION_EXITOSA,
            datos,
            estado,
          ),
        );
      }),
    );
  }

  private esObjetoConMensaje(datos: unknown): datos is { mensaje: string } {
    return (
      datos !== null &&
      typeof datos === "object" &&
      "mensaje" in (datos as Record<string, unknown>)
    );
  }

  private limpiarNulos(objeto: object): Record<string, unknown> {
    const plano = instanceToPlain(objeto) as Record<string, unknown>;

    Object.keys(plano).forEach((clave) => {
      if (plano[clave] === null || plano[clave] === undefined) {
        delete plano[clave];
      }
    });

    return plano;
  }
}
