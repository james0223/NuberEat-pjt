import {v4 as uuidv4} from "uuid"
import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { BeforeInsert, Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { User } from "./user.entity";

@InputType({ isAbstract: true })
@ObjectType()
@Entity()
export class Verification extends CoreEntity {
    @Column()
    @Field(type=> String)
    code: string

    @OneToOne(type=> User, {onDelete: "CASCADE"})
    @JoinColumn() // 1:1 관계에서 한쪽에만 조인컬럼을 작성해야함!
    user: User

    @BeforeInsert()
    createCode(): void {
        this.code = uuidv4()
    }
}