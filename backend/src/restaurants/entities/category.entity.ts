import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsOptional, IsString, Length } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Restaurant } from "./restaurant.entity";

// 중요! - InputType에 이름을 설정해준 이유
// 여기서는 ObjectType인 Category type을 만듦과 동시에 InputType을 만든다
// 문제는 아래의 Restaurant와 연결될 때인데, 아래에서 Restaurant와 연결을 맺게 되지만 반대로 Restaurant entity에서도 Category 라는 이름의 type과 1:N 관계를 맺으려 시도한다
// 이 때, InputType과 ObjectType의 Category type의 이름이 같다면(이름을 부여해주지 않았다면) 어느 Category type과 관계를 맺어야 하는지 알 수 없게 되는 것
// 따라서 InputType에는 CategoryInputType이라는 이름을 따로 부여함으로써, Restaurants가 ObjectType의 Category와 관계를 맺을 수 있도록 한다
@InputType("CategoryInputType", {isAbstract: true}) // abstract type이므로 Schema에 이 이름이 보이진 않을 것이나 컴퓨터는 인식하고 있을 것
@ObjectType() 
@Entity() 
export class Category extends CoreEntity {
    
    @Field(() => String) // the arument must be a function
    @Column({ unique: true }) // Column is TypeORM's Field
    @IsString()
    @Length(5)
    name: string;

    @Field(()=> String, {nullable: true})
    @Column({ nullable: true })
    @IsString()
    coverImg: string

    @Field(type => String)
    @Column({ unique: true })
    @IsString()
    slug: string

    @Field(type => [Restaurant])
    @OneToMany(
        type => Restaurant, 
        restaurant => restaurant.category
    )
    restaurants: Restaurant[]

}