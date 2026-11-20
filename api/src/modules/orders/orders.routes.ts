import { Router } from "express";
import { OrdersRepository } from "./orders.repository.js";
import { OrdersService } from "./orders.service.js";
import { CartItemsRepository } from "../carts/cart-items.repository.js";
import { OrdersController } from "./orders.controller.js";
import { isAuthenticated } from "../../middleware/auth/authentication.middleware.js";
import { PaymentsService } from "../payment/payments.service.js";
import { PaymentsRepository } from "../payment/payments.repository.js";
import { InventoryRepository } from "../products/inventory.repository.js";
import { AuthRepository } from "../auth/auth.repository.js";

const router = Router()

const orderRepository = new OrdersRepository()
const cartItemsRepository = new CartItemsRepository()
const inventoryRepo = new InventoryRepository()
const paymentsRepo = new PaymentsRepository(inventoryRepo)
const authRepository = new AuthRepository()
const paymentsService = new PaymentsService(paymentsRepo, authRepository)
const orderService = new OrdersService(orderRepository, cartItemsRepository, paymentsService)
const orderController = new OrdersController(orderService)

router.post("/", isAuthenticated, orderController.createOrder)
router.get("/", isAuthenticated, orderController.getOrders)
router.get("/:orderId", isAuthenticated, orderController.getOrder)

export default router