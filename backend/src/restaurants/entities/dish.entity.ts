import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { IsNumber, IsString, Length } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { Column, Entity, ManyToOne, RelationId } from "typeorm";
import { Restaurant } from "./restaurant.entity";

@InputType('DishChoiceInputType', { isAbstract: true })
@ObjectType()
export class DishChoice {
  @Field(type => String)
  name: string;
  @Field(type => Int, { nullable: true })
  extra?: number;
}

@InputType('DishOptionInputType', { isAbstract: true })
@ObjectType()
export class DishOption {
  @Field(type => String)
  name: string;
  @Field(type => [DishChoice], { nullable: true })
  choices?: DishChoice[];
  @Field(type => Int, { nullable: true })
  extra?: number;
}

@InputType("DishInputType", {isAbstract: true})
@ObjectType() 
@Entity() 
export class Dish extends CoreEntity {
    
    @Field(() => String)
    @Column()
    @IsString()
    @Length(5)
    name: string;

    @Field(() => Int)
    @Column()
    @IsNumber()
    price: number;

    @Field(() => String, {nullable: true})
    @Column({nullable: true})
    @IsString()
    photo?: string;

    @Field(() => String)
    @Column()
    @IsString()
    @Length(5, 140)
    description: string;


    // ManyToOne 일때 nullable: true 가 default여서 레스토랑을 주지 않고 생성해도 에러가 안남
    //{ onDelete: 'CASCADE', nullable: false } 주었을때 restaurant 값이 없으면 error 발생
    @Field(type => Restaurant, {nullable: true})
    @ManyToOne(
        type => Restaurant, 
        restaurant => restaurant.menu,
        { onDelete: "CASCADE"}
    )
    restaurant: Restaurant

    // Relation 전체를 load하는것은 db에 부하가 크므로 레스토랑 id만 불러오는 기능을 따로 만들어주는게 좋다
    @RelationId((dish: Dish)=> dish.restaurant) // id값만을 가져오게 해주는 NestJS의 기능
    restaurantId: number

    // Column type
    // Dish option이라는 entity를 만들어서 Relation을 활용할 수도 있지만 이런 식으로 필드로도 구현 가능하다
    // 하지만 차이점은 entity로 만들면 crud에 신경을 써야 하는데, 필드로 만들면 전혀 고려할 필요가 없다는 것
    // json타입의 column은 json data를 저장할 수 있음 - json type의 필드를 사용하는 이유: 구조화된 데이터나 특정 형태를 가진 데이터 저장 시 사용함
    // mySQL과 postgre는 json 형식을 지원한다
    @Field(type=> [DishOption], {nullable: true})
    @Column({type: "json", nullable: true})
    options?: DishOption[]
}