import sql from "../../config/db.js";
import {
    CreateProductAttributeDTO,
    CreateProductDTO,
    CreateSkuDTO,
    IProduct,
    ISku,
    NormalizedProductListQuery,
    ProductListFacets,
} from "./products.types.js";

function escapeLikePattern(value: string): string {
    return value.replace(/[!%_]/g, "!$&");
}

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

    private buildCatalogWhereFragments(filters: NormalizedProductListQuery) {
        const categoryCondition = filters.category
            ? sql`AND (category_slug = ${filters.category} OR category_id::text = ${filters.category})`
            : sql``;

        const queryCondition = filters.q
            ? (() => {
                const pattern = `%${escapeLikePattern(filters.q)}%`;
                return sql`AND (
                    name ILIKE ${pattern} ESCAPE '!'
                    OR COALESCE(summary, '') ILIKE ${pattern} ESCAPE '!'
                    OR COALESCE(description, '') ILIKE ${pattern} ESCAPE '!'
                )`;
            })()
            : sql``;

        const rangeCondition = filters.priceRanges.length > 0
            ? (() => {
                const parts = filters.priceRanges.map((range) =>
                    range.max === null
                        ? sql`min_price >= ${range.min}`
                        : sql`(min_price >= ${range.min} AND min_price < ${range.max})`
                );
                let combined = parts[0];
                for (let i = 1; i < parts.length; i++) {
                    combined = sql`${combined} OR ${parts[i]}`;
                }
                return sql`AND (${combined})`;
            })()
            : filters.hasInvalidPriceFilter
                ? sql`AND FALSE`
                : sql``;

        const minBoundCondition = filters.minPrice !== undefined
            ? sql`AND min_price >= ${filters.minPrice}`
            : sql``;

        const maxBoundCondition = filters.maxPrice !== undefined
            ? sql`AND min_price <= ${filters.maxPrice}`
            : sql``;

        const priceCondition = sql`${rangeCondition} ${minBoundCondition} ${maxBoundCondition}`;

        return { categoryCondition, queryCondition, priceCondition };
    }

    private buildProductBaseCte() {
        return sql`
          product_base AS (
            SELECT p.id, p.name, p.description, p.summary, p.cover, p.images,
                   p.category_id, c.slug AS category_slug, p.created_at, p.is_featured,
                   COALESCE(MIN(ps.price), 0) AS min_price,
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
            LEFT JOIN categories c ON c.id = p.category_id
            LEFT JOIN products_skus ps ON p.id = ps.product_id
            WHERE p.deleted_at IS NULL
            GROUP BY p.id, c.slug
          )
        `;
    }

    async findCatalogMetaAndFacets(
        filters: NormalizedProductListQuery
    ): Promise<{ total: number; facets: ProductListFacets }> {
        const cte = this.buildProductBaseCte();
        const { categoryCondition, queryCondition, priceCondition } =
            this.buildCatalogWhereFragments(filters);

        const [countRows, categoryRows, priceRows] = await Promise.all([
            sql<{ total: number }[]>`
              WITH ${cte}
              SELECT COUNT(*)::int AS total
              FROM product_base
              WHERE TRUE ${categoryCondition} ${queryCondition} ${priceCondition}
            `,
            sql<{ category_slug: string | null; count: number }[]>`
              WITH ${cte}
              SELECT category_slug, COUNT(*)::int AS count
              FROM product_base
              WHERE TRUE ${queryCondition} ${priceCondition}
              GROUP BY category_slug
            `,
            sql<{
                bucket_0_100: number;
                bucket_100_300: number;
                bucket_300_500: number;
                bucket_500_1000: number;
                bucket_1000_plus: number;
            }[]>`
              WITH ${cte}
              SELECT
                COUNT(*) FILTER (WHERE min_price >= 0 AND min_price < 100)::int AS bucket_0_100,
                COUNT(*) FILTER (WHERE min_price >= 100 AND min_price < 300)::int AS bucket_100_300,
                COUNT(*) FILTER (WHERE min_price >= 300 AND min_price < 500)::int AS bucket_300_500,
                COUNT(*) FILTER (WHERE min_price >= 500 AND min_price < 1000)::int AS bucket_500_1000,
                COUNT(*) FILTER (WHERE min_price >= 1000)::int AS bucket_1000_plus
              FROM product_base
              WHERE TRUE ${categoryCondition} ${queryCondition}
            `,
        ]);

        const categories: Record<string, number> = {};
        for (const row of categoryRows) {
            if (row.category_slug) {
                categories[row.category_slug] = row.count;
            }
        }

        const bucket = priceRows[0];
        const prices: Record<string, number> = {
            "0-100": bucket?.bucket_0_100 ?? 0,
            "100-300": bucket?.bucket_100_300 ?? 0,
            "300-500": bucket?.bucket_300_500 ?? 0,
            "500-1000": bucket?.bucket_500_1000 ?? 0,
            "1000+": bucket?.bucket_1000_plus ?? 0,
        };

        return {
            total: countRows[0]?.total ?? 0,
            facets: { categories, prices },
        };
    }

    async findCatalogWithSkus(
        filters: NormalizedProductListQuery,
        pagination?: { limit: number; offset: number }
    ) {
        const cte = this.buildProductBaseCte();
        const { categoryCondition, queryCondition, priceCondition } =
            this.buildCatalogWhereFragments(filters);

        const orderByClause =
            filters.sort === "price-asc"
                ? sql`ORDER BY min_price ASC, created_at DESC`
                : filters.sort === "price-desc"
                    ? sql`ORDER BY min_price DESC, created_at DESC`
                    : sql`ORDER BY created_at DESC`;

        const limitClause = pagination
            ? sql`LIMIT ${pagination.limit} OFFSET ${pagination.offset}`
            : sql``;

        return sql`
          WITH ${cte}
          SELECT id, name, description, summary, cover, images,
                 category_id, created_at, is_featured, skus
          FROM product_base
          WHERE TRUE ${categoryCondition} ${queryCondition} ${priceCondition}
          ${orderByClause}
          ${limitClause}
        `;
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
