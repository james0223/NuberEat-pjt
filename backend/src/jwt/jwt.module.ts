import { DynamicModule, Global, Module } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtModuleOptions } from './jwt.interfaces';
import { JwtService } from './jwt.service';

@Module({
  // providers: [JwtService] 서비스 생성하면 이게 생성되지만 이렇게 안할거임
})
@Global()
export class JwtModule {
  // create a file that exports interface and call it here within forRoot
  // as for the arguments, they are given at app.module
  static forRoot(options: JwtModuleOptions): DynamicModule {
    return {
      module: JwtModule,
      providers: [
        // 이것이 provider의 실제 작동 방식
        {
          provide: "The name of the thing you want to inject into Service",
          // useValue, useClass 등 다양함
          useValue: "Some_Values",
        },
        {
          provide: CONFIG_OPTIONS,
          useValue: options
        },
        // 아래와 같이 하는 것은 자동으로 위의 작업이 완료된 간단한 방식인 것
        JwtService
      ],
      exports: [JwtService], // for other modules to use JwtService, it needs to be exported!
    } // Dynamic 모듈화를 위한 함수명은 자유이나, 컨벤션에 따라 forRoot로 한다
  }
}
