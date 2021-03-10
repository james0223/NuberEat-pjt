import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { UserService } from "src/users/users.service";
import { JwtService } from "./jwt.service";

// implements: this class should act like an interface
// To receive tokens from the client, we use HTTP headers for transmission and middlewares to handle them

// 1. Class방식의 미들웨어
@Injectable()
export class JwtMiddleware implements NestMiddleware {
    constructor(private readonly jwtService: JwtService, 
    private readonly userService: UserService) {}
    async use(req:Request, res:Response, next: NextFunction){
        if ("x-jwt" in req.headers) {
            const token = req.headers["x-jwt"]
            try {
                const decoded = this.jwtService.verify(token.toString())
                if (typeof decoded === "object" && decoded.hasOwnProperty("id")) {
                    const user = await this.userService.findById(decoded["id"])
                    req["user"] = user;
                } 
            } catch (e) {
                console.log(e)
            }
        }
        next()
    }
}

// 2. Function 미들웨어 - 이 프로젝트에선 user repository를 사용해야 하므로 class로 쓴다
// export function JwtMiddleware(req: Request, res:Response, next: NextFunction) {
//     next()
// }