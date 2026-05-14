import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { Repository } from "typeorm";
import { In } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Usuario } from "@entities/usuario.entity";
import { RolUsuario } from "@entities/rol.entity";
import { RegistroDto } from "@dto/request/registro.dto";
import { IniciarSesionDto } from "@dto/request/iniciar-sesion.dto";
import { RespuestaAutenticacionDto } from "@dto/response/respuesta-autenticacion.dto";
import { UsuarioRespuestaDto } from "@dto/response/usuario-respuesta.dto";
import { Rol } from "@enums/rol.enum";
import { ServicioToken } from "@auth/services/token.service";
import { MensajesError } from "@constants/mensajes-error.const";
import {
  EmailExistenteExcepcion,
  CredencialesInvalidasExcepcion,
  UsuarioInactivoExcepcion,
} from "@auth/exceptions/auth.exceptions";

@Injectable()
export class ServicioAuth {
  private readonly logger = new Logger(ServicioAuth.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly repositorioUsuario: Repository<Usuario>,
    @InjectRepository(RolUsuario)
    private readonly repositorioRol: Repository<RolUsuario>,
    private readonly servicioToken: ServicioToken,
  ) {}

  async registrar(
    registroDto: RegistroDto,
  ): Promise<RespuestaAutenticacionDto> {
    const {
      email,
      nombres,
      apellidos,
      contrasena,
      roles,
      numeroTelefono,
      direccion,
    } = registroDto;

    try {
      const usuarioExistente = await this.repositorioUsuario.findOne({
        where: { email },
      });

      if (usuarioExistente) {
        throw new EmailExistenteExcepcion();
      }

      const rolesUsuario = await this.obtenerRolesUnicos(
        roles ?? [Rol.USUARIO],
      );

      const usuario = this.repositorioUsuario.create({
        email,
        nombres,
        apellidos,
        contrasena,
        roles: rolesUsuario,
        numeroTelefono: numeroTelefono ?? null,
        direccion: direccion ?? null,
      });

      await this.repositorioUsuario.save(usuario);

      const tokenAcceso = this.servicioToken.generarTokenAcceso(usuario);

      this.logger.log(`[REGISTRO_EXITOSO] Usuario registrado: ${email}`);

      return {
        usuario: UsuarioRespuestaDto.desdeEntidad(usuario),
        tokenAcceso,
      };
    } catch (error: unknown) {
      if (error instanceof EmailExistenteExcepcion) {
        throw error;
      }

      const mensajeError =
        error instanceof Error ? error.message : "Error desconocido";
      const stackError = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `[USUARIO_REGISTRO_ERROR] Error al registrar usuario: ${mensajeError}`,
        stackError,
      );
      throw new InternalServerErrorException(MensajesError.ERROR_INTERNO);
    }
  }

  async iniciarSesion(
    iniciarSesionDto: IniciarSesionDto,
  ): Promise<RespuestaAutenticacionDto> {
    const { email, contrasena } = iniciarSesionDto;

    try {
      const usuario = await this.repositorioUsuario.findOne({
        where: { email },
        select: ["id", "email", "nombres", "apellidos", "contrasena", "estado"],
        relations: {
          roles: true,
        },
      });

      if (!usuario) {
        throw new CredencialesInvalidasExcepcion();
      }

      if (usuario.estado !== 1) {
        throw new UsuarioInactivoExcepcion();
      }

      const esContrasenaValida = await usuario.validarContrasena(contrasena);

      if (!esContrasenaValida) {
        throw new CredencialesInvalidasExcepcion();
      }

      const tokenAcceso = this.servicioToken.generarTokenAcceso(usuario);

      this.logger.log(`[LOGIN_EXITOSO] Usuario autenticado: ${email}`);

      return {
        usuario: UsuarioRespuestaDto.desdeEntidad(usuario),
        tokenAcceso,
      };
    } catch (error: unknown) {
      if (
        error instanceof CredencialesInvalidasExcepcion ||
        error instanceof UsuarioInactivoExcepcion
      ) {
        throw error;
      }

      const mensajeError =
        error instanceof Error ? error.message : "Error desconocido";

      this.logger.error(
        `[LOGIN_ERROR] Error al autenticar usuario: ${mensajeError}`,
      );
      throw new InternalServerErrorException(MensajesError.ERROR_INTERNO);
    }
  }

  async validarUsuarioPorId(idUsuario: number): Promise<Usuario | null> {
    try {
      const usuario = await this.repositorioUsuario.findOne({
        where: { id: idUsuario, estado: 1 },
      });

      return usuario;
    } catch (error: unknown) {
      const mensajeError =
        error instanceof Error ? error.message : "Error desconocido";
      this.logger.error(
        `[USUARIO_VALIDACION_ERROR] Error al validar usuario: ${mensajeError}`,
      );
      return null;
    }
  }

  obtenerPerfil(usuario: UsuarioRespuestaDto): UsuarioRespuestaDto {
    return usuario;
  }

  private async obtenerRolesUnicos(roles: Rol[]): Promise<RolUsuario[]> {
    const nombresRoles = [...new Set(roles)];
    const rolesExistentes = await this.repositorioRol.find({
      where: { nombre: In(nombresRoles) },
    });
    const nombresExistentes = new Set(rolesExistentes.map((rol) => rol.nombre));
    const rolesNuevos = nombresRoles
      .filter((rol) => !nombresExistentes.has(rol))
      .map((nombre) => this.repositorioRol.create({ nombre }));

    if (rolesNuevos.length === 0) {
      return rolesExistentes;
    }

    const rolesGuardados = await this.repositorioRol.save(rolesNuevos);
    return [...rolesExistentes, ...rolesGuardados];
  }
}
