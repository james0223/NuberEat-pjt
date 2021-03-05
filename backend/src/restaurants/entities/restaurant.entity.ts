import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsOptional, IsString, Length } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@InputType( {isAbstract: true}) // This can be used when using mapped states and you don't want to add second args to mapped types
// Using objecttype and entity together allows graphql and typeorm to use this file at the same time
@ObjectType() // ObjectTypes are graphql decorators for automatically building schemas
@Entity() // Entities are for TypeORM to create database
export class Restaurant {
    // Describe how restaurant looks like from the graphql point of view
    // It creates the object type for restaurant
    @PrimaryGeneratedColumn() // a must have column for typeorm
    @Field(type => Number)
    id: number;
    
    @Field(() => String) // the arument must be a function
    @Column() // Column is TypeORM's Field
    @IsString()
    @Length(5)
    name: string;

    @Field(()=> Boolean, {defaultValue: true}) // for graphql schema, the default val is true
    @Column({ default: true} ) // for database, this val is true
    @IsOptional() // This is for DTO
    @IsBoolean()
    isVegan: boolean

    @Field(()=> String)
    @IsString()
    @Column()
    address: string

    @Field(type => String)
    @IsString()
    @Column()
    ownerName: string;

    @Field(type => String)
    @IsString()
    @Column()
    categoryName: string;
}