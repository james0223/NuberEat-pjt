import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { Dish, DishOption, DishChoice } from "src/restaurants/entities/dish.entity";
import { Column, Entity, ManyToOne } from "typeorm";

// 음식별 옵션을 설정해줌 ex - name: size, choice: XL, extra: $5
@InputType("OrderItemOptionInputType", {isAbstract: true})
@ObjectType()
export class OrderItemOption {
    @Field(type => String)
    name: string

    @Field(type => String, {nullable: true})
    choice?: String
}

@InputType("OrderItemInputType", {isAbstract: true})
@ObjectType()
@Entity()
export class OrderItem extends CoreEntity {
    // OrderItem은 하나의 Dish만 갖는다
    // 하지만 Dish는 여러 Item을 가질 수 있다
    // 여기에선 반대의 관계에서 어떻게 되는지 명시하지 않아도 된다
    // Dish를 기반으로 OrderITem을 찾을 일은 없을 것이기 때문
    @ManyToOne(type => Dish, {
        nullable: true, onDelete:"CASCADE"
    })
    dish: Dish
    // Order을 DB에 relational entity로 만들지 않는 이유
    // 음식 주문의 선택사항은 매번 바뀔 수 있다 - 방금까진 페퍼로니 팔다가 이제부턴 안팔음
    // 이럴 경우, 이전의 주문사항들이 영향을 받게 되므로, relation으로 연결하지 않는다
    // 즉 order의 option은 일회성이고 이후 음식의 옵션을 수정해도 영향이 없도록 하기 위함이다
    @Field(type=> [OrderItemOption], {nullable: true})
    @Column({type: "json", nullable: true})
    options?: OrderItemOption[]
}