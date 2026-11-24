import sql from "../../config/db.js";
import { CreateProductAttributeDTO, CreateProductDTO, CreateSkuDTO, IProduct, ISku } from "./products.types.js";

export class ProductsRepository {
    async create(
        data: CreateProductDTO,
        cover_url: string,
        productImages: string[]
    ): Promise<{ product: IProduct }> {
        const [product] = await sql<IProduct[]>`
            INSERT INTO products (name, description, summary, cover, category_id, images)
            VALUES (${data.name}, ${data.description}, ${data.summary}, ${cover_url}, ${data.category_id}, ${productImages})
            RETURNING id, name, description, summary, cover, category_id, images
        `
        return { product }
    }

    async list(limit: number, offset: number) {
        const products = await sql`
          SELECT * FROM products WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
        `;

        return products
    }

    async listAllWithSkus() {
        const products = await sql`
          SELECT p.id, p.name, p.description, p.summary, p.cover, p.images,
                 p.category_id, p.created_at, p.is_featured,
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
           FROM products p
           LEFT JOIN products_skus ps ON p.id = ps.product_id
           WHERE p.deleted_at IS NULL
           GROUP BY p.id
           ORDER BY p.created_at DESC;
        `

        return products
    }

    /**
     * Popularity comes from real order history (`order_items`), not a hardcoded
     * ranking. Only products with at least one sold unit are returned.
     */
    async listBestSellers(limit: number) {
        return sql`
          SELECT p.id, p.name, p.description, p.summary, p.cover, p.images,
                 p.category_id, p.created_at, p.is_featured,
                 SUM(oi.quantity) AS units_sold,
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
           FROM products p
           INNER JOIN products_skus ps ON p.id = ps.product_id
           INNER JOIN order_items oi ON oi.products_sku_id = ps.id
           WHERE p.deleted_at IS NULL
           GROUP BY p.id
           ORDER BY units_sold DESC, p.created_at DESC
           LIMIT ${limit};
        `
    }

    async createAttribute(data: CreateProductAttributeDTO) {
        const [attribute] = await sql`
           INSERT INTO product_attributes (type, value)
           VALUES (${data.type}, ${data.value})
           RETURNING *
        `

        return attribute
    }


    async getProductById(productId: string) {
        const [product] = await sql<IProduct[]>`
        SELECT p.id, p.name, p.description, p.summary, p.cover, p.images,
               p.category_id, p.created_at, p.is_featured,
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
          ) as skus
          FROM
          products p
          LEFT JOIN products_skus ps ON p.id = ps.product_id
          WHERE p.id = ${productId} AND p.deleted_at IS NULL
          GROUP BY p.id
        `
        return product
    }

    async createSku(data: CreateSkuDTO, images: string[], cover: string) {
        const [sku] = await sql<ISku[]>`
          INSERT INTO products_skus (product_id, sku, quantity, price, cover, images, compare_at_price)
          VALUES (
           ${data.product_id},
           ${data.sku},
           ${data.quantity},
           ${data.price},
           ${cover},
           ${images},
           ${data.compare_at_price ?? null}
          )
           RETURNING *
        `

        return sku
    }

    async setFeatured(productId: string, isFeatured: boolean) {
        const [product] = await sql`
          UPDATE products SET is_featured = ${isFeatured}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${productId} AND deleted_at IS NULL
          RETURNING id, is_featured
        `
        return product
    }

    async setCompareAtPrice(skuId: string, compareAtPrice: number | null) {
        const [sku] = await sql`
          UPDATE products_skus SET compare_at_price = ${compareAtPrice}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${skuId}
          RETURNING id, compare_at_price
        `
        return sku
    }
}
