import { Injectable } from "@nestjs/common";
import { Cron, SchedulerRegistry } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Restaurant } from "src/restaurants/entities/restaurant.entity";
import { User } from "src/users/entities/user.entity";
import { LessThan, Repository } from "typeorm";
import { CreatePaymentInput } from "./dtos/create-payment.dto";
import { GetPaymentsOutput } from "./dtos/get-payments.dto";
import { Payment } from "./entities/payment.entity";

@Injectable()
export class PaymentService {
    constructor(
        @InjectRepository(Payment)
        private readonly payments: Repository<Payment>,
        @InjectRepository(Restaurant)
        private readonly restaurants: Repository<Restaurant>,
        private schedulerRegistry: SchedulerRegistry

    ) {}

    async createPayment(owner: User, {transactionId, restaurantId}: CreatePaymentInput) {
        try {
            const restaurant = await this.restaurants.findOne(restaurantId)
            if (!restaurant) {
                return {
                    ok: false,
                    error: "Restaurant not found"
                }
            }
            if (restaurant.ownerId !== owner.id) {
                return {
                    ok: false,
                    error: "You are not allowed to do this"
                }
            }
            await this.payments.save(this.payments.create({
                transactionId,
                user: owner,
                restaurant
            }))
            restaurant.isPromoted = true
            const date = new Date()
            date.setDate(date.getDate() + 7)
            restaurant.promotedUntil = date
            await this.restaurants.save(restaurant)
            return {
                ok: true
            }
        }
        catch {
            return {
                ok: false,
                error: "Could not create payment"
            }
        }
    }

    async getPayments(owner: User): Promise<GetPaymentsOutput> {
        try {
            const payments = await this.payments.find({user: owner})
            return {
                ok: true,
                payments
            }
        }
        catch {
            return {
                ok: false,
                error: "Could not load payments"
            }
        }
    }

    @Cron("30 * * * * *", {
        name: "myJob"
    })
    async checkPromotedRestaurants () {
        const restaurants = await this.restaurants.find({
            isPromoted: true,
            promotedUntil: LessThan(new Date())
        })
        restaurants.forEach(async (restaurant) => {
            restaurant.isPromoted = false,
            restaurant.promotedUntil = null
            await this.restaurants.save(restaurant)
        })
    }
}