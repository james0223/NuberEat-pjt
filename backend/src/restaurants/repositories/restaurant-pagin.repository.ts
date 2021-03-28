import { EntityRepository, Like, Raw, Repository } from "typeorm";
import { Restaurant } from "../entities/restaurant.entity";

@EntityRepository(Restaurant)
export class RestaurantRepository extends Repository<Restaurant>{
    async pagination(page: number, per_page: number, query: string = ""){
        try {
            const result = await this.findAndCount({
                where: {
                    // typeorm의 Like를 통해 db쿼리 
                    // name: Like(`%${query}%`) => typeorm에는 ILike가 없다(대소문자 구분 없이 검색하는거)
                    name: Raw(name => `${name} ILIKE '%${query}%'`) // Raw 쿼리를 실행하게 해줌
                },
                skip:(page - 1) * per_page,
                take: per_page,
                order: {
                    isPromoted: "DESC"
                }
            })
            return result
        } catch {
            throw new Error()
        }
    }
}