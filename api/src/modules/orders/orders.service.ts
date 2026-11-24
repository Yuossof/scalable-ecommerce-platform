import { CartItemsRepository } from "../carts/cart-items.repository.js";
import { OrdersRepository } from "./orders.repository.js";
import { PaymentsService } from "../payment/payments.service.js";
import { BaseError } from "../../common/errors/base.error.js";
import {
  calculateCartSubtotal,
  CouponsService,
} from "../coupons/coupons.service.js";

export class OrdersService {
    private orderRepository: OrdersRepository
    private cartItemsRepository: CartItemsRepository
    private paymentsService: PaymentsService
    private couponsService: CouponsService

    constructor(
        orderRepo: OrdersRepository,
        cartItemsRepository: CartItemsRepository,
        paymentsService: PaymentsService,
        couponsService: CouponsService,
    ) {
        this.orderRepository = orderRepo
        this.cartItemsRepository = cartItemsRepository
        this.paymentsService = paymentsService
        this.couponsService = couponsService
    }

    async create(userId: string, couponCode?: string) {
        const cartItems = await this.cartItemsRepository.getCartItems(userId)

        if (!cartItems || cartItems.length === 0) {
            throw new BaseError(
                "EmptyCart",
                400,
                true,
                "Cannot create order from an empty cart"
            );
        }

        const subtotal = calculateCartSubtotal(cartItems)

        // Coupon codes are re-validated here: a preview shown earlier is never
        // trusted, and totals are always recalculated from the current cart.
        const applied = couponCode
            ? await this.couponsService.applyToSubtotal(couponCode, subtotal)
            : null
        const discount = applied?.discount ?? 0
        const cartId = cartItems[0].cart_id;

        const { order, orderItems } = await this.orderRepository.createWithItems(
            userId,
            cartId,
            subtotal,
            discount,
            applied?.code ?? null,
            cartItems
        )

        const { clientSecret } = await this.paymentsService.createPaymentIntent(
            order.id,
            Number(order.total),
            userId
        )

        return {
            order: {
                ...order,
                orderItems
            },
            clientSecret
        }
    }

    async getOrders(userId: string) {
        return this.orderRepository.findAllByUserId(userId)
    }

    async getOrder(userId: string, orderId: string) {
        return this.orderRepository.findByIdAndUserId(userId, orderId)
    }

    async updateOrderStatus(orderId: string, status: string) {

    }

}
