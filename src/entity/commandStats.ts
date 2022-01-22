/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Stats {
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column("text")
    public date!: string;

    @Column("text", { nullable: true })
    public name!: string;

    @Column("integer")
    public uses!: number;
}