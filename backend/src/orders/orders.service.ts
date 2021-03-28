import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PubSub } from "graphql-subscriptions";
import { NEW_COOKED_ORDER, NEW_ORDER_UPDATE, NEW_PENDING_ORDER, PUB_SUB } from "src/common/common.constants";
import { Dish } from "src/restaurants/entities/dish.entity";
import { RestaurantRepository } from "src/restaurants/repositories/restaurant-pagin.repository";
import { User, UserRole } from "src/users/entities/user.entity";
import { Repository } from "typeorm";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { EditOrderInput, EditOrderOutput } from "./dtos/edit-order.dto";
import { GetOrderInput, GetOrderOutput } from "./dtos/get-order.dto";
import { GetOrdersInput, GetOrdersOutput } from "./dtos/get-orders.dto";
import { TakeOrderInput } from "./dtos/take-order.dto";
import { OrderItem, OrderItemOption } from "./entities/order-item.entity";
import { Order, OrderStatus } from "./entities/order.entity";

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private readonly orders: Repository<Order>,
        @InjectRepository(OrderItem)
        private readonly orderItems: Repository<OrderItem>,
        @InjectRepository(Dish)
        private readonly dishes: Repository<Dish>,
        private readonly restaurants: RestaurantRepository,
        @Inject(PUB_SUB) private readonly pubSub: PubSub
    ) {}

    async createOrder(
        customer: User, 
        {restaurantId, items}: CreateOrderInput): Promise<CreateOrderOutput> {
        try {
            // 1. 주문이 들어갈 레스토랑을 찾는다
            const restaurant = await this.restaurants.findOne(restaurantId)
            if (!restaurant){
                return {
                    ok: false,
                    error: "Restaurant not found"
                }
            }
            let orderFinalPrice = 0
            const orderItems: OrderItem[] = []
            // forEach는 내부에서 return해도 상위의 함수가 종료되는 것이 아니기 때문에 for of loop을 활용한다
            // 2. Order에 들어있는 dish를 모두 찾는다
            for (const item of items){
                const dish = await this.dishes.findOne(item.dishId)
                if (!dish) {
                    return {
                        ok: false,
                        error: "Dish not found"
                    }
                }
                let dishFinalPrice = dish.price
                // 3. Dish별 option을 찾는다
                for (const itemOption of item.options){
                    const dishOption = dish.options.find(dishOption => dishOption.name === itemOption.name)
                    if (dishOption){
                        // 추가비용이 있는지 찾기
                        if (dishOption.extra) {
                            console.log(`${dishOption.name}의 ${dishOption.choices}로 인해 금액 ${dishOption.extra}가 추가됨`)
                            dishFinalPrice += dishOption.extra
                        } else {
                            const dishOptionChoice = dishOption.choices.find(optionChoice => optionChoice.name === itemOption.choice)
                            if (dishOptionChoice) {
                                if (dishOptionChoice.extra) {
                                    console.log(`${dishOption.name}의 ${dishOptionChoice.name}로 인해 금액 ${dishOptionChoice.extra}가 추가됨`)
                                    dishFinalPrice += dishOptionChoice.extra
                                }
                            }
                        }
                    }
                }
                orderFinalPrice += dishFinalPrice
                const orderItem = await this.orderItems.save(
                    this.orderItems.create({
                        dish,
                        options: item.options
                    })
                )
                orderItems.push(orderItem)
            }
            // console.log(`결제하실 금액은 ${orderFinalPrice}입니다`)
            const order = await this.orders.save(this.orders.create({
                customer,
                restaurant,
                total: orderFinalPrice,
                items: orderItems
            }))
            // order 생성 후, listen을 위해 pubsub 실행
            await this.pubSub.publish(NEW_PENDING_ORDER, {
                pendingOrders: {order, ownerId: restaurant.ownerId }
            })
            return {
                ok: true
            }
        } catch (e){
            return {
                ok: false,
                error: "Could not create order"
            }
        }
    }

    async getOrders(user: User, {status}: GetOrdersInput): Promise<GetOrdersOutput> {
        try {
            // 유저가 누구냐에 따라 다른 정보를 보여줘야 함
            let orders: Order[]
            if (user.role === UserRole.Client) {
                orders = await this.orders.find({
                    // status 가 undefined일 때 보내면 에러 발생
                    where: {
                        customer: user,
                        ...(status && {status}) // object에 property를 조건부로 넣는 방법
                    }
                })
            } else if (user.role === UserRole.Delivery) {
                orders = await this.orders.find({
                    where: {
                        driver: user,
                        ...(status && {status})
                    }
                })
            } else if (user.role === UserRole.Owner) {
                // owner는 여러 레스토랑을 가지므로 조금 까다롭다
                const restaurants = await this.restaurants.find({
                    where: {
                        owner: user
                    },
                    relations: ["orders"]
                })
                orders = restaurants.map(restaurant => restaurant.orders).flat(1) // flat(n)은 array 내부의 array들을 n차원만큼 재귀적으로 밖으로 빼낸다
                if (status) {
                    // map은 매 item들이 특정 함수를 거친 정제된 값들로 변환된 새로운 array를 만들어내고, filter는 기존 array를 유지하면서 조건을 만족하지 못하는 것들을 빼낸다
                    orders = orders.filter(order => order.status === status)
                }
            }
            return {
                ok: true,
                orders: orders
            }
        } catch {
            return {
                ok: false,
                error: "Could not get orders"
            } 
        }
    }

    canSeeOrder(user: User, order: Order): boolean {
        let isAuthorized = true
        if (user.role === UserRole.Client && order.customerId !== user.id) {
            isAuthorized = false
        }
        if (user.role === UserRole.Delivery && order.driverId !== user.id) {
            isAuthorized = false
        }
        if (user.role === UserRole.Owner && order.restaurant.ownerId !== user.id) {
            isAuthorized = false
        }
        return isAuthorized
    }

    async getOrder(user: User, {id: orderId}: GetOrderInput): Promise<GetOrderOutput> {
        try {
            const order = await this.orders.findOne(orderId, {relations: ["restaurant"]})
            if (!order) {
                return {
                    ok: false,
                    error: "Order not found"
                }
            }
            if (!this.canSeeOrder(user, order)) {
                return {
                    ok: false,
                    error: "You can't see that"
                }
            }
            return {
                ok: true,
                order: order
            }
        } catch {
            return {
                ok: false,
                error: "Could not get order"
            }
        }
    }

    async editOrder(user: User, {id: orderId, status}: EditOrderInput): Promise<EditOrderOutput> {
        try {
            const order = await this.orders.findOne(orderId, {relations: ["restaurant"]})
            if (!order) {
                return {
                    ok: false,
                    error: "Order not found"
                }
            }
            if (!this.canSeeOrder(user, order)) {
                return {
                    ok: false,
                    error: "You can't do that"
                }
            }
            let canEdit = true
            if (user.role === UserRole.Client) {
                canEdit = false
            } else if (user.role === UserRole.Owner) {
                if (status !== OrderStatus.Cooking && status !== OrderStatus.Cooked) {
                    canEdit = false
                }
            } else if (user.role === UserRole.Delivery) {
                if (status !== OrderStatus.PickedUp && status !== OrderStatus.Delivered) {
                    canEdit = false
                }
            }
            if (!canEdit) {
                return {
                    ok: false,
                    error: "You can't do that"
                }
            }
            // createOrder때와는 다르다! 새로운 것을 create하고 save하면 새로 생성된 entity 전체를 return하지만, 기존의 것을 update하기 위한 save는 entity의 모든 정보를 return하지 않는다
            await this.orders.save({
                id: orderId,
                status
            })
            const newOrder = { ...order, status }
            // Driver에게 보낼 조리 완료된 Order
            if (user.role === UserRole.Owner) {
                if (status === OrderStatus.Cooked){
                    await this.pubSub.publish(NEW_COOKED_ORDER, {
                        // 그러므로 위에서 찾은 order에 status값만을 갱신해서 보내준다
                        cookedOrders: newOrder
                    })
                }
            }
            // 음식의 상태변화에 따라 모두에게 보내질 Order
            await this.pubSub.publish(NEW_ORDER_UPDATE, {
                orderUpdates: newOrder
            })
            return {
                ok: true
            }
        } catch {
            return {
                ok: false,
                error: "Could not edit order"
            }
        }
    }

    async takeOrder(driver: User, {id: orderId}: TakeOrderInput){
        try {
            const order = await this.orders.findOne(orderId)
            if (!order) {
                return {
                    ok: false,
                    error: "Order not found"
                }
            }
            if (order.driver) {
                return {
                    ok: false,
                    error: "This order already has a driver"
                }
            }
            await this.orders.save({
                id: orderId,
                driver
            })
            await this.pubSub.publish(NEW_ORDER_UPDATE, {
                orderUpdate: { ...order, driver}
            })
            return {
                ok: true
            }
        }
        catch {
            return {
                ok: false,
                error: "Could not update order"
            }
        }
    }
}