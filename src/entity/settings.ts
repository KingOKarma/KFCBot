/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/member-ordering */
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Settings {
    @PrimaryColumn()
    guild!: string;

    @Column("text", { nullable: true })
    settings!: string;
}
