import { Router } from "express";
import { CategoriesController } from "./categories.controller.js";
import { CategoriesService } from "./categories.service.js";
import { CategoriesRepository } from "./categories.repository.js";
import { isAuthenticated, requireRole } from "../../middleware/auth/authentication.middleware.js";


const router = Router()

const categoriesRepository = new CategoriesRepository()
const categoriesService = new CategoriesService(categoriesRepository)
const categoriesController = new CategoriesController(categoriesService)

router.post("/", isAuthenticated, requireRole("user"), categoriesController.createCategory)
router.get("/", categoriesController.getCategories)
router.put("/:id", isAuthenticated, requireRole("user"), categoriesController.updateCategory)

export default router