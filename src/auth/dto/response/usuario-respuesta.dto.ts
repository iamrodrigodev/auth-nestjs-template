import { Rol } from "@enums/rol.enum";
import { Usuario } from "@entities/usuario.entity";

export class UsuarioRespuestaDto {
  id!: number;
  email!: string;
  nombres!: string;
  apellidos!: string;
  roles!: Rol[];
  numeroTelefono!: string | null;
  direccion!: string | null;
  estado!: 0 | 1;
  creadoEn!: Date;
  actualizadoEn!: Date | null;

  static desdeEntidad(usuario: Usuario): UsuarioRespuestaDto {
    return {
      id: usuario.id,
      email: usuario.email,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      roles: usuario.roles?.map((rol) => rol.nombre) ?? [],
      numeroTelefono: usuario.numeroTelefono,
      direccion: usuario.direccion,
      estado: usuario.estado,
      creadoEn: usuario.creadoEn,
      actualizadoEn: usuario.actualizadoEn,
    };
  }
}
