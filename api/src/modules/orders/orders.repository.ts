import sql from "../../config/db.js";
import { ICartItemWithSku, IOrder, IOrderItem, OrderPaymentStatus } from "./orders.types.js";

export class OrdersRepository {
    async createWithItems(
        userId: string,
        cartId: string,
        subtotal: number,
        discount: number,
        couponCode: string | null,
        cartItems: ICartItemWithSku[]
    ) {
        return sql.begin(async (tx) => {
            const [order] = await tx<IOrder[]>`
                INSERT INTO orders (user_id, subtotal, discount, total, coupon_code)
                VALUES (${userId}, ${subtotal}, ${discount}, ${subtotal - discount}, ${couponCode})
                RETURNING *
            `;

            const itemsToInsert = cartItems.map((item) => ({
                order_id: order.id,
                products_sku_id: item.sku_id,
                quantity: item.quantity,
                unit_price: item.price,
            }));

            const orderItems = await tx<IOrderItem[]>`
                INSERT INTO order_items ${tx(
                itemsToInsert,
                'order_id',
                'products_sku_id',
                'quantity',
                'unit_price'
            )}
                RETURNING *
            `;

            await tx`
                DELETE FROM cart_items WHERE cart_id = ${cartId}
            `;

            return { order, orderItems };
        })
    }

    async findAll(userId: string, orderId: string) {
        const orders = await sql`
          SELECT *
          FROM orders
          WHERE user_id = ${userId}
        `
        return orders
    }

    private async findOrdersWithItems(userId: string, orderId?: string) {
        const orderFilter = orderId ? sql`AND o.id = ${orderId}` : sql``;
        return sql`
            SELECT
             o.id AS order_id,
             o.user_id,
             o.subtotal,
             o.discount,
             o.coupon_code,
             o.total,
             o.status,
             o.payment_status,
             o.created_at,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', oi.id,
                   'products_sku_id', oi.products_sku_id,
                   'product_id', p.id,
                   'product_name', p.name,
                   'sku', ps.sku,
                   'cover', COALESCE(ps.cover, p.cover),
                   'summary', p.summary,
                   'quantity', oi.quantity,
                   'unit_price', oi.unit_price
                 )
                 ORDER BY oi.created_at ASC
               ) FILTER (WHERE oi.id IS NOT NULL), '[]'
             ) AS items
           FROM orders o
           LEFT JOIN order_items oi ON o.id = oi.order_id
           LEFT JOIN products_skus ps ON oi.products_sku_id = ps.id
           LEFT JOIN products p ON ps.product_id = p.id
           WHERE o.user_id = ${userId}
           ${orderFilter}
           GROUP BY o.id
           ORDER BY o.created_at DESC;
         `;
    }

    async findAllByUserId(userId: string) {
        return this.findOrdersWithItems(userId);
    }

    async findByIdAndUserId(userId: string, orderId: string) {
        const [order] = await this.findOrdersWithItems(userId, orderId);
        return order;
    }


    async updatePaymentStatus(status: OrderPaymentStatus, orderId: string) {
        await sql`
          UPDATE orders SET payment_status = ${status} WHERE id = ${orderId}
        `
    }

}
