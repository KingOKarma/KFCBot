/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/member-ordering */
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class WorkStrings {
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column({ nullable: true })
    public guildId!: string;

    @Column({ nullable: true })
    public string!: string;

}

