/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/member-ordering */
import {
    Column, Entity, PrimaryGeneratedColumn
} from "typeorm";

@Entity()
export class GlobalUser {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column( { default: "000000000000000000" })
    uid!: string;

    @Column()
    tag!: string;

    @Column()
    avatar!: string;

    @Column({ default: false })
    premium!: boolean;

    @Column({ nullable: true })
    premiumBought!: string;

    @Column( { default: 0 })
    rep!: number;
}
