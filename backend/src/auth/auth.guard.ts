import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";


@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext) {
        // context에 담긴 user는 http로 되어있기 때문에 graphql로 바꿔줘야함
        const gqlContext = GqlExecutionContext.create(context).getContext()
        const user = gqlContext["user"]
        if (!user) {
            return false
        }
        return true
    } // canActivate 함수 결과에 따라 Request가 다음 단계로 넘어갈지 말지 결정하도록 함
}