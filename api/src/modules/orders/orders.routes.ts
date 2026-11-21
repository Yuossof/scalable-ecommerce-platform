import { Router } from "express";
import { OrdersRepository } from "./orders.repository.js";
import { OrdersService } from "./orders.service.js";
import { CartItemsRepository } from "../carts/cart-items.repository.js";
import { OrdersController } from "./orders.controller.js";
import { isAuthenticated } from "../../middleware/auth/authentication.middleware.js";
import { PaymentsService } from "../payment/payments.service.js";

const router = Router()

const orderRepository = new OrdersRepository()
const cartItemsRepository = new CartItemsRepository()
const paymentsService = new PaymentsService()
const orderService = new OrdersService(orderRepository, cartItemsRepository, paymentsService)
const orderController = new OrdersController(orderService)

router.post("/", isAuthenticated, orderController.createOrder)
router.get("/", isAuthenticated, orderController.getOrders)
router.get("/:orderId", isAuthenticated, orderController.getOrder)

export default router