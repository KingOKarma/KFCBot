/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/member-ordering */
import {
    Column, Entity, OneToMany, PrimaryGeneratedColumn
} from "typeorm";
import { Inventory } from "./inventory";
import { ModLogs } from "./modlogs";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column( { default: "000000000000000000" })
    uid!: string;

    @Column({ nullable: true })
    serverId!: string;

    @Column({ nullable: true })
    tag!: string;

    @Column({ nullable: true })
    avatar!: string;

    @Column({ default: 1 })
    nuggies!: number;

    @Column({ default: 0 })
    xp!: number;

    @Column({ default: 1 })
    level!: number;

    @Column({ default: 0 })
    netWorth!: number;

    @Column({ default: "" })
    work!: string;

    @OneToMany(() => Inventory, (inventory) => inventory.user)
    inventory!: Inventory;

    @OneToMany(() => ModLogs, (modLogs) => modLogs.user)
    userLogs!: ModLogs[];
}
