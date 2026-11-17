import { getCategoriesService } from "@/shared/services/categories.service";
import { ApiError } from "@/shared/lib/errors/apiError";
import type { Category } from "@/shared/types/api";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";

/** The backend category shape (no `image_url` column exists). */
export type Categories = Category;

type ShopCategoryState = {
  items: Category[];
  selectedCategoryId: string | null;
  categoryResolved: boolean;
  loading: boolean;
  error: string;
};

const initialState: ShopCategoryState = {
  items: [],
  selectedCategoryId: null,
  categoryResolved: false,
  loading: false,
  error: "",
};

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (_, thunkAPI) => {
    try {
      return await getCategoriesService();
    } catch (error) {
      if (error instanceof ApiError) {
        return thunkAPI.rejectWithValue(error.message);
      }

      return thunkAPI.rejectWithValue("Something went wrong");
    }
  }
);

const shopCategorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    selectCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategoryId = action.payload;
      state.categoryResolved = true;
    },
    unSelectCategory: (state) => {
      state.selectedCategoryId = "";
    },
    addItems: (state, action: PayloadAction<Category[]>) => {
      state.items = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { selectCategory, unSelectCategory, addItems } =
  shopCategorySlice.actions;
export default shopCategorySlice.reducer;
