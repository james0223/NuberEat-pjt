import { Args, Mutation, Resolver, Query, Subscription } from "@nestjs/graphql";
import { PubSub } from "graphql-subscriptions";
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decorator";
import { User } from "src/users/entities/user.entity";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { EditOrderInput, EditOrderOutput } from "./dtos/edit-order.dto";
import { GetOrderInput, GetOrderOutput } from "./dtos/get-order.dto";
import { GetOrdersInput, GetOrdersOutput } from "./dtos/get-orders.dto";
import { Order } from "./entities/order.entity";
import { OrderService } from "./orders.service";

const pubsub = new PubSub()

@Resolver(of => Order)
export class OrderResolver {
    constructor(
        private readonly ordersService: OrderService
    ){}

    @Mutation(returns => CreateOrderOutput)
    @Role(["Client"])
    async createOrder(
        @AuthUser() customer: User,
        @Args("input") createOrderInput: CreateOrderInput
    ): Promise<CreateOrderOutput>{
        return this.ordersService.createOrder(customer, createOrderInput)
    }

    @Query(returns => GetOrdersOutput)
    @Role(["Any"])
    async getOrders(
        @AuthUser() user: User,
        @Args("input") getOrdersInput: GetOrdersInput
    ): Promise<GetOrdersOutput> {
        return this.ordersService.getOrders(user, getOrdersInput)
    }

    @Query(returns => GetOrderOutput)
    @Role(["Any"])
    async getOrder(
        @AuthUser() user: User,
        @Args("input") getOrderInput: GetOrderInput
    ): Promise<GetOrderOutput> {
        return this.ordersService.getOrder(user, getOrderInput)
    }

    @Mutation(returns => EditOrderOutput)
    @Role(["Any"])
    async editOrder(
        @AuthUser() user: User,
        @Args("input") editOrderInput: EditOrderInput
    ): Promise<EditOrderOutput>{
        return this.ordersService.editOrder(user, editOrderInput)
    }


    // graphql의 subscription decorator 에는 이 orderSub 함수가 string을 반환한다고 선언해두었지만 실제로는 asyncIterator을 반환하도록 한다
    // graphql-subscriptions 패키지를 사용한다
    @Subscription(returns => String)
    orderSubscription(){
        // asyncIterator는 인자로 triggers를 받는데, 이것이 바로 우리가 기다리는 이벤트를 가리킨다
        return pubsub.asyncIterator()
    }
}