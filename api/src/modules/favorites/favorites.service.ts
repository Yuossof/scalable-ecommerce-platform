import { BaseError } from "../../common/errors/base.error.js";
import { FavoritesRepository } from "./favorites.repository.js";

export class FavoritesService {
    private favoritesRepository: FavoritesRepository

    constructor(favoritesRepository: FavoritesRepository) {
        this.favoritesRepository = favoritesRepository
    }

    async add(userId: string, productId: string) {
        if (!productId) {
            throw new BaseError("ProductIdRequired", 400, true, "A product id is required")
        }

        if (!(await this.favoritesRepository.productExists(productId))) {
            throw new BaseError("ProductNotFound", 404, true, "Product not found")
        }

        // Re-adding an existing favourite is a successful no-op for the client.
        await this.favoritesRepository.add(userId, productId)
        return { product_id: productId, is_favorite: true }
    }

    async remove(userId: string, productId: string) {
        const removed = await this.favoritesRepository.remove(userId, productId)
        if (!removed) {
            throw new BaseError("FavoriteNotFound", 404, true, "Favorite not found")
        }
    }

    async list(userId: string) {
        return this.favoritesRepository.listProducts(userId)
    }
}
