import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Patches {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  author!: string;

  @Column()
  original_sysex!: string;

  @Column()
  synth!: string;

  @Column({ type: "bytea", nullable: true })
  data!: Buffer;
}
