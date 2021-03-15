import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { CategoryRepository } from './repositories/category.repository';
import { RestaurantRepository } from './repositories/restaurant-pagin.repository';
import {CategoryResolver, RestaurantResolver} from "./restaurants.resolver"
import { RestaurantService } from './restaurants.service';

@Module({
    imports : [TypeOrmModule.forFeature([RestaurantRepository, CategoryRepository])],
    providers: [RestaurantResolver, RestaurantService, CategoryResolver]
})
export class RestaurantsModule {}
