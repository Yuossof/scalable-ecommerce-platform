"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import ProductCard from "@/features/products/components/product-card";
import ProductCardSkeleton from "@/shared/components/product/product-card-skeleton";
import { useFavorites } from "../hooks/use-favorites";

const FavoritesPage = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { favorites, isLoading, isError, refreshFavorites } = useFavorites(
    isAuthenticated
  );

  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white rounded-2xl border border-border-primary p-10 text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-5">
          <Heart className="w-7 h-7 text-slate-600" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary mb-2">
          Sign in to see your favorites
        </h1>
        <p className="text-text-secondary text-sm mb-8">
          Your saved products are tied to your account.
        </p>
        <Link
          href="/auth/login?redirect=/favorites"
          className="inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
          <Heart className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Favorites</h1>
          <p className="text-sm text-text-secondary">
            Products you saved for later
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <div className="bg-white rounded-2xl border border-red-200 p-10 text-center">
          <p className="text-red-600 mb-4">
            We couldn&apos;t load your favorites. Please try again.
          </p>
          <button
            type="button"
            onClick={() => void refreshFavorites()}
            className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && favorites.length === 0 && (
        <div className="bg-white rounded-2xl border border-border-primary p-10 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-5">
            <ShoppingBag className="w-7 h-7 text-slate-600" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">
            No favorites yet
          </h2>
          <p className="text-text-secondary text-sm mb-8">
            Tap the heart on any product to save it here.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Browse products
          </Link>
        </div>
      )}

      {!isLoading && !isError && favorites.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {favorites.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
