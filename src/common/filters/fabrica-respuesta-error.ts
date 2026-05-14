export type ErroresDeCampo = Record<string, string> | string[];

export interface RespuestaError {
  estado: number;
  mensaje: string;
  ruta: string;
  errores?: ErroresDeCampo;
  fecha: string;
  hora: string;
}

export class FabricaRespuestaError {
  static construir(
    estado: number,
    mensaje: string,
    ruta: string,
    errores?: ErroresDeCampo,
  ): RespuestaError {
    const ahora = new Date();
    const cuerpo: RespuestaError = {
      estado,
      mensaje,
      ruta,
      fecha: ahora.toISOString().split("T")[0],
      hora: ahora.toTimeString().split(" ")[0],
    };

    if (
      errores &&
      (Array.isArray(errores)
        ? errores.length > 0
        : Object.keys(errores).length > 0)
    ) {
      cuerpo.errores = errores;
    }

    return cuerpo;
  }
}
