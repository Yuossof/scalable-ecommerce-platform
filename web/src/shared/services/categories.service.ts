import { API_ENDPOINTS } from "@/shared/lib/api/endpoints";
import { mapCategory } from "@/shared/lib/api/mappers";
import { axiosInstanace } from "@/shared/lib/axios";
import { handleApiError } from "@/shared/lib/errors/handleApiError";
import type { Category } from "@/shared/types/api";

interface CategoriesResponse {
  data: Category[];
}

export const getCategoriesService = async (): Promise<Category[]> => {
  try {
    const res = await axiosInstanace.get<CategoriesResponse>(
      API_ENDPOINTS.CATEGORIES.GET
    );
    return (res.data.data ?? []).map(mapCategory);
  } catch (error) {
    throw handleApiError(error);
  }
};
