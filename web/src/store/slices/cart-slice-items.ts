import {
  addToCartService,
  getCartService,
  removeCartItemService,
} from "@/shared/services/cart.service";
import { ApiError } from "@/shared/lib/errors/apiError";
import type { CartItem } from "@/shared/types/api";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/store";

type CartItems = {
  items: CartItem[];
  loading: boolean;
  error: string;
};

const initialState: CartItems = {
  items: [],
  loading: false,
  error: "",
};

function toMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong";
}

/** Loads the authenticated user's cart (requires an active session). */
export const fetchCartItems = createAsyncThunk(
  "cartItems/fetch",
  async (_, thunkAPI) => {
    try {
      return await getCartService();
    } catch (error) {
      return thunkAPI.rejectWithValue(toMessage(error));
    }
  }
);

/**
 * Adds a SKU to the cart and refreshes the cart so the new quantity returned by
 * the backend's `ON CONFLICT` upsert is reflected.
 */
export const addCartItem = createAsyncThunk(
  "cartItems/add",
  async (input: { product_sku_id: string; quantity: number }, thunkAPI) => {
    try {
      await addToCartService(input);
      return await getCartService();
    } catch (error) {
      return thunkAPI.rejectWithValue(toMessage(error));
    }
  }
);

export const removeCartItem = createAsyncThunk(
  "cartItems/remove",
  async (cartItemId: string, thunkAPI) => {
    try {
      await removeCartItemService(cartItemId);
      return await getCartService();
    } catch (error) {
      return thunkAPI.rejectWithValue(toMessage(error));
    }
  }
);

/**
 * There is no set-quantity endpoint, so a quantity change is a delete followed
 * by a re-add with the target quantity.
 */
export const setCartItemQuantity = createAsyncThunk(
  "cartItems/setQuantity",
  async (
    input: { cartItemId: string; skuId: string; quantity: number },
    thunkAPI
  ) => {
    try {
      await removeCartItemService(input.cartItemId);
      if (input.quantity > 0) {
        await addToCartService({
          product_sku_id: input.skuId,
          quantity: input.quantity,
        });
      }
      return await getCartService();
    } catch (error) {
      return thunkAPI.rejectWithValue(toMessage(error));
    }
  }
);

const cartItemsSlice = createSlice({
  name: "cartItems",
  initialState,
  reducers: {
    resetCart: (state) => {
      state.items = [];
      state.error = "";
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchCartItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    for (const thunk of [addCartItem, removeCartItem, setCartItemQuantity]) {
      builder
        .addCase(thunk.pending, (state) => {
          state.loading = true;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.loading = false;
          state.items = action.payload;
        })
        .addCase(thunk.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload as string;
        });
    }
  },
});

export const { resetCart } = cartItemsSlice.actions;

export const selectCartItems = (state: RootState) => state.cartItems.items;
export const selectCartLoading = (state: RootState) => state.cartItems.loading;
export const selectCartError = (state: RootState) => state.cartItems.error;

/** Total number of units in the cart (used for the header badge). */
export const selectCartCount = (state: RootState) =>
  state.cartItems.items.reduce((total, item) => total + item.quantity, 0);

export const selectCartSubtotal = (state: RootState) =>
  state.cartItems.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

/** Finds the cart line for a given SKU, if any. */
export const selectCartItemBySku = (state: RootState, skuId: string) =>
  state.cartItems.items.find((item) => item.sku_id === skuId);

export default cartItemsSlice.reducer;
