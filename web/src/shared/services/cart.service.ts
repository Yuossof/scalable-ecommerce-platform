import { API_ENDPOINTS } from "@/shared/lib/api/endpoints";
import { mapCartItems } from "@/shared/lib/api/mappers";
import { axiosInstanace } from "@/shared/lib/axios";
import { handleApiError } from "@/shared/lib/errors/handleApiError";
import type { CartItem, RawCartItem } from "@/shared/types/api";

interface CartResponse {
  data: RawCartItem[];
}

interface MessageResponse {
  success?: boolean;
  message: string;
}

/** `GET /carts` — the authenticated user's cart items (keyed by `cart_item_id`). */
export const getCartService = async (): Promise<CartItem[]> => {
  try {
    const res = await axiosInstanace.get<CartResponse>(API_ENDPOINTS.CART.GET);
    return mapCartItems(res.data.data);
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * `POST /carts` — adds a SKU to the cart. The backend uses
 * `INSERT ... ON CONFLICT DO UPDATE` so re-posting the same SKU increments the
 * existing line only when the request carries the incrementing quantity.
 */
export const addToCartService = async (input: {
  product_sku_id: string;
  quantity: number;
}): Promise<string> => {
  try {
    const res = await axiosInstanace.post<MessageResponse>(
      API_ENDPOINTS.CART.ADD,
      input
    );
    return res.data.message;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * `POST /carts/delete` — removes a cart line by its `cart_item_id`. There is no
 * set-quantity endpoint, so quantity changes are implemented as a delete
 * followed by a re-add of the resulting quantity (see the cart slice).
 */
export const removeCartItemService = async (
  cartItemId: string
): Promise<string> => {
  try {
    const res = await axiosInstanace.post<MessageResponse>(
      API_ENDPOINTS.CART.DELETE,
      { cartItemId }
    );
    return res.data.message;
  } catch (error) {
    throw handleApiError(error);
  }
};
