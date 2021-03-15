import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AllowedRoles } from "src/auth/role.decorator"
import { GqlExecutionContext } from "@nestjs/graphql";
import { User } from "src/users/entities/user.entity";


@Injectable()
export class AuthGuard implements CanActivate { // canActivate 함수의 결과(true/false)에 따라 Request가 다음 단계로 넘어갈지 말지 결정하도록 함
    constructor(
        private readonly reflector: Reflector // 메타데이터를 불러오기 위한 Reflector
    ) {}
    canActivate(context: ExecutionContext) {
        // 1. resolver에 메타데이터가 있는지 확인한다
        const roles = this.reflector.get<AllowedRoles>(
            "roles", // 이 이름은 메타데이터 내부의 key값과 일치해야 한다. roles decorator에서 roles를 key값으로 설정해주었으므로 그에 맞춘다
            context.getHandler()
        )
        // 2. 만약 resolver에 메타데이터가 존재하지 않는다면, 그것은 public resolver이라는 의미이므로 request를 허락한다
        if (!roles) {
            return true
        }
        // 3. 하지만 resolver에 메타데이터가 존재한다면, 그것은 private resolver이라는 의미이므로 요청자가 인증된 유저인지를 확인한다
        // context에 담긴 user는 http로 되어있기 때문에 graphql로 바꿔줘야함
        const gqlContext = GqlExecutionContext.create(context).getContext()
        const user:User = gqlContext["user"] // user의 타입이 User임을 선언해서 아래에서 user.role이 가능하도록 함
        // 4. 만약 요청자가 인증되지 않은 상태라면 종료시킨다
        if (!user) {
            return false
        }
        // 5. 요청자가 인증된 상태이고, resolver가 별다른 인가를 필요로 하지 않는다면(Any) 통과시킨다
        if (roles.includes("Any")) {
            return true
        }
        // 6. 하지만 resolver가 특수한 role에게만 request를 허용한다면, 요청자의 role이 그 화이트리스트에 속해있는지를 확인한다
        return roles.includes(user.role)
    }
}