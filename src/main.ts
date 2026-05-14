import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { ModuloApp } from "@app/app.module";
import { RespuestaInterceptor } from "@interceptors/respuesta.interceptor";
import { TrazaControladorInterceptor } from "@interceptors/traza-controlador.interceptor";
import { ExcepcionFiltro } from "@filters/excepcion.filtro";
import { registrarFiltrosSeguridad } from "@security/hooks/registrar-filtros-seguridad";
import { RegistradorAplicacion } from "@common/logging/registrador-aplicacion";

process.env.TZ = "America/Lima";

async function iniciar() {
  const registrador = new Logger("Inicio");
  const loggerAplicacion = new RegistradorAplicacion();

  const app = await NestFactory.create<NestFastifyApplication>(
    ModuloApp,
    new FastifyAdapter({
      logger: false,
      bodyLimit: 10485760,
      requestIdHeader: "x-request-id",
    }),
    {
      logger: loggerAplicacion,
    },
  );
  app.useLogger(loggerAplicacion);

  app.setGlobalPrefix("api");
  registrarFiltrosSeguridad(app);

  app.useGlobalInterceptors(
    new TrazaControladorInterceptor(),
    new RespuestaInterceptor(),
  );
  app.useGlobalFilters(new ExcepcionFiltro());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  await app.register(require("@fastify/cors"), {
    origin: process.env.ORIGEN_CORS || "*",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    credentials: true,
  });

  const puerto = process.env.PUERTO ?? 3000;
  const host = "0.0.0.0";

  await app.listen(puerto, host);

  registrador.log("[APLICACION_INICIO] NestJS iniciado exitosamente");
}

iniciar().catch((error) => {
  const registrador = new RegistradorAplicacion();
  const traza = error instanceof Error ? error.stack : undefined;
  registrador.error(
    "[APLICACION_ERROR] Error al iniciar la aplicación",
    traza,
    "Inicio",
  );
  process.exit(1);
});
