import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Rol } from "@enums/rol.enum";

@Entity({ name: "roles", schema: "seguridad" })
export class RolUsuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: "enum",
    enum: Rol,
    unique: true,
  })
  nombre!: Rol;
}
