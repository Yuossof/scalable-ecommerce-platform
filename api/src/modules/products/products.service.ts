import { S3StorageService } from "../../services/s3/s3.service.js";
import { ProductsRepository } from "./products.repository.js";
import {
    CreateProductAttributeDTO,
    CreateProductDTO,
    CreateSkuDTO,
    IProduct,
    ISku,
    NormalizedProductListQuery,
    PriceRangeFilter,
    ProductSortOption,
    RawProductListQuery,
} from "./products.types.js";
import { BaseError } from "../../common/errors/base.error.js";
import { client } from "../../config/redis.js";

type CollectionProduct = IProduct & {
    skus?: Array<ISku & { compare_at_price?: string | null }>
}

const COLLECTION_LIMIT = 8
const DEFAULT_SHOP_PAGE_SIZE = 12
const MAX_SHOP_PAGE_SIZE = 100
const VALID_SORT_OPTIONS = new Set<ProductSortOption>(["newest", "price-asc", "price-desc"])

function parsePriceToken(token: string): PriceRangeFilter | null {
    const trimmed = token.trim();
    if (!trimmed) return null;

    const plusMatch = /^(\d+(?:\.\d+)?)\+$/.exec(trimmed);
    if (plusMatch) {
        const min = Number(plusMatch[1]);
        return Number.isFinite(min) ? { min, max: null } : null;
    }

    const rangeMatch = /^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/.exec(trimmed);
    if (rangeMatch) {
        const min = Number(rangeMatch[1]);
        const max = Number(rangeMatch[2]);
        if (Number.isFinite(min) && Number.isFinite(max) && max > min) {
            return { min, max };
        }
    }

    return null;
}

function parseOptionalNonNegativeNumber(value: string | number | undefined): number | undefined {
    if (value === undefined || value === "") return undefined;
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return undefined;
    return parsed;
}

export class ProductsService {
    private productRepository: ProductsRepository
    private s3StorageService: S3StorageService

    constructor(productRepository: ProductsRepository, s3StorageService: S3StorageService) {
        this.productRepository = productRepository
        this.s3StorageService = s3StorageService
    }

    async createProduct(data: CreateProductDTO, images: Express.Multer.File[], cover: Express.Multer.File) {
        if (!cover) {
            throw new BaseError("ProductCoverRequired", 400, true, "A product cover image is required")
        }

        let productImages: string[] = []

        const cover_url = await this.s3StorageService.uploadImage(cover)

        for (const img of images) {
            const url = await this.s3StorageService.uploadImage(img)
            productImages.push(url)
        }

        const product = await this.productRepository.create(data, cover_url, productImages)

        return product
    }

    async listProducts(page: number, limit: number) {
        if (!page || page <= 0) {
            page = 1;
        }

        if (!limit || limit <= 0) {
            limit = 10;
        }

        const offset = (page - 1) * limit
        const products = await this.productRepository.list(limit, offset)
        return products
    }

    async createProductAttribute(data: CreateProductAttributeDTO) {
        return this.productRepository.createAttribute(data)
    }

    async getProduct(productId: string) {
        const cachedProduct = await client.get(`product:${productId}`)

        if (cachedProduct) {
            return JSON.parse(cachedProduct)
        }

        const product = await this.productRepository.getProductById(productId)
        if (!product) {
            throw new BaseError("ProductNotFound", 404, true, "Product not found")
        }

        await client.set(`product:${productId}`, JSON.stringify(product), { EX: 600 })

        return product
    }

    async createSku(data: CreateSkuDTO, images: Express.Multer.File[], cover: Express.Multer.File) {
        if (!cover) {
            throw new BaseError("SkuCoverRequired", 400, true, "A SKU cover image is required")
        }

        const hasEmptyValue = (value: number | string) =>
            typeof value === "string" && value.trim() === ""
        const quantity = Number(data.quantity)
        const price = Number(data.price)

        if (
            hasEmptyValue(data.quantity) ||
            hasEmptyValue(data.price) ||
            !Number.isSafeInteger(quantity) ||
            quantity < 0 ||
            !Number.isFinite(price) ||
            price < 0
        ) {
            throw new BaseError("InvalidSku", 400, true, "SKU quantity and price must be valid non-negative values")
        }

        const compareAtPrice = this.normalizeCompareAtPrice(data.compare_at_price)

        let skuImages: string[] = []

        const cover_url = await this.s3StorageService.uploadImage(cover)

        for (const img of images) {
            const url = await this.s3StorageService.uploadImage(img)
            skuImages.push(url)
        }

        return this.productRepository.createSku(
            { ...data, quantity, price, compare_at_price: compareAtPrice },
            skuImages,
            cover_url
        )
    }

    async listAllWithSkus() {
        return this.productRepository.listAllWithSkus()
    }

    /** Server-side filtering, sorting, pagination, and facet counts for the shop listing. */
    async listCatalogWithSkus(rawQuery: RawProductListQuery = {}) {
        const normalized = this.normalizeCatalogQuery(rawQuery);
        const { total, facets } = await this.productRepository.findCatalogMetaAndFacets(normalized);

        if (normalized.page !== undefined || normalized.limit !== undefined) {
            const limit = normalized.limit ?? DEFAULT_SHOP_PAGE_SIZE;
            const totalPages = Math.max(1, Math.ceil(total / limit));
            const page = Math.min(normalized.page ?? 1, totalPages);
            const offset = (page - 1) * limit;
            const products = await this.productRepository.findCatalogWithSkus(normalized, { limit, offset });

            return {
                products,
                meta: { total, page, limit, totalPages },
                facets,
            };
        }

        const products = await this.productRepository.findCatalogWithSkus(normalized);
        return {
            products,
            meta: {
                total,
                page: 1,
                limit: total || DEFAULT_SHOP_PAGE_SIZE,
                totalPages: 1,
            },
            facets,
        };
    }

    normalizeCatalogQuery(raw: RawProductListQuery): NormalizedProductListQuery {
        const category = raw.category?.trim() || undefined;
        const q = raw.q?.trim() || undefined;
        const sort: ProductSortOption =
            raw.sort && VALID_SORT_OPTIONS.has(raw.sort as ProductSortOption)
                ? (raw.sort as ProductSortOption)
                : "newest";

        const rawPriceTokens = (raw.price ?? "")
            .split(",")
            .map((token) => token.trim())
            .filter(Boolean);
        const priceRanges = rawPriceTokens
            .map(parsePriceToken)
            .filter((range): range is PriceRangeFilter => range !== null);

        const parsedPage = Number(raw.page);
        const page =
            raw.page !== undefined && raw.page !== "" && Number.isFinite(parsedPage) && parsedPage > 0
                ? Math.trunc(parsedPage)
                : undefined;

        const parsedLimit = Number(raw.limit);
        const limit =
            raw.limit !== undefined && raw.limit !== "" && Number.isFinite(parsedLimit) && parsedLimit > 0
                ? Math.min(MAX_SHOP_PAGE_SIZE, Math.trunc(parsedLimit))
                : undefined;

        return {
            category,
            priceRanges,
            hasInvalidPriceFilter: rawPriceTokens.length > 0 && priceRanges.length === 0,
            minPrice: parseOptionalNonNegativeNumber(raw.minPrice),
            maxPrice: parseOptionalNonNegativeNumber(raw.maxPrice),
            q,
            sort,
            page,
            limit,
        };
    }

    /** Products grouped into the homepage discovery sections. */
    async getCollections() {
        const [all, bestSellers] = await Promise.all([
            this.productRepository.listAllWithSkus(),
            this.productRepository.listBestSellers(COLLECTION_LIMIT),
        ]).then(([all, bestSellers]) => [
            all as unknown as CollectionProduct[],
            bestSellers as unknown as CollectionProduct[],
        ] as const)

        return {
            newArrivals: all.slice(0, COLLECTION_LIMIT),
            featured: all.filter((product) => product.is_featured).slice(0, COLLECTION_LIMIT),
            bestSellers,
            specialOffers: all
                .filter((product) =>
                    (product.skus ?? []).some((sku) => {
                        if (sku.compare_at_price === null || sku.compare_at_price === undefined) return false
                        return Number(sku.compare_at_price) > Number(sku.price)
                    })
                )
                .slice(0, COLLECTION_LIMIT),
        }
    }

    async setFeatured(productId: string, isFeatured: boolean) {
        const product = await this.productRepository.setFeatured(productId, isFeatured)
        if (!product) {
            throw new BaseError("ProductNotFound", 404, true, "Product not found")
        }
        return product
    }

    async setCompareAtPrice(skuId: string, value: number | null) {
        const compareAtPrice = this.normalizeCompareAtPrice(value)
        const sku = await this.productRepository.setCompareAtPrice(skuId, compareAtPrice)
        if (!sku) {
            throw new BaseError("SkuNotFound", 404, true, "Product SKU not found")
        }
        return sku
    }

    private normalizeCompareAtPrice(value: number | string | null | undefined): number | null {
        if (value === null || value === undefined || value === "") return null

        const parsed = Number(value)
        if (!Number.isFinite(parsed) || parsed < 0) {
            throw new BaseError("InvalidCompareAtPrice", 400, true, "Comparison price must be a non-negative number")
        }
        return parsed
    }
}
