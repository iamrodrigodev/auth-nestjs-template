export class ApiRespuesta<T> {
  estado: number;
  mensaje: string;
  datos?: T;
  paginacion?: unknown;

  private constructor(
    estado: number,
    mensaje: string,
    datos?: T,
    paginacion?: unknown,
  ) {
    this.estado = estado;
    this.mensaje = mensaje;
    this.datos = datos;
    this.paginacion = paginacion;
  }

  static exito<T>(
    mensaje: string,
    datos?: T,
    estado: number = 200,
  ): ApiRespuesta<T> {
    return new ApiRespuesta(estado, mensaje, datos);
  }

  static creado<T>(mensaje: string, datos?: T): ApiRespuesta<T> {
    return new ApiRespuesta(201, mensaje, datos);
  }

  static paginado<T>(
    mensaje: string,
    datos: T[],
    paginacion: unknown,
  ): ApiRespuesta<T[]> {
    return new ApiRespuesta(200, mensaje, datos, paginacion);
  }
}
