import { ArgsType, Field, InputType, PartialType } from "@nestjs/graphql";
import { CreateRestaurantDto } from "./create-restaurant.dto";


@InputType()
class UpdateRestaurantInputType extends PartialType(CreateRestaurantDto) {}
// The reason it is the partial type of CreateRestaurantDTO is because the Id value should not be optional to query the restaurant


@ArgsType()
export class UpdateRestaurantDTO {

    @Field(type => Number)
    id: number

    @Field(type => UpdateRestaurantInputType)
    data: UpdateRestaurantInputType
}