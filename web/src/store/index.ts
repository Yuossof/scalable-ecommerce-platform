import { configureStore } from "@reduxjs/toolkit"
import categoryReducer from "./slices/shop-category-slice"
import cartItemsReducer from "./slices/cart-slice-items"

export const store = configureStore({
  reducer: {
    categories: categoryReducer,
    cartItems: cartItemsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
