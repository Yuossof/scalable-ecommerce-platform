import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import categoryRoutes from "../modules/categories/categories.routes.js"
import productRoutes from "../modules/products/products.routes.js"
import orderRoutes from "../modules/orders/orders.routes.js"
import cartRoutes from "../modules/carts/carts.routes.js"
import addressRoutes from "../modules/addresses/addresses.routes.js"
import favoriteRoutes from "../modules/favorites/favorites.routes.js"
import couponRoutes from "../modules/coupons/coupons.routes.js"
import webhookRoutes from "../modules/webhooks/webhooks.routes.js"

const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes)
router.use("/products", productRoutes)
router.use("/orders", orderRoutes)
router.use("/carts", cartRoutes)
router.use("/addresses", addressRoutes)
router.use("/favorites", favoriteRoutes)
router.use("/coupons", couponRoutes)

router.use("/webhooks", webhookRoutes);

export default router;
