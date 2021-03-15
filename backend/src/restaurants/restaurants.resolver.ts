import { Args, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Role } from 'src/auth/role.decorator';
import { User } from 'src/users/entities/user.entity';
import { AllCategoriesOutput } from './dtos/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dtos/category.dto';
import { CreateRestaurantInput, CreateRestaurantOutput } from './dtos/create-restaurant.dto';
import { DeleteRestaurantInput, DeleteRestaurantOutput } from './dtos/delete-restaurant.dto';
import { EditRestaurantInput, EditRestaurantOutput } from './dtos/edit-restaurant.dto';
import { RestaurantInput, RestaurantOutput } from './dtos/restaurant.dto';
import { RestaurantsInput, RestaurantsOutput } from './dtos/restaurants.dto';
import { SearchRestaurantInput, SearchRestaurantOutput } from './dtos/search-restaurant.dto';
import { Category } from './entities/category.entity';
import { Restaurant } from './entities/restaurant.entity';
import { RestaurantService } from './restaurants.service';

@Resolver(of => Restaurant) // not mandatory to tell it's return type
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(returns => CreateRestaurantOutput) // this return type is for graphQL - mandatory + must be coded in graphql way; ex) list of restaurants = [Restaurant]
  @Role(["Owner"])
  async createRestaurant(
    @Args("input") createRestaurantInput: CreateRestaurantInput, // CreateRestaurantsDto가 InputType이므로 Args에 input의 이름을 넣어줘야함
    @AuthUser() authUser: User
    ): Promise<CreateRestaurantOutput> { // this return type is for typescript - not mandatory to code this + coded in typescript way ex) Restaurant[]
    return this.restaurantService.createRestaurant(authUser, createRestaurantInput);
  }

  @Mutation(returns => EditRestaurantOutput)
  @Role(["Owner"])
  async editRestaurant(
    @AuthUser() owner: User,
    @Args("input") editRestaurantInput: EditRestaurantInput
  ): Promise<EditRestaurantOutput>{
    return this.restaurantService.editRestaurant(owner, editRestaurantInput)
  }

  @Mutation(returns => EditRestaurantOutput)
  @Role(["Owner"])
  deleteRestaurant(
    @AuthUser() owner: User,
    @Args("input") deleteRestaurantInput: DeleteRestaurantInput
  ): Promise<DeleteRestaurantOutput> {
    return this.restaurantService.deleteRestaurant(owner, deleteRestaurantInput)
  }

  @Query(returns => RestaurantsOutput)
  restaurants(
    @Args('input') restaurantsInput: RestaurantsInput,
  ): Promise<RestaurantsOutput> {
    return this.restaurantService.allRestaurants(restaurantsInput);
  }

  @Query(returns => RestaurantOutput)
  restaurant(
    @Args("input") restaurantInput: RestaurantInput
  ): Promise<RestaurantOutput>{
    return this.restaurantService.findRestaurantById(restaurantInput)
  }

  @Query(returns => SearchRestaurantOutput)
  searchRestaurant(
    @Args("input") searchRestaurantInput: SearchRestaurantInput
  ): Promise<SearchRestaurantOutput>{
    return this.restaurantService.searchRestaurantByName(searchRestaurantInput)
  }
}



// Category는 매우 작으므로 별다른 module을 만들지 않음
@Resolver(of => Category)
export class CategoryResolver {
  constructor(private readonly restaurantService: RestaurantService){}

  // Resolved Field는 ComputedField(Dynamic Field)로, 매 Request마다 계산된 Field를 생성해준다
  /* Resolve Field의 작동방식
  {
    allCategories{
      ok
      error
      categories{
        slug
        name
        restaurantCount
      }
    }
  }
  */
  @ResolveField(type => Int)
  restaurantCount(
    @Parent() category: Category // graphql에서 현재 진행중인 field의 부모(Parent)를 받아오는 기능, 즉 위의 query에서 restaurantCount의 부모는 categories 배열의 인자(category)가 된다.
  ): Promise<number> {
    // 여기엔 await 할 필요 없는 이유: Promise를 return하면 브라우저가 알아서 결과가 나올 때까지 기다려주기 때문
    return this.restaurantService.countRestaurants(category)
  }

  @Query(type => AllCategoriesOutput)
  allCategories(): Promise<AllCategoriesOutput>{
    return this.restaurantService.allCategories()
  }

  @Query(type => CategoryOutput)
  category(@Args("input") categoryInput: CategoryInput): Promise<CategoryOutput> {
    return this.restaurantService.findCategoryBySlug(categoryInput)
  }
}