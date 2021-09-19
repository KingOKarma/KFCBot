/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/member-ordering */
import {
    Column, Entity, OneToMany, PrimaryGeneratedColumn
} from "typeorm";
import { ItemMeta } from "./item";

@Entity()
export class Guild {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    serverid!: string;

    @Column()
    name!: string;

    @Column({ default: false })
    boosted!: boolean;

    @Column( { nullable: true } )
    prefix!: string;

    @OneToMany(() => ItemMeta, (itemMeta) => itemMeta.guild)
    shop!: ItemMeta[];

}
