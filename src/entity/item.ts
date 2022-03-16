/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/member-ordering */
import {
    Column, Entity, ManyToOne, PrimaryGeneratedColumn
} from "typeorm";

import { DBGuild } from "./guild";
@Entity()
export class ItemMeta {
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column()
    public name!: string;

    @Column()
    public description!: string;

    @Column()
    public price!: number;

    @Column()
    public max!: number;

    @Column({ default: "0" })
    public added!: string;

    @Column({ default: "0" })
    public userAdded!: string;

    @Column({ default: 0 })
    public guildId!: string;

    @ManyToOne(() => DBGuild, (setGuild) => setGuild.shop)
    public guild!: DBGuild;

}
