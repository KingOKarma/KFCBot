/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/member-ordering */
import {
    Column, Entity, ManyToOne, PrimaryGeneratedColumn
} from "typeorm";

import { Guild } from "./guild";
@Entity()
export class ItemMeta {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ unique: true })
    name!: string;

    @Column()
    description!: string;

    @Column()
    price!: number;

    @Column()
    stock!: number;

    @ManyToOne(() => Guild, (guild) => guild.items)
    guild!: Guild;
}
