import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { BaseError } from "../../common/errors/base.error.js";
import { ProductsService } from "./products.service.js";
import type { NormalizedProductListQuery } from "./products.types.js";

const skuData = {
    product_id: "product-1",
    sku: "SKU-1",
    attributes_ids: [],
};

const createService = (
    createSku: (data: typeof skuData & {
        quantity: number | string;
        price: number | string;
        compare_at_price?: number | null;
    }) => Promise<unknown>
) => {
    const repository = {
        createSku,
    };
    const storage = {
        uploadImage: async () => "https://example.com/image.jpg",
    };

    return new ProductsService(repository as never, storage as never);
};

describe("ProductsService.createSku", () => {
    it("normalizes multipart quantity and price values before persistence", async () => {
        let receivedData: typeof skuData & { quantity: number | string; price: number | string } | undefined;
        const service = createService(async (data) => {
            receivedData = data;
            return data;
        });

        await service.createSku(
            { ...skuData, quantity: "10", price: "12.50" },
            [],
            {} as Express.Multer.File
        );

        assert.deepEqual(receivedData, {
            ...skuData,
            quantity: 10,
            price: 12.5,
            compare_at_price: null,
        });
    });

    it("rejects invalid or unsafe SKU values", async () => {
        const service = createService(async (data) => data);

        for (const data of [
            { quantity: "-1", price: "10" },
            { quantity: "1.5", price: "10" },
            { quantity: "10", price: "not-a-number" },
            { quantity: "10", price: "Infinity" },
            { quantity: "", price: "10" },
            { quantity: "10", price: " " },
        ]) {
            await assert.rejects(
                service.createSku({ ...skuData, ...data }, [], {} as Express.Multer.File),
                (error: BaseError) =>
                    error.name === "InvalidSku" && error.statusCode === 400
            );
        }
    });
});

describe("ProductsService.listCatalogWithSkus", () => {
    it("normalizes category, price ranges, search, sort, and pagination bounds", () => {
        const service = new ProductsService({} as never, {} as never);

        const normalized = service.normalizeCatalogQuery({
            category: " laptops ",
            price: "0-100, 1000+, invalid",
            minPrice: "10",
            maxPrice: "1500",
            q: "  macbook  ",
            sort: "price-asc",
            page: "2",
            limit: "500",
        });

        assert.deepEqual(normalized, {
            category: "laptops",
            priceRanges: [
                { min: 0, max: 100 },
                { min: 1000, max: null },
            ],
            hasInvalidPriceFilter: false,
            minPrice: 10,
            maxPrice: 1500,
            q: "macbook",
            sort: "price-asc",
            page: 2,
            limit: 100,
        });

        const invalidSortAndPrice = service.normalizeCatalogQuery({
            price: "bad-range",
            sort: "unknown",
        });
        assert.equal(invalidSortAndPrice.sort, "newest");
        assert.equal(invalidSortAndPrice.hasInvalidPriceFilter, true);
    });

    it("clamps requested page to totalPages and forwards server filters and facets", async () => {
        let receivedFilters: NormalizedProductListQuery | undefined;
        let receivedPagination: { limit: number; offset: number } | undefined;

        const repository = {
            findCatalogMetaAndFacets: async (filters: NormalizedProductListQuery) => {
                receivedFilters = filters;
                return {
                    total: 15,
                    facets: {
                        categories: { laptops: 10, phones: 5 },
                        prices: { "0-100": 3, "100-300": 12, "300-500": 0, "500-1000": 0, "1000+": 0 },
                    },
                };
            },
            findCatalogWithSkus: async (
                _filters: NormalizedProductListQuery,
                pagination?: { limit: number; offset: number }
            ) => {
                receivedPagination = pagination;
                return [{ id: "prod-1", name: "Laptop" }];
            },
        };

        const service = new ProductsService(repository as never, {} as never);
        const result = await service.listCatalogWithSkus({
            category: "laptops",
            price: "100-300",
            sort: "price-desc",
            page: "5",
            limit: "12",
        });

        assert.equal(receivedFilters?.category, "laptops");
        assert.equal(receivedFilters?.sort, "price-desc");
        assert.deepEqual(receivedPagination, { limit: 12, offset: 12 });
        assert.deepEqual(result.meta, {
            total: 15,
            page: 2,
            limit: 12,
            totalPages: 2,
        });
        assert.equal(result.facets.categories.laptops, 10);
        assert.equal(result.products.length, 1);
    });
});
