import { API_ENDPOINTS } from "@/shared/lib/api/endpoints";
import { mapOrder, mapOrders } from "@/shared/lib/api/mappers";
import { axiosInstanace } from "@/shared/lib/axios";
import { handleApiError } from "@/shared/lib/errors/handleApiError";
import type { Order, RawOrder } from "@/shared/types/api";

interface OrdersResponse {
  data: RawOrder[];
}

interface OrderResponse {
  data: RawOrder;
}

/**
 * `POST /orders` ignores the request body: it reads the authenticated user's
 * cart, computes totals server-side and creates the Stripe PaymentIntent. The
 * client must never send a total.
 */
export interface CreateOrderResult {
  order: Order;
  clientSecret: string;
}

export const createOrderService = async (
  couponCode?: string
): Promise<CreateOrderResult> => {
  try {
    const res = await axiosInstanace.post<{
      data: { order: RawOrder; clientSecret: string };
    }>(API_ENDPOINTS.ORDERS.CREATE, couponCode ? { coupon_code: couponCode } : {});
    return {
      order: mapOrder(res.data.data.order),
      clientSecret: res.data.data.clientSecret,
    };
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getOrdersService = async (): Promise<Order[]> => {
  try {
    const res = await axiosInstanace.get<OrdersResponse>(
      API_ENDPOINTS.ORDERS.GET
    );
    return mapOrders(res.data.data);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getOrderByIdService = async (
  orderId: string
): Promise<Order> => {
  try {
    const res = await axiosInstanace.get<OrderResponse>(
      API_ENDPOINTS.ORDERS.GET_ONE(orderId)
    );
    return mapOrder(res.data.data);
  } catch (error) {
    throw handleApiError(error);
  }
};
