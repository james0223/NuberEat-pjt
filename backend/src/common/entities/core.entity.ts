import { Field, ObjectType } from "@nestjs/graphql";
import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

// This will be an entity that becomes the core of all the entities
@ObjectType()
export class CoreEntity {
    @PrimaryGeneratedColumn()
    @Field(type => Number)
    id: number

    // Special columns supported by typeorm

    @CreateDateColumn()
    @Field(type => Date)
    createdAt: Date

    @UpdateDateColumn()
    @Field(type => Date)
    updatedAt: Date
}