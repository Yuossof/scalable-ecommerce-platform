import { Router } from "express";
import { isAuthenticated } from "../../middleware/auth/authentication.middleware.js";
import { CartItemsRepository } from "../carts/cart-items.repository.js";
import { CouponsController } from "./coupons.controller.js";
import { CouponsRepository } from "./coupons.repository.js";
import { CouponsService } from "./coupons.service.js";

const router = Router()
const couponsRepository = new CouponsRepository()
const cartItemsRepository = new CartItemsRepository()
const couponsService = new CouponsService(couponsRepository, cartItemsRepository)
const couponsController = new CouponsController(couponsService)

router.post("/apply", isAuthenticated, couponsController.applyCoupon)

export default router
