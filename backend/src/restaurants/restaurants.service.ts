import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateRestaurantDto } from "./dtos/create-restaurant.dto";
import { UpdateRestaurantDTO } from "./dtos/update-restaurant.dto";
import { Restaurant } from "./entities/restaurant.entity";


@Injectable()
export class RestaurantService {
    constructor(
        // Inject the repository of a Restaurant entity
        // This allows the use of "this" in methods - methods: functions in classes are called methods
        @InjectRepository(Restaurant)
        private readonly restaurants: Repository<Restaurant> // restaurants is the repository for Restaurant entity
    ) {}
    getAll(): Promise<Restaurant[]>{
        return this.restaurants.find() // find() is async, so need a promise
    }
    createRestaurant(createRestaurantDto: CreateRestaurantDto): Promise<Restaurant> {
        // Difference of create and save in typeorm
        const newRestaurant = this.restaurants.create(createRestaurantDto) // create just creates a new entity, without affecting the database
        return this.restaurants.save(newRestaurant) // save saves the newly created entity on the database and returns the saved entity
    }
    updateRestaurant({ id, data }: UpdateRestaurantDTO) {
        // IMPORTANT: update function gets executed even if the entity of the given criteria does not exist inside the database!
        return this.restaurants.update(id, {...data}) // If somebody puts in a id that does not exist, it will just be executed and not throw any errors
    }
}