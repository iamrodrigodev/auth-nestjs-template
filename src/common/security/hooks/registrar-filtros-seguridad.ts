import { randomUUID } from "crypto";
import { NestFastifyApplication } from "@nestjs/platform-fastify";
import { FastifyReply, FastifyRequest } from "fastify";
import { sanitizarValor } from "@security/sanitizacion/sanitizador-entrada";
import { ContextoTrazabilidadStore } from "@common/logging/contexto-trazabilidad";

export function registrarFiltrosSeguridad(app: NestFastifyApplication): void {
  const fastify = app.getHttpAdapter().getInstance();

  fastify.addHook("onRequest", (peticion, respuesta, done) => {
    const contexto = aplicarTrazabilidad(peticion, respuesta);
    ContextoTrazabilidadStore.ejecutar(contexto, done);
  });

  fastify.addHook("preValidation", (peticion, _respuesta, done) => {
    sanitizarPeticion(peticion);
    done();
  });
}

function aplicarTrazabilidad(
  peticion: FastifyRequest,
  respuesta: FastifyReply,
) {
  const idTrazabilidad = obtenerIdTrazabilidad(peticion);
  const ipCliente = obtenerIpCliente(peticion);

  peticion.headers["x-id-trazabilidad"] = idTrazabilidad;
  peticion.headers["x-cliente-ip"] = ipCliente;
  respuesta.header("x-id-trazabilidad", idTrazabilidad);

  return {
    id_trazabilidad: idTrazabilidad,
    uri: peticion.url,
    metodo: peticion.method,
    cliente_ip: ipCliente,
  };
}

function obtenerIdTrazabilidad(peticion: FastifyRequest): string {
  const idEntrante = peticion.headers["x-id-trazabilidad"];

  if (typeof idEntrante === "string" && idEntrante.trim().length > 0) {
    return idEntrante.trim();
  }

  return randomUUID().replace(/-/g, "");
}

function obtenerIpCliente(peticion: FastifyRequest): string {
  const cabeceraForwarded = peticion.headers["x-forwarded-for"];

  if (typeof cabeceraForwarded === "string" && cabeceraForwarded.length > 0) {
    return cabeceraForwarded.split(",")[0].trim();
  }

  if (Array.isArray(cabeceraForwarded) && cabeceraForwarded.length > 0) {
    return cabeceraForwarded[0].split(",")[0].trim();
  }

  return peticion.ip;
}

function sanitizarPeticion(peticion: FastifyRequest): void {
  peticion.query = sanitizarValor(peticion.query);
  peticion.params = sanitizarValor(peticion.params);

  if (peticion.body && typeof peticion.body === "object") {
    peticion.body = sanitizarValor(peticion.body);
  }
}
