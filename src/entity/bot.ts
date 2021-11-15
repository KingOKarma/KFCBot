/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/member-ordering */
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

type BotType = "command" | "slashCommand" | "uptimeTimeStamp" | "guilds";

@Entity()
export class Bot {
    @PrimaryGeneratedColumn()
        id!: number;

    @Column()
        type!: BotType;

    @Column({ nullable: true })
        name!: string;

    @Column({ nullable: true })
        description!: string;

    @Column({ nullable: true })
        group!: string;

    @Column({ nullable: true })
        value!: string;
}
