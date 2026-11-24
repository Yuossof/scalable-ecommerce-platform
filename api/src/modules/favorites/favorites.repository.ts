import sql from "../../config/db.js";
import { FavoriteRecord } from "./favorites.types.js";

export class FavoritesRepository {
    async productExists(productId: string): Promise<boolean> {
        const [product] = await sql`
            SELECT id FROM products
            WHERE id = ${productId} AND deleted_at IS NULL
        `
        return Boolean(product)
    }

    /** INSERT ... ON CONFLICT keeps the operation idempotent and duplicate-free. */
    async add(userId: string, productId: string): Promise<FavoriteRecord | undefined> {
        const [favorite] = await sql<FavoriteRecord[]>`
            INSERT INTO favorites (user_id, product_id)
            VALUES (${userId}, ${productId})
            ON CONFLICT (user_id, product_id) DO NOTHING
            RETURNING id, product_id, created_at
        `
        return favorite
    }

    async remove(userId: string, productId: string): Promise<FavoriteRecord | undefined> {
        const [favorite] = await sql<FavoriteRecord[]>`
            DELETE FROM favorites
            WHERE user_id = ${userId} AND product_id = ${productId}
            RETURNING id, product_id, created_at
        `
        return favorite
    }

    async findProductIds(userId: string): Promise<string[]> {
        const rows = await sql<{ product_id: string }[]>`
            SELECT product_id FROM favorites
            WHERE user_id = ${userId}
            ORDER BY created_at DESC
        `
        return rows.map((row) => row.product_id)
    }

    /** Returns favourite products in the same shape as `GET /products/products-skus`. */
    async listProducts(userId: string) {
        return sql`
            SELECT p.id, p.name, p.description, p.summary, p.cover, p.images,
                   p.category_id, p.created_at, p.is_featured,
                   f.created_at AS favorited_at,
                   COALESCE(
                       json_agg(
                           json_build_object(
                               'id', ps.id,
                               'product_id', ps.product_id,
                               'category_id', p.category_id,
                               'sku', ps.sku,
                               'price', ps.price,
                               'quantity', ps.quantity,
                               'cover', ps.cover,
                               'images', ps.images,
                               'created_at', ps.created_at,
                               'compare_at_price', ps.compare_at_price
                           )
                       ) FILTER (WHERE ps.id IS NOT NULL), '[]'
                   ) AS skus
            FROM favorites f
            INNER JOIN products p ON p.id = f.product_id
            LEFT JOIN products_skus ps ON p.id = ps.product_id
            WHERE f.user_id = ${userId} AND p.deleted_at IS NULL
            GROUP BY p.id, f.created_at
            ORDER BY f.created_at DESC
        `
    }
}
