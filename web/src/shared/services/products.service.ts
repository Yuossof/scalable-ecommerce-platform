import { API_ENDPOINTS } from "@/shared/lib/api/endpoints";
import { mapProduct, mapProducts } from "@/shared/lib/api/mappers";
import { axiosInstanace } from "@/shared/lib/axios";
import { handleApiError } from "@/shared/lib/errors/handleApiError";
import type { Product, RawProduct } from "@/shared/types/api";

interface ProductsResponse {
  data: RawProduct[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  facets?: {
    categories: Record<string, number>;
    prices: Record<string, number>;
  };
  success?: boolean;
}

export interface ShopProductsQuery {
  category?: string;
  price?: string;
  q?: string;
  sort?: "newest" | "price-asc" | "price-desc";
  page?: number;
  limit?: number;
}

export interface ShopProductsCatalog {
  products: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  facets: {
    categories: Record<string, number>;
    prices: Record<string, number>;
  };
}

interface ProductResponse {
  data: RawProduct;
  success?: boolean;
}

/**
 * `GET /products` is paginated but returns neither price/stock nor SKUs, so it
 * is only useful for lightweight listings. Prefer {@link getProductsWithSkus}
 * whenever the UI needs price or stock.
 */
export const getProductsService = async (params?: {
  page?: number;
  limit?: number;
}): Promise<Product[]> => {
  try {
    const res = await axiosInstanace.get<ProductsResponse>(
      API_ENDPOINTS.PRODUCTS.GET,
      { params }
    );
    return mapProducts(res.data.data);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Server-filtered, sorted, and paginated product catalog with SKUs and facet counts.
 */
export const getShopProductsService = async (
  params: ShopProductsQuery
): Promise<ShopProductsCatalog> => {
  try {
    const res = await axiosInstanace.get<ProductsResponse>(
      API_ENDPOINTS.PRODUCTS.GET_WITH_SKUS,
      { params }
    );
    const products = mapProducts(res.data.data);
    return {
      products,
      meta: res.data.meta ?? {
        total: products.length,
        page: params.page ?? 1,
        limit: params.limit ?? (products.length || 12),
        totalPages: 1,
      },
      facets: res.data.facets ?? {
        categories: {},
        prices: {},
      },
    };
  } catch (error) {
    throw handleApiError(error);
  }
};

/** Unfiltered listing of all products with SKUs. */
export const getProductsWithSkusService = async (): Promise<Product[]> => {
  try {
    const res = await axiosInstanace.get<ProductsResponse>(
      API_ENDPOINTS.PRODUCTS.GET_WITH_SKUS
    );
    return mapProducts(res.data.data);
  } catch (error) {
    throw handleApiError(error);
  }
};

/** Single product without SKUs (`GET /products/:productId`). */
export const getProductByIdService = async (
  productId: string
): Promise<Product> => {
  try {
    const res = await axiosInstanace.get<ProductResponse>(
      API_ENDPOINTS.PRODUCTS.GET_ONE(productId)
    );
    return mapProduct(res.data.data);
  } catch (error) {
    throw handleApiError(error);
  }
};
