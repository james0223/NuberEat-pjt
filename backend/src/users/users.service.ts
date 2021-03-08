import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAccountInput } from "./dtos/create-account.dto";
import { LoginInput } from "./dtos/login.dto";
import { User } from "./entities/user.entity";

// Service handles functions and errors

// Hashing is a one way function; it can not be executed backwards
// Therefore, a hashed password cannot be returned to its original form whatsoever
@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly users: Repository<User>
    ) {}
    
    async createAccount({
        email, 
        password, 
        role
    }: CreateAccountInput): Promise<{ok: boolean, error: string }>{
        // check new user
        try {
            const exists = await this.users.findOne({ email })
            if (exists) {
                // make error
                return {ok: false, error: "There is a user with that email already"}
            }
            await this.users.save(this.users.create({email, password, role}))
            return {ok: true, error: ""}
        } catch (e) {
            // make error
            return {ok: false, error: "Couldn't create account"}
        }
        // create user & hash password
        
    }

    async login({email, password}: LoginInput): Promise<{ ok: boolean; error?:string; token?: string }>{
        // find the user with the email
        // check if the password is correct
        // make a jwt and give it to the user
        try {
            const user = await this.users.findOne({ email })
            if (!user) {
                return {
                    ok: false,
                    error: "User not found"
                }
            }
            const passwordCorrect = await user.checkPassword(password)
            if (!passwordCorrect) {
                return {
                    ok: false,
                    error: "Wrong Password"
                }
            }
            return {
                ok: true,
                token: "hey"
            }
        } catch(error) {
            return {
                ok: false,
                error
            }
        }
    }
}