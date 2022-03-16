/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/member-ordering */
import {
    Column, Entity, OneToMany, PrimaryGeneratedColumn
} from "typeorm";
import { ItemMeta } from "./item";

@Entity()
export class DBGuild {
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column()
    public serverid!: string;

    @Column()
    public name!: string;

    @Column({ default: false })
    public boosted!: boolean;

    @Column("text", { array: true, default: [] })
    public bannedWords!: string[];

    @Column("text", { array: true, default: [] })
    public bannedLinks!: string[];

    @Column({ default: true })
    public automodEnabled!: boolean;

    @OneToMany(() => ItemMeta, (itemMeta) => itemMeta.guild)
    public shop!: ItemMeta[];

    @Column({ default: "#000000" })
    public primaryColour!: string;

}
