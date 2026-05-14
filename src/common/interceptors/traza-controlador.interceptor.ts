import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { Observable } from "rxjs";

@Injectable()
export class TrazaControladorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TrazaControladorInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const peticion = context.switchToHttp().getRequest<FastifyRequest>();
    const controlador = context.getClass().name;
    const manejador = context.getHandler().name;

    this.logger.debug(
      `[CONTROLADOR] Procesando petición en ${controlador}.${manejador} - ${JSON.stringify(
        this.limpiarPayload({
          params: peticion.params,
          query: peticion.query,
          body: peticion.body,
        }),
      )}`,
    );

    return next.handle();
  }

  private limpiarPayload(valor: unknown): unknown {
    if (!valor || typeof valor !== "object") {
      return valor;
    }

    if (Array.isArray(valor)) {
      return valor.map((item) => this.limpiarPayload(item));
    }

    const copia: Record<string, unknown> = {};

    Object.entries(valor as Record<string, unknown>).forEach(
      ([clave, dato]) => {
        copia[clave] = this.esClaveSensible(clave)
          ? "[REDACTADO]"
          : this.limpiarPayload(dato);
      },
    );

    return copia;
  }

  private esClaveSensible(clave: string): boolean {
    const normalizada = clave.replace(/[_-]/g, "").toLowerCase();
    return [
      "password",
      "contrasena",
      "clave",
      "token",
      "jwt",
      "authorization",
    ].includes(normalizada);
  }
}
