/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/member-ordering */
import {
    Column, Entity, PrimaryGeneratedColumn
} from "typeorm";

@Entity()
export class GlobalUser {
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column( { default: "000000000000000000" })
    public uid!: string;

    @Column()
    public tag!: string;

    @Column()
    public avatar!: string;

    @Column({ default: false })
    public premium!: boolean;

    @Column({ nullable: true })
    public premiumBought!: string;

    @Column( { default: 0 })
    public rep!: number;
}
