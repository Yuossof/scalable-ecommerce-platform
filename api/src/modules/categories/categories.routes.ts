import { Router } from "express";
import { CategoriesController } from "./categories.controller.js";
import { CategoriesService } from "./categories.service.js";
import { CategoriesRepository } from "./categories.repository.js";
import { S3StorageService } from "../../services/s3/s3.service.js";
import { upload } from "../../utils/multer.utils.js";
import { isAuthenticated, requireRole } from "../../middleware/auth/authentication.middleware.js";


const router = Router()

const categoriesRepository = new CategoriesRepository()
const s3StorageService = new S3StorageService()
const categoriesService = new CategoriesService(categoriesRepository, s3StorageService)
const categoriesController = new CategoriesController(categoriesService)

router.post("/", isAuthenticated, requireRole("user"), upload.single("image"), categoriesController.createCategory)
router.get("/", categoriesController.getCategories)
router.put("/:id", isAuthenticated, requireRole("user"), upload.single("image"), categoriesController.updateCategory)
router.patch("/:id/image", isAuthenticated, requireRole("user"), upload.single("image"), categoriesController.updateCategoryImage)

export default router