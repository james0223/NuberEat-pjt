import { Field, InputType, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { Restaurant } from "../entities/restaurant.entity";

// @InputType() If using inputtypes, the names must be given to use mutations in the query ex- mutation {mutationName{"nameofInputType"{~~}}}
// Argstype does not require names to be given, so the query can be simplified ex - mutation {mutationName{{~~}}}
@InputType()
// Using mapped types, we can get the dtos to follow the form of entity without having the developers to change the dto schema every time the entity changes
export class CreateRestaurantInput extends PickType(Restaurant, 
    [
        "name",
        "coverImg",
        "address"
    ]) {
        // 추가적인 필드 작성
        @Field(type => String)
        categoryName: string
    }// THE TYPES ARE GENERATED IN INPUT TYPES, SO IF THE PARENT CLASS/TYPE IS NOT AN INPUTTYPE WITH THE DECORATOR OF @InputType, THE SECOND ARGUMENT MUST BE ADDED TO CONVERT IT INTO INPUTTYPE
// class CreateRestaurantDto extends OmitType(Restaurant, ["id"], InputType) => this is how it should be coded when InputType({ isAbstact: true }) is not added to the original entity

@ObjectType()
export class CreateRestaurantOutput extends CoreOutput {}