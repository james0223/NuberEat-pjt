import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule} from "@nestjs/typeorm"
import { ConfigModule } from '@nestjs/config';
import * as Joi from "joi" // cannot use import Joi from "joi" because it is not a file made in typescript or nestjs way
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { JwtModule } from './jwt/jwt.module';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { Verification } from './users/entities/verification.entity';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    // You install and config a module here and this tells nestjs what modules you possess
    // By doing so, they can be called upon in the subsidary modules and be used there!
    // The services of subsidiary modules need to call them inside the constructor to use them
    // This is called dependency injection
    ConfigModule.forRoot({
      isGlobal: true, // allows us to access config module from all around the app
      envFilePath: process.env.NODE_ENV === "dev" ? ".env.dev" : ".env.test", //selecting the env - if dev then use .env.dev if not use .env.test
      ignoreEnvFile: process.env.NODE_ENV === "prod", //when in production mode, it will ignore env files
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid("dev", "prod").required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_NAME: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_DOMAIN_NAME: Joi.string().required(),
        MAILGUN_FROM_EMAIL: Joi.string().required()
      }) // with the help of joi, we can validate env variables + increases security by even validating environment variables
    }),
    GraphQLModule.forRoot({ // forRoot configures a root module
      // autoSchemaFile: join(process.cwd(), 'src/schema.gql')
      autoSchemaFile: true, // by doing so, this prevents schema.gql file being created within the src folder
      context: ({req}) => ({user: req["user"]}) // jwtmiddleware에서 request를 먼저 받아 token에서 추출해낸 user를 req["user"]에 넣어 보내주므로 이를 context에 담아 전역변수처럼 활용하는것
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: process.env.NODE_ENV !== "prod", // when set to true, TypeORM when connects to database, it migrates the database based on your modules
      logging: process.env.NODE_ENV == "prod", // See on the console what is happening on the database
      entities: [User, Verification] // by adding created entities to this list, the tables of those entities can be created in DB
    }),
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY
    }),
    UsersModule,
    MailModule.forRoot({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN_NAME,
      fromEmail: process.env.MAILGUN_FROM_EMAIL
    }),
  ],
  controllers: [],
  providers: [],
})
// 미들웨어 설정할 때 글로벌하게 사용할것이면 appmodule에, 특정 모듈에서만 사용할거면 해당 모듈에 작성
export class AppModule implements NestModule { // 미들웨어 사용을 위해 implements NestModule을 추가한다
  configure(consumer: MiddlewareConsumer){
    // we are applying JwtMiddleware for the routes

    consumer.apply(JwtMiddleware).forRoutes({
      path: "/graphql", // that starts with /graphql -> /* for all the routes
      method: RequestMethod.POST // that are sent via POST request -> ALL for all methods
    })
    // exclude를 사용해서 특정 경로나 method를 제외하는것도 가능
  }
}

// 또는 main.ts에서 설정할 수도 있다 - 함수형 미들웨어일때만!
// export class AppModule {}
