'use client';

import { useState } from 'react';
import { ShoppingCart, Check, Minus, Plus, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import Spinner from '@/shared/components/customs/spinner';
import { useToast } from '@/shared/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/shared/lib/errors/apiError';
import type { AppDispatch, RootState } from '@/store';
import {
  addCartItem,
  removeCartItem,
  selectCartItemBySku,
  setCartItemQuantity,
} from '@/store/slices/cart-slice-items';

interface ProductActionsProps {
  skuId: string;
  price: number;
  maxQuantity: number;
  onMoreInfo?: () => void;
}

function toMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong';
}

export default function ProductActions({
  skuId,
  price,
  maxQuantity,
  onMoreInfo,
}: ProductActionsProps) {
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();
  const { isAuthenticated } = useAuth();

  const matchedItem = useSelector((state: RootState) => selectCartItemBySku(state, skuId));
  const [isLoading, setIsLoading] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const quantity = matchedItem?.quantity ?? 0;
  const outOfStock = maxQuantity <= 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info('Please sign in to add items to your cart');
      return;
    }
    if (outOfStock) {
      toast.error('This item is out of stock');
      return;
    }
    try {
      setIsLoading(true);
      await dispatch(addCartItem({ product_sku_id: skuId, quantity: 1 })).unwrap();
      toast.success('Added to cart');
    } catch (error) {
      toast.error(toMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const changeQuantity = async (delta: 1 | -1) => {
    if (!matchedItem) return;
    const next = matchedItem.quantity + delta;
    if (delta === 1 && next > maxQuantity) {
      toast.info('No more stock available');
      return;
    }
    try {
      setIsBusy(true);
      await dispatch(
        setCartItemQuantity({
          cartItemId: matchedItem.cart_item_id,
          skuId: matchedItem.sku_id,
          quantity: next,
        })
      ).unwrap();
    } catch (error) {
      toast.error(toMessage(error));
    } finally {
      setIsBusy(false);
    }
  };

  const remove = async () => {
    if (!matchedItem) return;
    try {
      setIsBusy(true);
      await dispatch(removeCartItem(matchedItem.cart_item_id)).unwrap();
    } catch (error) {
      toast.error(toMessage(error));
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-border-primary/30">
      <div className="flex items-baseline gap-3">
        <span className="text-5xl font-black tracking-tighter text-text-primary">
          ${price.toFixed(2)}
        </span>
        <span className="text-[10px] font-mono text-text-muted/60 uppercase tracking-wider">
          inc. tax
        </span>
      </div>

      {!matchedItem && (
        <button
          onClick={handleAddToCart}
          disabled={isLoading || outOfStock}
          className="w-full group relative py-4 px-6 rounded-xl uppercase font-black text-sm tracking-wider overflow-hidden transition-all duration-300 bg-primary text-text-inverted border border-primary hover:shadow-lg hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-center gap-2 relative z-10">
            {isLoading ? (
              <Spinner size={18} className="text-text-inverted" />
            ) : (
              <>
                <ShoppingCart className="w-5 h-5 transition-transform" />
                <span>{outOfStock ? 'Out of stock' : 'Add to cart'}</span>
              </>
            )}
          </div>
        </button>
      )}

      {matchedItem && (
        <div className="flex items-center justify-between gap-3 w-full rounded-xl border border-border-primary/40 bg-bg-secondary/50 px-4 py-3">
          <span className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <Check className="w-4 h-4 text-primary" />
            In cart
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => (quantity === 1 ? remove() : changeQuantity(-1))}
              disabled={isBusy}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-bg-primary border border-border-primary/40 text-text-primary hover:text-red-500 transition-colors disabled:opacity-50"
            >
              {quantity === 1 ? (
                <X className="w-4 h-4" />
              ) : (
                <Minus className="w-4 h-4" />
              )}
            </button>
            <span className="w-8 text-center text-sm font-bold tabular-nums text-text-primary">
              {isBusy ? <Spinner size={14} /> : quantity}
            </span>
            <button
              onClick={() => changeQuantity(1)}
              disabled={isBusy || quantity >= maxQuantity}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-primary text-text-inverted hover:opacity-90 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={onMoreInfo}
        className="w-full py-4 px-6 rounded-xl border border-border-primary/50 text-text-primary hover:border-primary/60 hover:bg-primary/5 uppercase font-semibold text-xs tracking-wider transition-all duration-300 flex items-center justify-center gap-2 group"
      >
        <span>More information</span>
      </button>
    </div>
  );
}
