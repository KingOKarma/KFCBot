/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/member-ordering */
import {
    Column, Entity, ManyToOne, PrimaryGeneratedColumn
} from "typeorm";
import { User } from "./user";

@Entity()
export class ModLogs {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column( { default: "000000000000000000" })
    uid!: string;

    @Column( { nullable: true })
    serverid!: string;

    @Column({ nullable: true })
    tag!: string;

    @Column({ default: "User was moderated" })
    reason!: string;

    @Column({ nullable: true })
    time!: string;

    @Column({ nullable: true })
    type!: string;

    @Column({ nullable: true })
    modID!: string;

    @Column({ nullable: true })
    modTag!: string;

    @ManyToOne(() => User, (setUser) => setUser.userLogs)
    user!: User;
}
