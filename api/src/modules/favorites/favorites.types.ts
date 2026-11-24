export interface AddFavoriteDTO {
    product_id: string;
}

export interface FavoriteRecord {
    id: string;
    product_id: string;
    created_at: string;
}
