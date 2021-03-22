import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { OrderItemOption } from "../entities/order-item.entity";

// 이것을 새로 만드는 이유: Dish를 extend해서 쓰면 불필요하게 Input해야할 것들이 많아서
@InputType()
class CreateOrderItemInput {
    @Field(type => Int)
    dishId: number

    @Field(type => [OrderItemOption], {nullable: true})
    options?: OrderItemOption[]
}

@InputType()
export class CreateOrderInput {
    @Field(type => Int)
    restaurantId: number

    @Field(type => [CreateOrderItemInput])
    items: CreateOrderItemInput[]
}

@ObjectType()
export class CreateOrderOutput extends CoreOutput {}