/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/member-ordering */
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

type BotType = "command" | "slashCommand" | "uptimeTimeStamp" | "guilds";

@Entity()
export class Bot {
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column()
    public type!: BotType;

    @Column({ nullable: true })
    public name!: string;

    @Column({ nullable: true })
    public description!: string;

    @Column({ nullable: true })
    public group!: string;

    @Column({ nullable: true })
    public value!: string;
}
