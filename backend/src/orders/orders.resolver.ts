import { Inject } from "@nestjs/common";
import { Args, Mutation, Resolver, Query, Subscription } from "@nestjs/graphql";
import { PubSub } from "graphql-subscriptions";
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decorator";
import { NEW_COOKED_ORDER, NEW_ORDER_UPDATE, NEW_PENDING_ORDER, PUB_SUB } from "src/common/common.constants";
import { User } from "src/users/entities/user.entity";
import { CreateOrderInput, CreateOrderOutput } from "./dtos/create-order.dto";
import { EditOrderInput, EditOrderOutput } from "./dtos/edit-order.dto";
import { GetOrderInput, GetOrderOutput } from "./dtos/get-order.dto";
import { GetOrdersInput, GetOrdersOutput } from "./dtos/get-orders.dto";
import { OrderUpdatesInput } from "./dtos/order-update.dto";
import { TakeOrderInput, TakeOrderOutput } from "./dtos/take-order.dto";
import { Order } from "./entities/order.entity";
import { OrderService } from "./orders.service";

@Resolver(of => Order)
export class OrderResolver {
    constructor(
        private readonly ordersService: OrderService,
        @Inject(PUB_SUB) private readonly pubSub: PubSub 
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

    // @Mutation(returns => Boolean)
    // async activateTrigger(
    //     @Args("inputId") inputId: number
    // ) {
    //     await this.pubSub.publish("TriggerName", {
    //         orderSubscription: inputId // 이것이 filter의 payload object의 value부분이 된다
    //     })
    //     return true
    // }


    // graphql의 subscription decorator 에는 이 orderSub 함수가 string을 반환한다고 선언해두었지만 실제로는 asyncIterator을 반환하도록 한다
    // graphql-subscriptions 패키지를 사용한다
    @Subscription(returns => Order, {
        // filter는 현재 listen하는 사용자가 update 알림을 받아야하는지 말아야하는지를 결정한다 (true/false)
        // 여기서는 order가 새로 생성된 restaurant가 context.User의 restaurant인지 체크할 것
        filter: (payload, variables, context)=> {
            // payload - publish되는 triggername의 value 부분
            // variables - listen이 시작되기 전에 subscription에 준 varialbes를 가진 object - 즉 resolver의 argument를 의미
            // context - token, user 등등 graphql의 context 부분
            const { pendingOrders: { ownerId } } = payload 
            const { user } = context 
            return ownerId === user.id
        },
        // resolve - 사용자가 받는 update 알림의 형태를 정의함
        resolve: ({pendingOrders: {order}}) => order
    })
    @Role(["Owner"])
    pendingOrders(){
        // asyncIterator는 인자로 triggers를 받는데, 이것이 바로 우리가 기다리는 이벤트를 가리킨다
        return this.pubSub.asyncIterator(NEW_PENDING_ORDER) // Trigger은 반드시 string이어야 함
    }

    @Subscription(returns => Order)
    @Role(["Delivery"])
    cookedOrders(){
        return this.pubSub.asyncIterator(NEW_COOKED_ORDER)
    }

    @Subscription(returns => Order, {
        filter: ({ orderUpdates : order }: { orderUpdates: Order },
            { input }: { input: OrderUpdatesInput }, 
            { user }: { user: User }
            ) => {
            if (order.driverId !== user.id && order.customerId !== user.id && order.restaurant.ownerId !== user.id) {
                return false
            }
            return order.id === input.id
        }
    })
    @Role(["Any"])
    orderUpdates(
        @Args("input") orderUpdatesInput: OrderUpdatesInput
    ){
        return this.pubSub.asyncIterator(NEW_ORDER_UPDATE)
    }

    @Mutation(returns=> TakeOrderOutput)
    @Role(["Delivery"])
    takeOrder(
        @AuthUser() driver : User,
        @Args("input") takeOrderInput: TakeOrderInput
    ): Promise<TakeOrderOutput> {
        return this.ordersService.takeOrder(driver, takeOrderInput)
    }
}