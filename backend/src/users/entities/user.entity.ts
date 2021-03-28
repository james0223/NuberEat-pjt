import { Field, InputType, ObjectType, registerEnumType } from "@nestjs/graphql"
import { CoreEntity } from "src/common/entities/core.entity"
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from "typeorm"
import * as bcrypt from "bcrypt"
import { InternalServerErrorException } from "@nestjs/common"
import { IsBoolean, IsEmail, IsEnum, IsString} from "class-validator"
import { Restaurant } from "src/restaurants/entities/restaurant.entity"
import { Order } from "src/orders/entities/order.entity"
import { OrdersModule } from "src/orders/orders.module"
import { Payment } from "src/payments/entities/payment.entity"

export enum UserRole {
    Client = "Client", // string을 부여해주면 더 이상 0, 1, 2 로 선언되지 않고 string이 됨
    Owner = "Owner",
    Delivery = "Delivery"
} // for database enum

registerEnumType(UserRole, {name: "UserRole"}) // for graphql enum

// Type별 용도
// InputType은 하나의 object로, argument 로써 graphql에 inputdata를 전달하기 위한 용도이다. 즉 사용자의 input 데이터를 하나의 object로 묶어 graphql에 전달함
// ArgsType은 InputType과 비슷하나, 이들을 하나의 object로 묶지 않고 개별적으로 전달해준다

// The isAbstract: true property indicates that SDL (Schema Definition Language statements) shouldn't be generated for this class. 
// Note, you can set this property for other types as well to suppress SDL generation.
@InputType("UserInputType", { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
    @Column({unique: true})
    @Field(type => String)
    @IsEmail()
    email: string

    @Column({ select: false }) // request에 답변보낼 때 password 필드는 명시적으로 요청하지 않는 한 반환해주지 않음
    @Field(type => String)
    @IsString()
    password: string

    @Column(
        {type: "enum", enum: UserRole}
    )
    @Field(type => UserRole)
    @IsEnum(UserRole)
    role: UserRole

    @Column({default: false})
    @Field(type => Boolean)
    @IsBoolean()
    verified: boolean

    @Field(type => [Restaurant])
    @OneToMany(
        type => Restaurant, 
        restaurant => restaurant.owner
    )
    restaurants: Restaurant[]

    @Field(type => [Order])
    @OneToMany(
        type => Order, 
        order => order.customer
    )
    orders: Order[]

    @Field(type => [Payment])
    @OneToMany(
        type => Payment, 
        payment => payment.user
    )
    payments: Payment[]

    @Field(type => [Order])
    @OneToMany(
        type => Order, 
        order => order.driver
    )
    rides: Order[]

    // Use bcrypt module to hash passwords
    @BeforeInsert() // before this entity is saved into database
    @BeforeUpdate() // beforeupdate는 특정 entity를 update해야 부를 수 있음; typeorm의 update()함수는 db로 쿼리를 보낼 뿐이기 때문에 이것이 실행되지 않음 - 그러므로 save()를 사용해서 해결함
    async hashPassword(): Promise<void> {
        if (this.password) { // 중요!: save()에 들어오는 object에 password라는 key값이 있으면 해싱하고 아니면 안함 -> verification프로세스 때문에 필요
            try {
            this.password = await bcrypt.hash(this.password, 10) // how many rounds of hash
            } catch(e) {
                console.log(e)
                throw new InternalServerErrorException();
            }
        }
    }

    async checkPassword(aPassword: string): Promise<boolean> {
        try {
            const ok = await bcrypt.compare(aPassword, this.password)
            return ok
        } catch(error) {
            console.log(error)
            throw new InternalServerErrorException()
        }
    }
}