import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  ManyToMany,
  JoinTable,
  Check,
} from "typeorm";
import * as bcrypt from "bcrypt";
import { RolUsuario } from "@entities/rol.entity";

@Check("CHK_usuario_estado", "estado IN (0, 1)")
@Entity({ name: "usuarios", schema: "seguridad" })
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, length: 255 })
  email!: string;

  @Column({ length: 100 })
  nombres!: string;

  @Column({ length: 100 })
  apellidos!: string;

  @Column({ select: false })
  contrasena!: string;

  @Column({ type: "smallint", default: 1 })
  estado!: 0 | 1;

  @ManyToMany(() => RolUsuario, {
    cascade: ["insert"],
    eager: true,
  })
  @JoinTable({
    name: "usuarios_roles",
    schema: "seguridad",
    joinColumn: {
      name: "usuario_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "rol_id",
      referencedColumnName: "id",
    },
  })
  roles!: RolUsuario[];

  @Column({ type: "char", length: 9, nullable: true, default: null })
  numeroTelefono!: string | null;

  @Column({ type: "text", nullable: true, default: null })
  direccion!: string | null;

  @CreateDateColumn({
    type: "timestamptz",
  })
  creadoEn!: Date;

  @Column({
    type: "timestamptz",
    nullable: true,
    default: null,
  })
  actualizadoEn!: Date | null;

  @BeforeInsert()
  async hashearContrasenaAntesDeInsertar() {
    if (this.contrasena) {
      this.contrasena = await bcrypt.hash(this.contrasena, 10);
    }
  }

  @BeforeUpdate()
  async manejarAntesDeActualizar() {
    this.actualizadoEn = new Date();

    if (this.contrasena && !this.contrasena.startsWith("$2b$")) {
      this.contrasena = await bcrypt.hash(this.contrasena, 10);
    }
  }

  async validarContrasena(contrasenaPlana: string): Promise<boolean> {
    return await bcrypt.compare(contrasenaPlana, this.contrasena);
  }

  toJSON() {
    const { contrasena, ...usuario } = this;
    return usuario;
  }
}
