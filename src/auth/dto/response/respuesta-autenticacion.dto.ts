import { UsuarioRespuestaDto } from "@dto/response/usuario-respuesta.dto";

export class RespuestaAutenticacionDto {
  usuario!: UsuarioRespuestaDto;
  tokenAcceso!: string;
}
