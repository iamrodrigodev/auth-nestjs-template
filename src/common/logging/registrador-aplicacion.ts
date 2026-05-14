import { LoggerService, LogLevel } from "@nestjs/common";
import { ContextoTrazabilidadStore } from "@common/logging/contexto-trazabilidad";

type NivelLog = "ERROR" | "WARN" | "INFO" | "DEBUG" | "VERBOSE";

export class RegistradorAplicacion implements LoggerService {
  private readonly esProduccion = process.env.AMBIENTE === "production";

  log(message: unknown, context?: string): void {
    this.escribir("INFO", message, context);
  }

  error(message: unknown, trace?: string, context?: string): void {
    this.escribir("ERROR", message, context, trace);
  }

  warn(message: unknown, context?: string): void {
    this.escribir("WARN", message, context);
  }

  debug(message: unknown, context?: string): void {
    this.escribir("DEBUG", message, context);
  }

  verbose(message: unknown, context?: string): void {
    this.escribir("VERBOSE", message, context);
  }

  setLogLevels?(_levels: LogLevel[]): void {
    return;
  }

  private escribir(
    nivel: NivelLog,
    message: unknown,
    registrador?: string,
    traza?: string,
  ): void {
    if (!this.nivelHabilitado(nivel)) {
      return;
    }

    const contexto = ContextoTrazabilidadStore.obtener();
    const mensaje = this.serializarMensaje(message);

    if (this.esProduccion) {
      this.escribirJson(nivel, mensaje, registrador, traza, contexto);
      return;
    }

    this.escribirTexto(nivel, mensaje, registrador, traza, contexto);
  }

  private escribirJson(
    nivel: NivelLog,
    mensaje: string,
    registrador?: string,
    traza?: string,
    contexto = ContextoTrazabilidadStore.obtener(),
  ): void {
    const cuerpo = {
      marca_tiempo: new Date().toISOString(),
      nivel,
      mensaje,
      registrador,
      id_trazabilidad: contexto?.id_trazabilidad,
      uri: contexto?.uri,
      metodo: contexto?.metodo,
      cliente_ip: contexto?.cliente_ip,
      traza,
    };

    const salida = `${JSON.stringify(this.limpiarNulos(cuerpo))}\n`;
    this.obtenerSalida(nivel).write(salida);
  }

  private escribirTexto(
    nivel: NivelLog,
    mensaje: string,
    registrador?: string,
    traza?: string,
    contexto = ContextoTrazabilidadStore.obtener(),
  ): void {
    const id = contexto?.id_trazabilidad ?? "sin-traza";
    const origen = registrador ? `[${registrador}]` : "";
    const linea = `${new Date().toISOString()} [${id}] ${nivel} ${origen} ${mensaje}\n`;
    this.obtenerSalida(nivel).write(linea);

    if (traza && nivel === "ERROR") {
      this.obtenerSalida(nivel).write(`${traza}\n`);
    }
  }

  private serializarMensaje(message: unknown): string {
    if (typeof message === "string") {
      return message;
    }

    if (message instanceof Error) {
      return message.message;
    }

    return JSON.stringify(this.limpiarDatoSensible(message));
  }

  private limpiarDatoSensible(valor: unknown): unknown {
    if (!valor || typeof valor !== "object") {
      return valor;
    }

    if (Array.isArray(valor)) {
      return valor.map((item) => this.limpiarDatoSensible(item));
    }

    const copia: Record<string, unknown> = {};

    Object.entries(valor as Record<string, unknown>).forEach(
      ([clave, dato]) => {
        if (this.esClaveSensible(clave)) {
          copia[clave] = "[REDACTADO]";
          return;
        }

        copia[clave] = this.limpiarDatoSensible(dato);
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
      "secreto",
    ].includes(normalizada);
  }

  private limpiarNulos<T extends Record<string, unknown>>(
    objeto: T,
  ): Partial<T> {
    return Object.fromEntries(
      Object.entries(objeto).filter(([, valor]) => valor !== undefined),
    ) as Partial<T>;
  }

  private obtenerSalida(nivel: NivelLog): NodeJS.WriteStream {
    return nivel === "ERROR" || nivel === "WARN"
      ? process.stderr
      : process.stdout;
  }

  private nivelHabilitado(nivel: NivelLog): boolean {
    if (!this.esProduccion) {
      return true;
    }

    return ["ERROR", "WARN", "INFO"].includes(nivel);
  }
}
