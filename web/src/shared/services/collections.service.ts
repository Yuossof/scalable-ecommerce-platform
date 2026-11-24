import { API_ENDPOINTS } from "@/shared/lib/api/endpoints";
import { mapProducts } from "@/shared/lib/api/mappers";
import { axiosInstanace } from "@/shared/lib/axios";
import { handleApiError } from "@/shared/lib/errors/handleApiError";
import type { Product, RawProduct } from "@/shared/types/api";

export interface ProductCollections {
  newArrivals: Product[];
  featured: Product[];
  bestSellers: Product[];
  specialOffers: Product[];
}

interface CollectionsResponse {
  data: {
    newArrivals: RawProduct[];
    featured: RawProduct[];
    bestSellers: RawProduct[];
    specialOffers: RawProduct[];
  };
}

export const getCollectionsService = async (): Promise<ProductCollections> => {
  try {
    const res = await axiosInstanace.get<CollectionsResponse>(
      API_ENDPOINTS.PRODUCTS.GET_COLLECTIONS
    );
    return {
      newArrivals: mapProducts(res.data.data.newArrivals),
      featured: mapProducts(res.data.data.featured),
      bestSellers: mapProducts(res.data.data.bestSellers),
      specialOffers: mapProducts(res.data.data.specialOffers),
    };
  } catch (error) {
    throw handleApiError(error);
  }
};
