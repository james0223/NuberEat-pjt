import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { TypeOrmModule} from "@nestjs/typeorm"
import { ConfigModule } from '@nestjs/config';
import * as Joi from "joi" // cannot use import Joi from "joi" because it is not a file made in typescript or nestjs way
import { Restaurant } from './restaurants/entities/restaurant.entity';

@Module({
  imports: [
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
      }) // with the help of joi, we can validate env variables + increases security by even validating environment variables
    }),
    GraphQLModule.forRoot({ // forRoot configures a root module
      // autoSchemaFile: join(process.cwd(), 'src/schema.gql')
      autoSchemaFile: true // by doing so, this prevents schema.gql file being created within the src folder
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: process.env.NODE_ENV !== "prod", // when set to true, TypeORM when connects to database, it migrates the database based on your modules
      logging: process.env.NODE_ENV !== "prod", // See on the console what is happening on the database
      entities: [Restaurant] // by adding Restaurants to the entities, the restaurant table can be created in DB
    }),
    RestaurantsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
