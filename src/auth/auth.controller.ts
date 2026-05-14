import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ServicioAuth } from "@auth/auth.service";
import { RegistroDto } from "@dto/request/registro.dto";
import { IniciarSesionDto } from "@dto/request/iniciar-sesion.dto";
import { RespuestaAutenticacionDto } from "@dto/response/respuesta-autenticacion.dto";
import { UsuarioRespuestaDto } from "@dto/response/usuario-respuesta.dto";
import { GuardAuthJwt } from "@guards/jwt-auth.guard";
import { ObtenerUsuario } from "@common/decorators/obtener-usuario.decorator";
import { ApiRespuesta } from "@common/dto/api-respuesta.dto";
import { MensajesRespuesta } from "@constants/mensajes-respuesta.const";

@Controller("autenticacion")
export class ControladorAuth {
  constructor(private readonly servicioAuth: ServicioAuth) {}

  @Post("registrar-cuenta")
  @HttpCode(HttpStatus.CREATED)
  async registrar(
    @Body() registroDto: RegistroDto,
  ): Promise<ApiRespuesta<RespuestaAutenticacionDto>> {
    const datos = await this.servicioAuth.registrar(registroDto);
    return ApiRespuesta.creado(MensajesRespuesta.CUENTA_REGISTRADA, datos);
  }

  @Post("iniciar-sesion")
  @HttpCode(HttpStatus.OK)
  async iniciarSesion(
    @Body() iniciarSesionDto: IniciarSesionDto,
  ): Promise<ApiRespuesta<RespuestaAutenticacionDto>> {
    const datos = await this.servicioAuth.iniciarSesion(iniciarSesionDto);
    return ApiRespuesta.exito(MensajesRespuesta.LOGIN_EXITOSO, datos);
  }

  @Get("perfil")
  @UseGuards(GuardAuthJwt)
  @HttpCode(HttpStatus.OK)
  obtenerPerfil(
    @ObtenerUsuario() usuario: UsuarioRespuestaDto,
  ): ApiRespuesta<UsuarioRespuestaDto> {
    const datos = this.servicioAuth.obtenerPerfil(usuario);
    return ApiRespuesta.exito(MensajesRespuesta.PERFIL_OBTENIDO, datos);
  }
}
