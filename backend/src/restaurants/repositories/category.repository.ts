import {EntityRepository, Repository} from "typeorm";
import { Category } from "../entities/category.entity";

// Custom repository의 단계
// 1. Service에서 불러오는 값을 Repository<X>에서 custom repo 이름으로 변경
// 2. module에서 typeorm.forfeature에 해당 repository import하기

@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {
    async getOrCreate(name: string): Promise<Category>{
        const categoryName = name.trim().toLowerCase() // trim()은 string의 양옆의 space를 제거해줌
        const categorySlug = categoryName.replace(/ /g, "-") // 그냥 replace(" ", "-")하면 한 개의 공간만 제거되므로 저렇게 해야 모두 제거됨
        let category = await this.findOne({slug: categorySlug}) // 여기서의 this는 Repository를 가리킨다
        if (!category) {
            category = await this.save(this.create({slug: categorySlug, name: categoryName}))
        }
        return category
    }   
    
}