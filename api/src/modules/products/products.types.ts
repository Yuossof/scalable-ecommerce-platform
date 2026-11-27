export interface CreateProductDTO {
    name: string;
    description: string;
    summary: string;
    category_id: string;
}

// Product skus
export interface CreateSkuDTO {
    product_id: string;
    sku: string;
    price: number | string;
    attributes_ids: string[],
    quantity: number | string;
    compare_at_price?: number | string | null;
}

export interface IProduct {
    id: string
    name: string;
    description: string;
    summary: string;
    cover: string;
    images: string[];
    category_id: string;
    created_at: string;
    is_featured?: boolean;
    skus?: ISku[];
}

export interface ISku {
    id: string;
    product_id?: string;
    sku: string;
    price: string;
    quantity: number;
    cover: string;
    images: string[];
    category_id: string;
    created_at: string;
    compare_at_price?: string | null;
}

export interface CreateProductAttributeDTO {
    type: string;
    value: string;
}

export interface IProductAttribute {
    id: string;
    type: string;
    value: string;
    created_at: string;
}

export type ProductSortOption = "newest" | "price-asc" | "price-desc";

export interface PriceRangeFilter {
    min: number;
    max: number | null;
}

export interface RawProductListQuery {
    category?: string;
    price?: string;
    minPrice?: string | number;
    maxPrice?: string | number;
    q?: string;
    sort?: string;
    page?: string | number;
    limit?: string | number;
}

export interface NormalizedProductListQuery {
    category?: string;
    priceRanges: PriceRangeFilter[];
    hasInvalidPriceFilter: boolean;
    minPrice?: number;
    maxPrice?: number;
    q?: string;
    sort: ProductSortOption;
    page?: number;
    limit?: number;
}

export interface ProductListMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ProductListFacets {
    categories: Record<string, number>;
    prices: Record<string, number>;
}
