/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

interface Commands {
    name: string;
    uses: number;
}

@Entity()
export class Stats {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column("text")
    date!: string;

    @Column("text", { nullable: true })
    name!: string;

    @Column("integer")
    uses!: number;
}