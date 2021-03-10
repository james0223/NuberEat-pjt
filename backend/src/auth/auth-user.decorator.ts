import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";


export const AuthUser = createParamDecorator(
    // This requires a factory function that takes in data and context as its args
    (data: unknown, context: ExecutionContext) => {
        const gqlContext = GqlExecutionContext.create(context).getContext()
        const user = gqlContext["user"]
        return user
    }
)