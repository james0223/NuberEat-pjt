import { Inject, Injectable } from '@nestjs/common';
import { JwtModuleOptions } from './jwt.interfaces';
import * as jwt from "jsonwebtoken"
import { CONFIG_OPTIONS } from './jwt.constants';

@Injectable()
export class JwtService {
    constructor(
        @Inject(CONFIG_OPTIONS) private readonly options: JwtModuleOptions
    ) {}
    sign(userId: number): string {
        return jwt.sign({id: userId}, this.options.privateKey) // configService에서 privatekey를 가져와도 되지만(글로벌 모듈) 이러한 방법도 있음을 알자!
    }
    verify(token: string) {
        return jwt.verify(token, this.options.privateKey)
    }
}
