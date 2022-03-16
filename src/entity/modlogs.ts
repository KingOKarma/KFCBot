/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/member-ordering */
import {
    Column, Entity, ManyToOne, PrimaryGeneratedColumn
} from "typeorm";
import { DBUser } from "./user";

@Entity()
export class ModLogs {
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column( { default: "000000000000000000" })
    public uid!: string;

    @Column( { nullable: true })
    public serverid!: string;

    @Column({ nullable: true })
    public tag!: string;

    @Column({ default: "User was moderated" })
    public reason!: string;

    @Column({ nullable: true })
    public time!: string;

    @Column({ nullable: true })
    public type!: string;

    @Column({ nullable: true })
    public modID!: string;

    @Column({ nullable: true })
    public modTag!: string;

    @ManyToOne(() => DBUser, (setUser) => setUser.userLogs)
        user!: DBUser;
}
