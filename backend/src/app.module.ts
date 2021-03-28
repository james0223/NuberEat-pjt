import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule} from "@nestjs/typeorm"
import { ConfigModule } from '@nestjs/config';
import * as Joi from "joi" // cannot use import Joi from "joi" because it is not a file made in typescript or nestjs way
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { JwtModule } from './jwt/jwt.module';
import { Verification } from './users/entities/verification.entity';
import { MailModule } from './mail/mail.module';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { Category } from './restaurants/entities/category.entity';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { AuthModule } from './auth/auth.module';
import { Dish } from './restaurants/entities/dish.entity';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';
import { OrderItem } from './orders/entities/order-item.entity';
import { CommonModule } from './common/common.module';
import { PaymentsModule } from './payments/payments.module';
import { Payment } from './payments/entities/payment.entity';
import { ScheduleModule } from '@nestjs/schedule';

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
        // npm run test를 하게되면 NODE_ENV가 위의 설정에 따라 .env.test가 된다
        NODE_ENV: Joi.string().valid("dev", "prod", "test")
        .required(),
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
      installSubscriptionHandlers: true,
      autoSchemaFile: true, // by doing so, this prevents schema.gql file being created within the src folder
      context: ({ req, connection }) => {
        // http 프로토콜인지 websocket 프로토콜인지에 따라 다르게 세팅해야 한다
        const TOKEN_KEY = "x-jwt"
        // http 프로토콜일 경우 req가 존재하며, websocket일 경우, connection이 존재한다
        return {
          token: req? req.headers[TOKEN_KEY] : connection.context[TOKEN_KEY]
        }
      } // jwtmiddleware에서 request를 먼저 받아 token에서 추출해낸 user를 req["user"]에 넣어 보내주므로 이를 context에 담아 전역변수처럼 활용하는것 - 폐기됨
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: process.env.NODE_ENV !== "prod", // when set to true, TypeORM when connects to database, it migrates the database based on your modules
      logging: process.env.NODE_ENV !== "prod" && process.env.NODE_ENV !== "test", // See on the console what is happening on the database
      entities: [User, Verification, Restaurant, Category, Dish, Order, OrderItem, Payment] // by adding created entities to this list, the tables of those entities can be created in DB
    }),
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    RestaurantsModule,
    MailModule.forRoot({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN_NAME,
      fromEmail: process.env.MAILGUN_FROM_EMAIL
    }),
    OrdersModule,
    CommonModule,
    PaymentsModule
  ],
  controllers: [],
  providers: [],
})

export class AppModule {}

// 아래의 방법들은 HTTP 프로토콜에서만 jwt 미들웨어가 작동하도록 코딩되었기에 websocket 사용을 위해 폐기한다
// Nestjs에서 제공하는 APP_Guard는 Http와 websocket 요청 모두에 반응하므로 guard를 사용하여 인증절차를 처리할 수 있다

// 미들웨어 설정할 때 글로벌하게 사용할것이면 appmodule에, 특정 모듈에서만 사용할거면 해당 모듈에 작성
// export class AppModule implements NestModule { // 미들웨어 사용을 위해 implements NestModule을 추가한다
//   configure(consumer: MiddlewareConsumer){
//     // we are applying JwtMiddleware for the routes

//     consumer.apply(JwtMiddleware).forRoutes({
//       path: "/graphql", // that starts with /graphql -> /* for all the routes
//       method: RequestMethod.POST // that are sent via POST request -> ALL for all methods
//     })
//     // exclude를 사용해서 특정 경로나 method를 제외하는것도 가능
//   }
// }

// 또는 main.ts에서 설정할 수도 있다 - 함수형 미들웨어일때만!
// export class AppModule {}
