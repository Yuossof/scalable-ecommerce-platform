import { API_ENDPOINTS } from "@/shared/lib/api/endpoints";
import { mapProducts } from "@/shared/lib/api/mappers";
import { axiosInstanace } from "@/shared/lib/axios";
import { handleApiError } from "@/shared/lib/errors/handleApiError";
import type { Product, RawProduct } from "@/shared/types/api";

interface FavoritesResponse {
  data: RawProduct[];
}

export const getFavoritesService = async (): Promise<Product[]> => {
  try {
    const res = await axiosInstanace.get<FavoritesResponse>(
      API_ENDPOINTS.FAVORITES.GET
    );
    return mapProducts(res.data.data);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const addFavoriteService = async (productId: string): Promise<void> => {
  try {
    await axiosInstanace.post(API_ENDPOINTS.FAVORITES.ADD, {
      product_id: productId,
    });
  } catch (error) {
    throw handleApiError(error);
  }
};

export const removeFavoriteService = async (productId: string): Promise<void> => {
  try {
    await axiosInstanace.delete(API_ENDPOINTS.FAVORITES.REMOVE(productId));
  } catch (error) {
    throw handleApiError(error);
  }
};
