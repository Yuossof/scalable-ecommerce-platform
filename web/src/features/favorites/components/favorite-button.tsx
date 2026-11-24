"use client";

import { Heart, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/shared/hooks/use-toast";
import { ApiError } from "@/shared/lib/errors/apiError";
import { useFavorites } from "../hooks/use-favorites";

interface FavoriteButtonProps {
  productId: string;
  className?: string;
  /** Compact variant for product cards; defaults to a labeled button. */
  compact?: boolean;
}

export default function FavoriteButton({
  productId,
  className = "",
  compact = false,
}: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites(isAuthenticated);
  const toast = useToast();
  const [pending, setPending] = useState(false);

  const favorite = isFavorite(productId);

  const handleClick = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      toast.info("Sign in to save products to your favorites");
      return;
    }
    if (pending) return;

    setPending(true);
    try {
      await toggleFavorite(productId);
      toast.success(favorite ? "Removed from favorites" : "Added to favorites");
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Could not update favorites"
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={favorite}
      title={favorite ? "Remove from favorites" : "Add to favorites"}
      className={`inline-flex items-center justify-center gap-2 rounded-full transition-colors disabled:opacity-60 ${
        compact
          ? "w-9 h-9 bg-bg-primary/90 border border-border-primary hover:border-accent"
          : "px-4 py-2.5 border border-border-primary hover:border-accent text-sm font-medium"
      } ${className}`}
    >
      {pending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Heart
          className={`w-5 h-5 transition-colors ${
            favorite ? "fill-red-500 text-red-500" : "text-text-secondary"
          }`}
        />
      )}
      {!compact && <span>{favorite ? "Saved" : "Save"}</span>}
    </button>
  );
}
