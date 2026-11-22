import { Router } from "express"
import { upload } from "../../utils/multer.utils.js"
import { ProductsService } from "./products.service.js";
import { ProductsController } from "./products.controller.js";
import { ProductsRepository } from "./products.repository.js";
import { S3StorageService } from "../../services/s3/s3.service.js";
import { isAuthenticated, requireRole } from "../../middleware/auth/authentication.middleware.js";

const router = Router()

const productsRepo = new ProductsRepository()
const storageService = new S3StorageService()
const productsService = new ProductsService(productsRepo, storageService)
const productsController = new ProductsController(productsService)

// Create product
router.post(
    "/",
    isAuthenticated,
    requireRole("user"),
    upload.fields([
        { name: "images", maxCount: 15 },
        { name: "cover", maxCount: 1 },
    ]),
    productsController.createProduct
)

// Create sku
router.post(
    "/skus",
    isAuthenticated,
    requireRole("user"),
    upload.fields([
        { name: "images", maxCount: 15 },
        { name: "cover", maxCount: 1 },
    ]),
    productsController.createSku
)

router.post("/product-attributes", isAuthenticated, requireRole("user"), productsController.createProductAttribute)

router.get("/products-skus", productsController.getProductsWithSkus)
router.get("/", productsController.getProducts)
router.get("/:productId", productsController.getProduct)

export default router