import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { AllCategoriesOutput } from "./dtos/all-categories.dto";
import { CategoryInput, CategoryOutput } from "./dtos/category.dto";
import { CreateDishInput, CreateDishOutput } from "./dtos/create-dish.dto";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurant.dto";
import { DeleteDishInput, DeleteDishOutput } from "./dtos/delete-dish.dto";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dtos/delete-restaurant.dto";
import { EditRestaurantInput, EditRestaurantOutput } from "./dtos/edit-restaurant.dto";
import { EditDishInput, EditDishOutput } from "./dtos/eidt-dish.dto";
import { RestaurantInput, RestaurantOutput } from "./dtos/restaurant.dto";
import { RestaurantsInput, RestaurantsOutput } from "./dtos/restaurants.dto";
import { SearchRestaurantInput, SearchRestaurantOutput } from "./dtos/search-restaurant.dto";
import { Category } from "./entities/category.entity";
import { Dish } from "./entities/dish.entity";
import { Restaurant } from "./entities/restaurant.entity";
import { CategoryRepository } from "./repositories/category.repository";
import { RestaurantRepository } from "./repositories/restaurant-pagin.repository";

const PER_PAGE = 10


@Injectable()
export class RestaurantService {
    constructor(
        // Inject the repository of a Restaurant entity
        // This allows the use of "this" in methods - methods: functions in classes are called methods
        private readonly restaurants: RestaurantRepository, // restaurants is the repository for Restaurant entity
        @InjectRepository(Dish)
        private readonly dishes: Repository<Dish>,
        // @InjectRepository(Category) => Custom repo에는 repository를 inject 할 필요 없음
        private readonly categories: CategoryRepository // 새로 만들어낸 custom repository
        ) {} 

    async restaurantChecker(restaurantId: number, ownerId: number): Promise<EditRestaurantOutput>{
        const restaurant = await this.restaurants.findOne(
            restaurantId, {loadRelationIds: true}
            ) // 레스토랑과 연결된 owner값을 가져올 때, owner의 User entity 전체를 가져오는것보단 필요한 id값만을 가져오는게 더 빠르다
        if (!restaurant) {
            return {
                ok: false,
                error: "Restaurant not found"
            }
        }
        if (ownerId !== restaurant.ownerId) {
            return {
                ok: false,
                error: "You are not the owner of this restaurant"
            }
        }
        return {
            ok: true
        }
    }
    
    async createRestaurant(
        owner: User,
        createRestaurantInput: CreateRestaurantInput
        ): Promise<CreateRestaurantOutput> {
            try {
                // Difference of create and save in typeorm
                const newRestaurant = this.restaurants.create(createRestaurantInput) // create just creates a new entity, without affecting the database
                newRestaurant.owner = owner
                const category = await this.categories.getOrCreate(createRestaurantInput.categoryName)
                newRestaurant.category = category
                await this.restaurants.save(newRestaurant) // save saves the newly created entity on the database and returns the saved entity
                return {
                    ok: true
                }
            } catch (error) {
                return {
                    ok: false,
                    error: "Could not create restaurant"               
                }
            }
    }

    async editRestaurant(owner: User, editRestaurantInput: EditRestaurantInput): Promise<EditRestaurantOutput> {
        try {
            const {ok, error} = await this.restaurantChecker(editRestaurantInput.restaurantId, owner.id)
            if (!ok) {
                return {
                    ok: false,
                    error: error
                }
            }
            let category: Category = null
            // input data에 카테고리명이 있으면(null이 아니면) 카테고리 변경을 시도한다는 것으로 한다
            if (editRestaurantInput.categoryName) {
                category = await this.categories.getOrCreate(editRestaurantInput.categoryName)
            }
            await this.restaurants.save([{
                // 중요! save는 id를 인자로 넣지 않으면 새로운 entity를 만들어낸다! 반드시 id를 넣어야 update처럼 사용할 수 있다
                id: editRestaurantInput.restaurantId,
                ...editRestaurantInput,
                ...(category && { category }) // 카테고리가 null이 아니면 category: category를 실행한다와 같음
            }])
            return {ok: true}
        } catch(error) {
            return {
                ok: false,
                error: error
            }
        }
    }

    async deleteRestaurant(owner: User, {restaurantId}: DeleteRestaurantInput): Promise<DeleteRestaurantOutput> {
        try {
            const {ok, error} = await this.restaurantChecker(restaurantId, owner.id)
            if (!ok) {
                return {
                    ok: false,
                    error: error
                }
            }
            await this.restaurants.delete({id: restaurantId})
            return {
                ok: true
            }
        } catch (error) {
            return {
                ok: false,
                error: "Could not delete restaurant"
            }
        }
    }

    async allCategories(): Promise<AllCategoriesOutput>{
        try {
            const categories = await this.categories.find()
            return {
                ok: true,
                categories
            }
        } catch (error){
            return {
                ok: false,
                error: "Could not load categories"
            }
        }
    }

    countRestaurants(category: Category){
        // 인자로 들어온 카테고리를 카테고리값으로 갖는 restaurant를 계산하여 반환
        return this.restaurants.count({category})
    }

    async findCategoryBySlug({slug, page}: CategoryInput): Promise<CategoryOutput>{
        try {
            // // 관계가 생성된 것을 가져올 때는 반드시 relations를 명시해주어야 한다
            // const category = await this.categories.findOne({ slug: slug }, {relations:["restaurants"]}) => 하지만 이대로는 db의 모든 것들을 가져와서 DB가 과부하되므로, 페이지네이션을 사용한다
            const category = await this.categories.findOne({ slug: slug })
            if (!category) {
                return {
                    ok: false,
                    error: "Category not found"
                }
            }
            const restaurants = await this.restaurants.find(
                {where: {
                    category: category,   
                },
                take: PER_PAGE,
                skip: (page - 1) * PER_PAGE, // 페이지를 넘어가면 이전것은 skip해야함
                order: {
                    isPromoted: "DESC"
                }
            })
            const totalResults = await this.countRestaurants(category)
            return {
                ok: true,
                restaurants,
                category,
                totalPages: Math.ceil(totalResults / PER_PAGE)
            }
        } catch {
            return {
                ok: false,
                error: "Could not load category"
            }
        }
    }

    async allRestaurants({page}: RestaurantsInput): Promise<RestaurantsOutput>{
        try {
            const [restaurants, totalResults] = await this.restaurants.pagination(page, PER_PAGE)
            return {
                ok: true,
                results: restaurants,
                totalPages: Math.ceil(totalResults / PER_PAGE),
                totalResults
            }
        } catch {
            return {
                ok: false,
                error: "Could not load restaurants"
            }
        }
    }

    async findRestaurantById({restaurantId}: RestaurantInput): Promise<RestaurantOutput> {
        try {
            const restaurant = await this.restaurants.findOne(restaurantId, {
                relations:["menu"] // 이걸 엮어줘야 restaurant를 검색할 때, menu를 불러올 수 있기 때문
            })
            if (!restaurant){
                return {
                    ok: false,
                    error: "Restaurant Not Found"
                }
            }
            return {
                ok: true,
                restaurant
            }
        } catch {
            return {
                ok: false,
                error: "Could not find restaurant"
            }
        }
    }

    async searchRestaurantByName({query, page}: SearchRestaurantInput): Promise<SearchRestaurantOutput>{
        try {
            const [restaurants, totalResults] = await this.restaurants.pagination(page, PER_PAGE, query)
            return {
                ok: true,
                restaurants: restaurants, 
                totalResults: totalResults,
                totalPages: Math.ceil(totalResults / PER_PAGE)
            }
        } catch {
            return {
                ok: false,
                error: "Could not search for restaurants"
            }
        }
    }
    /// IMPORTANT: update function gets executed even if the entity of the given criteria does not exist inside the database!

    async createDish(owner: User, createDishInput: CreateDishInput): Promise<CreateDishOutput>{
        try {
            const restaurant = await this.restaurants.findOne(createDishInput.restaurantId)
        if (!restaurant) {
            return {
                ok: false,
                error: "Restaurant not found"
            }
        }
        if (owner.id !== restaurant.ownerId){
            return {
                ok: false,
                error: "You are not the owner of this restaurant"
            }
        }
        const dish = await this.dishes.save(this.dishes.create({...createDishInput, restaurant}))
        console.log(dish)
        return {
            ok: true
        }
        } catch (e){
            return {
                ok: false,
                error: "Could not create dish"
            }
        }
    }

    async editDish(owner: User, editDishInput: EditDishInput): Promise<EditDishOutput>{
        try {
            const dish = await this.dishes.findOne(editDishInput.dishId)
        if (!dish) {
            return {
                ok: false,
                error: "Dish not found"
            }
        }
        if (owner.id !== dish.restaurant.ownerId){
            return {
                ok: false,
                error: "You are not the owner of this restaurant"
            }
        }
        await this.dishes.save([{
            id: editDishInput.dishId,
            ...editDishInput
        }])
        return {
            ok: true
        }
        } catch (e){
            return {
                ok: false,
                error: "Could not edit dish"
            }
        }
    }

    async deleteDish(owner: User, {dishId}: DeleteDishInput): Promise<DeleteDishOutput>{
        try {
            const dish = await this.dishes.findOne(dishId, {relations: ["restaurant"]})
        if (!dish) {
            return {
                ok: false,
                error: "Dish not found"
            }
        }
        if (owner.id !== dish.restaurant.ownerId){
            return {
                ok: false,
                error: "You are not the owner of this dish"
            }
        }
        await this.dishes.delete(dishId)
        return {
            ok: true
        }
        } catch (e){
            return {
                ok: false,
                error: "Could not delete dish"
            }
        }
    }
}