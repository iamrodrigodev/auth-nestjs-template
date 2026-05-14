import { AsyncLocalStorage } from "async_hooks";

export interface ContextoTrazabilidad {
  id_trazabilidad: string;
  uri?: string;
  metodo?: string;
  cliente_ip?: string;
}

const almacenamiento = new AsyncLocalStorage<ContextoTrazabilidad>();

export class ContextoTrazabilidadStore {
  static ejecutar<T>(contexto: ContextoTrazabilidad, callback: () => T): T {
    return almacenamiento.run(contexto, callback);
  }

  static obtener(): ContextoTrazabilidad | undefined {
    return almacenamiento.getStore();
  }
}
