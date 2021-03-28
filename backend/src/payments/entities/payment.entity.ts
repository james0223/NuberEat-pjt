import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { Restaurant } from "src/restaurants/entities/restaurant.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, RelationId } from "typeorm";

@InputType("PaymentInputType", {isAbstract: true})
@ObjectType()
@Entity()
export class Payment extends CoreEntity {
    
    @Field(type => Int)
    @Column()
    transactionId: number

    @Field(type => User)
    @ManyToOne(
        type => User, 
        user => user.payments,
    )
    user: User

    @RelationId((payment: Payment) => payment.user)
    userId: number
    
    //restaurant에서 payment를 검색할 일은 없으므로 반대쪽엔 생성 안해줌
    @Field(type => Restaurant)
    @ManyToOne(
        type => Restaurant,
    )
    restaurant: Restaurant

    @RelationId((payment: Payment) => payment.restaurant)
    @Field(type => Int)
    restaurantId: number
}