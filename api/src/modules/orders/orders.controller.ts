import { NextFunction, Request, Response } from "express";
import { OrdersService } from "./orders.service.js";

export class OrdersController {
    private orderService: OrdersService
    constructor(orderService: OrdersService) {
        this.orderService = orderService
    }

    createOrder = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const couponCode = (req.body as { coupon_code?: string } | undefined)?.coupon_code
            const { order, clientSecret } = await this.orderService.create(
                req.user.userId,
                couponCode
            )
            return res.status(201).json({
                data: {
                    order,
                    clientSecret: clientSecret
                },
            })
        } catch (error) {
            next(error)
        }
    }

    getOrders = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const orders = await this.orderService.getOrders(req.user.userId)
            return res.status(200).json({
                data: orders
            })
        } catch (error) {
            next(error)
        }
    }

    getOrder = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const orderId = req.params["orderId"] as string
            const userId = req.user.userId
            const order = await this.orderService.getOrder(userId, orderId)
            if (!order) {
                return res.status(404).json({ success: false, message: "Order not found" })
            }
            return res.status(200).json({
                data: order
            })
        } catch (error) {
            next(error)
        }
    }

    updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
        try {
        } catch (error) {
            next(error)
        }
    }

}
