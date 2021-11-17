/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/member-ordering */
import {
    Column, Entity, ManyToOne, PrimaryGeneratedColumn
} from "typeorm";

import { DBGuild } from "./guild";
@Entity()
export class ItemMeta {
    @PrimaryGeneratedColumn()
        id!: number;

    @Column()
        name!: string;

    @Column()
        description!: string;

    @Column()
        price!: number;

    @Column()
        max!: number;

    @ManyToOne(() => DBGuild, (setGuild) => setGuild.shop)
        guild!: DBGuild;
}
