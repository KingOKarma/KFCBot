/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/member-ordering */
import {
    Column, Entity, OneToMany, PrimaryGeneratedColumn
} from "typeorm";
import { Inventory } from "./inventory";
import { ModLogs } from "./modlogs";

@Entity()
class User {
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column( { default: "000000000000000000" })
    public uid!: string;

    @Column({ nullable: true })
    public serverId!: string;

    @Column({ nullable: true })
    public tag!: string;

    @Column({ nullable: true })
    public avatar!: string;

    @Column({ default: 0 })
    public nuggies!: number;

    @Column({ default: 0 })
    public xp!: number;

    @Column({ default: 0 })
    public totalXp!: number;

    @Column({ default: 1 })
    public level!: number;

    @Column({ default: 0 })
    public netWorth!: number;

    @Column({ default: "" })
    public work!: string;

    @OneToMany(() => Inventory, (inventory) => inventory.user)
    public inventory!: Inventory;

    @OneToMany(() => ModLogs, (modLogs) => modLogs.user)
    public userLogs!: ModLogs[];

    @Column({ default: false })
    public muted!: boolean;

    @Column( { default: true })
    public levelEnabled!: boolean;
}

export { User as DBUser };