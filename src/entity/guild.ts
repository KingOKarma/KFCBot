/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/member-ordering */
import {
    Column, Entity, OneToMany, PrimaryGeneratedColumn
} from "typeorm";
import { ItemMeta } from "./item";

@Entity()
export class DBGuild {
    @PrimaryGeneratedColumn()
        id!: number;

    @Column()
        serverid!: string;

    @Column()
        name!: string;

    @Column({ default: false })
        boosted!: boolean;

    @Column({ nullable: true })
        prefix!: string;

    @Column("simple-array", { nullable: true })
        bannedWords!: string[];

    @Column("simple-array", { nullable: true })
        bannedLinks!: string[];

    @Column({ default: true })
        automodEnabled!: boolean;

    @OneToMany(() => ItemMeta, (itemMeta) => itemMeta.guild)
        shop!: ItemMeta[];

}
