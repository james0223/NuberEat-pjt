import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from 'src/users/users.module';
import { AuthGuard } from './auth.guard';

@Module({
    imports: [UsersModule], // UserModule에서 UserService를 export하므로 UserModule을 import해와야 repository 등을 사용할 수 있다
    providers: [{
        provide: APP_GUARD, // nestjs에서 제공되는 guard - 가드를 앱의 모든 곳에서 사용하고 싶으면 이것을 provide하면 됌
        useClass: AuthGuard
    }]
})
export class AuthModule {}
