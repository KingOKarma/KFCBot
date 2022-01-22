/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/member-ordering */
import {
    Column, Entity, ManyToOne, PrimaryGeneratedColumn
} from "typeorm";
import { DBUser } from "./user";

@Entity()
export class Inventory {
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column()
    public uid!: string;

    @Column()
    public serverid!: string;

    @ManyToOne(() => DBUser, (user) => user.inventory)
    public user!: DBUser;

    @Column("text", { array: true, default: [] })
    public items!: string[];
}
