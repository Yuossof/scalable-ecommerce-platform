import { Router } from "express";
import { isAuthenticated } from "../../middleware/auth/authentication.middleware.js";
import { FavoritesController } from "./favorites.controller.js";
import { FavoritesRepository } from "./favorites.repository.js";
import { FavoritesService } from "./favorites.service.js";

const router = Router()
const favoritesRepository = new FavoritesRepository()
const favoritesService = new FavoritesService(favoritesRepository)
const favoritesController = new FavoritesController(favoritesService)

router.get("/", isAuthenticated, favoritesController.getFavorites)
router.post("/", isAuthenticated, favoritesController.addFavorite)
router.delete("/:productId", isAuthenticated, favoritesController.removeFavorite)

export default router
