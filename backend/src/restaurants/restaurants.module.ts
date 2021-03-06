import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dish } from './entities/dish.entity';
import { CategoryRepository } from './repositories/category.repository';
import { RestaurantRepository } from './repositories/restaurant-pagin.repository';
import {CategoryResolver, DishResolver, RestaurantResolver} from "./restaurants.resolver"
import { RestaurantService } from './restaurants.service';

@Module({
    imports : [TypeOrmModule.forFeature([RestaurantRepository, Dish, CategoryRepository])],
    providers: [RestaurantResolver, RestaurantService, CategoryResolver, DishResolver]
})
export class RestaurantsModule {}
