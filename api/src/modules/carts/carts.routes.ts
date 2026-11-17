import { Router } from "express";
import { isAuthenticated } from "../../middleware/auth/authentication.middleware.js";
import { CartsService } from "./carts.service.js";
import { CartsRepository } from "./carts.repository.js";
import { CartItemsRepository } from "./cart-items.repository.js";
import { CartsController } from "./carts.controller.js";

const router = Router()
const cartsRepo = new CartsRepository()
const cartItemsRepo = new CartItemsRepository()
const cartsService = new CartsService(cartItemsRepo, cartsRepo)
const cartsController = new CartsController(cartsService)

router.post("/", isAuthenticated, cartsController.addItemToCart)
router.get("/", isAuthenticated, cartsController.getCartItems)
router.post("/delete", isAuthenticated, cartsController.deleteCartItem)

export default router