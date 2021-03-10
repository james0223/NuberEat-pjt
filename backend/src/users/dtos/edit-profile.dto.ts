import { InputType, ObjectType, PartialType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { User } from "../entities/user.entity";

@InputType()
export class EditProfileInput extends PartialType( // 이메일과 비밀번호 둘 다, 혹은 둘 중 하나만 변경할 수 있으므로 partial과 pick을 함께 씀
    PickType(User, ["email", "password"]), // Picktype을 통해 원본 User로부터 원하는 필드만을 추출하고 PartialType을 통해 각 필드의 변경을 선택사항으로 만듦
    ) {

}

@ObjectType()
export class EditProfileOutput extends CoreOutput {

}