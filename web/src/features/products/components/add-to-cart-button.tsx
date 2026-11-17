"use client";

import { Minus, Plus, X } from "lucide-react";
import React, { useState } from "react";
import Spinner from "@/shared/components/customs/spinner";
import { useToast } from "@/shared/hooks/use-toast";
import { ApiError } from "@/shared/lib/errors/apiError";
import {
  addCartItem,
  removeCartItem,
  selectCartItemBySku,
  setCartItemQuantity,
} from "@/store/slices/cart-slice-items";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, type RootState } from "@/store";
import { useAuth } from "@/hooks/useAuth";

type TProps = {
  skuId: string;
  /** Available stock for this SKU; the quantity is capped at this value. */
  maxQuantity: number;
};

function toMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong";
}

const AddToCartButton = ({ skuId, maxQuantity }: TProps) => {
  const { isAuthenticated } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const toast = useToast();

  const matchedItem = useSelector((state: RootState) =>
    selectCartItemBySku(state, skuId)
  );

  const [incLoading, setIncLoading] = useState(false);
  const [decLoading, setDecLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isMatch = Boolean(matchedItem);
  const quantity = matchedItem?.quantity ?? 0;
  const outOfStock = maxQuantity <= 0;
  const atMax = quantity >= maxQuantity;

  // ---------------- ADD TO CART ----------------

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.info("Please sign in to add items to your cart");
      return;
    }

    if (outOfStock) {
      toast.error("This item is out of stock");
      return;
    }

    try {
      setIsLoading(true);
      await dispatch(addCartItem({ product_sku_id: skuId, quantity: 1 })).unwrap();
      toast.success("Added to cart");
    } catch (error) {
      toast.error(toMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------- UPDATE QUANTITY ----------------

  const updateQuantity = async (status: "inc" | "dec") => {
    if (!matchedItem) return;

    const newQuantity =
      status === "inc" ? matchedItem.quantity + 1 : matchedItem.quantity - 1;

    if (status === "inc" && newQuantity > maxQuantity) {
      toast.info("No more stock available");
      return;
    }

    try {
      if (status === "inc") setIncLoading(true);
      else setDecLoading(true);

      await dispatch(
        setCartItemQuantity({
          cartItemId: matchedItem.cart_item_id,
          skuId: matchedItem.sku_id,
          quantity: newQuantity,
        })
      ).unwrap();
    } catch (error) {
      toast.error(toMessage(error));
    } finally {
      setIncLoading(false);
      setDecLoading(false);
    }
  };

  // ---------------- DELETE ITEM ----------------

  const handleDeleteCartItem = async () => {
    if (!matchedItem) return;
    try {
      await dispatch(removeCartItem(matchedItem.cart_item_id)).unwrap();
    } catch (error) {
      toast.error(toMessage(error));
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* ADD BUTTON */}
      {!isMatch && (
        <button
          onClick={handleAddToCart}
          disabled={isLoading || outOfStock}
          className="group h-10 px-4 cursor-pointer flex items-center justify-center gap-2 bg-black text-white rounded-full shadow-md hover:shadow-lg hover:bg-zinc-800 active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Spinner size={18} />
          ) : (
            <>
              <Plus className="w-4 h-4 transition-transform duration-300" />
              <span className="text-sm font-medium">
                {outOfStock ? "Sold out" : "Add"}
              </span>
            </>
          )}
        </button>
      )}

      {/* QUANTITY CONTROLS */}
      {isMatch && (
        <div className="flex items-center  p-1 rounded-full backdrop-blur-sm border border-gray-200/50 ">
          {/* DECREASE / DELETE */}
          <button
            onClick={() => {
              if (quantity === 1) {
                handleDeleteCartItem();
              } else {
                updateQuantity("dec");
              }
            }}
            disabled={decLoading || quantity === 0}
            className="w-8 h-8 flex items-center cursor-pointer justify-center rounded-full bg-white border-slate-100 border text-gray-600 hover:text-red-500 hover:shadow-md active:scale-90 transition-all disabled:opacity-50"
          >
            {decLoading ? (
              <Spinner size={14} />
            ) : quantity === 1 ? (
              <X className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
          </button>

          {/* QUANTITY DISPLAY */}
          <span className="w-8 text-center text-sm font-bold text-gray-800 tabular-nums">
            {quantity}
          </span>

          {/* INCREASE */}
          <button
            onClick={() => updateQuantity("inc")}
            disabled={incLoading || atMax}
            className="w-8 h-8 flex items-center cursor-pointer justify-center rounded-full bg-black text-white shadow-sm hover:bg-zinc-800 hover:shadow-md active:scale-90 transition-all disabled:opacity-50"
          >
            {incLoading ? (
              <Spinner size={14} className="text-white" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default AddToCartButton;
