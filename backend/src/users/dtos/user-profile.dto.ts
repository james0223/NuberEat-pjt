import { ArgsType, Field, ObjectType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { User } from "../entities/user.entity";


@ArgsType()
export class UserProfileInput {
    @Field(type => Number)
    userId: number
}

@ObjectType()
export class UserProfileOutput extends CoreOutput {
    @Field(type=> User, {nullable: true})
    user?: User // 가끔은 유저를 못 찾는 경우가 있으므로 nullable하게 해줘야함
}