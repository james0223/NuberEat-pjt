import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateOrderOutput } from "./dtos/create-order.dto";
import { Order } from "./entities/order.entity";

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private readonly orders: Repository<Order>
    ) {}

    async createOrder(): Promise<CreateOrderOutput> {
        try {

        } catch (e){
            return {
                ok: false,
                error: "Could not create Order"
            }
        }
    }
}