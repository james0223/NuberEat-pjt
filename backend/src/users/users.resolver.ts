import { UseGuards } from "@nestjs/common";
import { Resolver, Query, Mutation, Args, Context } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { AuthGuard } from "src/auth/auth.guard";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/create-account.dto";
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { UserProfileInput, UserProfileOutput } from "./dtos/user-profile.dto";
import { User } from "./entities/user.entity";
import { UserService } from "./users.service";

// Resolver handles inputs and outputs
@Resolver(of => User)
export class UserResolver {
    constructor(
        private readonly usersService: UserService
    ) {}

    @Query(returns => Boolean)
    hi(){
        return true
    }

    @Mutation(returns => CreateAccountOutput)
    async createAccount(@Args("input") createAccountInput: CreateAccountInput
    ): Promise<CreateAccountOutput>{
        try {
            return this.usersService.createAccount(createAccountInput)
        } catch(e){
            return {
                error: e,
                ok: false
            }
        }
    }

    @Mutation(returns => LoginOutput)
    async login(@Args("input") loginInput: LoginInput): Promise<LoginOutput>{
        try {
            return await this.usersService.login(loginInput)
        } catch (error){
            return {
                ok: false,
                error
            }
        }
    }

    @Query(returns => User)
    @UseGuards(AuthGuard)
    me(@AuthUser() authUser: User){
        return authUser
    }

    @UseGuards(AuthGuard)
    @Query(returns=> UserProfileOutput)
    async userProfile(@Args() userProfileInput: UserProfileInput): Promise<UserProfileOutput> {
        const user = await this.usersService.findById(userProfileInput.userId)
        try {
            const user = await this.usersService.findById(userProfileInput.userId)
            if (!user) {
                throw Error()
            }
            return {
                ok: true,
                user,
            }
        } catch (e) {
            return {
                error: "User Not Found",
                ok: false
            }
        }
    }

    @UseGuards(AuthGuard)
    @Mutation(returns => EditProfileOutput)
    async editProfile(
        @AuthUser() authUser: User, 
        @Args("input") editProfileInput: EditProfileInput
    ): Promise<EditProfileOutput> {
        try {
            await this.usersService.editProfile(authUser.id, editProfileInput)
        } catch (error) {
            return {
                ok: false,
                error
            }
        }
    }
}