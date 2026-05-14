import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Usuario } from "@app/auth/entities/usuario.entity";
import { UsuarioRespuestaDto } from "@app/auth/dto/response/usuario-respuesta.dto";

export const ObtenerUsuario = createParamDecorator(
  (
    data: string | undefined,
    ctx: ExecutionContext,
  ): UsuarioRespuestaDto | any => {
    const request = ctx.switchToHttp().getRequest();
    const usuario = request.user as Usuario | undefined;

    if (data) {
      return usuario?.[data];
    }

    return usuario ? UsuarioRespuestaDto.desdeEntidad(usuario) : undefined;
  },
);
