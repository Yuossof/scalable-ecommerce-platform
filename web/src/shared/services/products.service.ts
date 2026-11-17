import { API_ENDPOINTS } from "@/shared/lib/api/endpoints";
import { mapProduct, mapProducts } from "@/shared/lib/api/mappers";
import { axiosInstanace } from "@/shared/lib/axios";
import { handleApiError } from "@/shared/lib/errors/handleApiError";
import type { Product, RawProduct } from "@/shared/types/api";

interface ProductsResponse {
  data: RawProduct[];
  success?: boolean;
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
 * `GET /products/products-skus` returns every product together with its SKUs
 * (price, stock, cover, images). It is the only listing source that carries
 * price/stock, and it is not paginated — filter/sort/paginate client-side.
 */
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
