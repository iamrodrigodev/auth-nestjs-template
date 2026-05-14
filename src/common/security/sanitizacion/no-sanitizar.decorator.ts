import "reflect-metadata";

export const CLAVE_NO_SANITIZAR = Symbol("NO_SANITIZAR");

export function NoSanitizar(): PropertyDecorator {
  return (objetivo: object, propiedad: string | symbol) => {
    Reflect.defineMetadata(CLAVE_NO_SANITIZAR, true, objetivo, propiedad);
  };
}
