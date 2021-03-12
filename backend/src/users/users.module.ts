import { Module } from '@nestjs/common';
import { TypeOrmModule } from "@nestjs/typeorm"
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UserResolver } from './users.resolver';
import { UserService } from './users.service';

@Module({
    imports: [TypeOrmModule.forFeature([User, Verification])],
    providers: [UserResolver, UserService],
    exports: [UserService] // to use UserService in other modules, it needs to be exported
})
export class UsersModule {}
