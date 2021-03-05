import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CreateRestaurantDto } from './dtos/create-restaurant.dto';
import { UpdateRestaurantDTO } from './dtos/update-restaurant.dto';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';

@Resolver(()=> Restaurant) // not mandatory to tell it's return type
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}
  @Query(() => [Restaurant]) // this return type is for graphQL - mandatory + must be coded in graphql way; list of restaurants = [Restaurant]
  // In nestJS, you must ask for arguments if you need to use them
  restaurants(): Promise<Restaurant[]> { // this return type is for typescript - not mandatory to code this + coded in typescript way = Restaurant[]
    return this.restaurantService.getAll();
  }

  @Mutation(returns => Boolean)
  async createRestaurant(
    @Args("input") createRestaurantDto: CreateRestaurantDto,
  ): Promise<boolean> {
    try {
      await this.restaurantService.createRestaurant(createRestaurantDto);
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  @Mutation(returns => Boolean)
  async updateRestaurant(
    @Args() updateRestaurantDto: UpdateRestaurantDTO
  ): Promise<boolean>{
    try {
      await this.restaurantService.updateRestaurant(updateRestaurantDto)
      return true
    }
    catch (e) {
      console.log(e)
      return false
    }
  }
}