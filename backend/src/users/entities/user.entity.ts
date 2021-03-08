import { Field, InputType, ObjectType, registerEnumType } from "@nestjs/graphql"
import { CoreEntity } from "src/common/entities/core.entity"
import { BeforeInsert, Column, Entity } from "typeorm"
import * as bcrypt from "bcrypt"
import { InternalServerErrorException } from "@nestjs/common"
import { IsEmail, IsEnum, IsString } from "class-validator"

enum UserRole {
    Client,
    Owner,
    Delivery
} // for database enum

registerEnumType(UserRole, {name: "UserRole"}) // for graphql enum

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
    @Column()
    @Field(type => String)
    @IsEmail()
    email: string

    @Column()
    @Field(type => String)
    password: string

    @Column(
        {type: "enum", enum: UserRole}
    )
    @Field(type => UserRole)
    @IsEnum(UserRole)
    role: UserRole

    // Use bcrypt module to hash passwords
    @BeforeInsert() // before this entity is saved into database
    async hashPassword(): Promise<void> {
        try {
        this.password = await bcrypt.hash(this.password, 10) // how many rounds of hash
        } catch(e) {
            console.log(e)
            throw new InternalServerErrorException();
        }
    }

    async checkPassword(aPassword: string): Promise<boolean> {
        try {
            const ok = await bcrypt.compare(aPassword, this.password)
            return ok
        } catch(error) {
            console.log(error)
            throw new InternalServerErrorException()
        }
    }
}