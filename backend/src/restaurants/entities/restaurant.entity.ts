import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsString, Length } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { Order } from "src/orders/entities/order.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany, RelationId } from "typeorm";
import { Category } from "./category.entity";
import { Dish } from "./dish.entity";


@InputType("RestaurantInputType", {isAbstract: true}) // DTO를 위한 데코레이터
// isAbstract란 - 이 자체를 schema로 쓰지 않고 어딘가에서 복사해서(extends) 쓰는 용도로만 하겠다는 것 - 우리의 경우, DTO에서 복사해서 씀
// DTO는 mapped type을 사용하는데, 이 mapped type의 조건은 parent 와 child의 type이 같아야 한다는 것
// 하지만 entity는 ObjectType이고 DTO는 InputType이므로 서로 어긋나기에, DTO가 entity의 형태를 활용하는데 지장이 없도록 하기 위해서 InputType을 넣고 isAbstract를 true로 하는 것이다
// Using objecttype and entity together allows graphql and typeorm to use this file at the same time
@ObjectType() // graphql의 ObjectType을 위한 데코레이터
@Entity() // 데이터베이스 테이블을 생성하는 데코레이터
export class Restaurant extends CoreEntity {
    // Describe how restaurant looks like from the graphql point of view
    // It creates the object type for restaurant
    
    @Field(() => String) // the arument must be a function
    @Column() // Column is TypeORM's Field
    @IsString()
    @Length(5)
    name: string;

    // Vegan은 연습용이었으니 없앰
    // @Field(()=> Boolean, {defaultValue: true}) // for graphql schema, the default val is true
    // @Column({ default: true} ) // for database, this val is true
    // @IsOptional() // This is for DTO
    // @IsBoolean()
    // isVegan: boolean

    @Field(()=> String, {defaultValue: "한국"})
    @IsString()
    @Column()
    address: string

    @Field(type => String)
    @Column()
    @IsString()
    coverImg: string

    @Field(type => Category, {nullable: true}) // category가 삭제될 때 restaurant를 지우면 안되기 때문
    @ManyToOne(
        type => Category, 
        category => category.restaurants,
        { nullable: true, onDelete: "SET NULL"}
    )
    category: Category

    @Field(type => User)
    @ManyToOne(
        type => User, 
        user => user.restaurants,
        {onDelete: "CASCADE"}
    )
    owner: User
    
    @RelationId((restaurant: Restaurant)=> restaurant.owner) // id값만을 가져오게 해주는 NestJS의 기능
    ownerId: number

    @Field(type => [Order])
    @OneToMany(
        type => Order, 
        order => order.restaurant
    )
    orders: Order[]

    @Field(type => [Dish])
    @OneToMany(
        type => Dish, 
        dish => dish.restaurant // dish에서 restuarant를 저장한 필드명(역참조)
    )
    menu: Dish[]
}