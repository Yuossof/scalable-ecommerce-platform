export interface CreateCategoryDTO {
    name: string;
    slug: string;
    description: string;
    image?: string | null;
}

export interface UpdateCategoryDTO {
    name: string;
    slug: string;
    description: string;
    image?: string | null;
}

export interface CreateSubCategoryDTO {
    parent_id: string;
    name: string;
    slug: string;
    description: string;
    image?: string | null;
}


export interface UpdateSubCategoryDTO {
    parent_id: string;
    name: string;
    slug: string;
    description: string;
    image?: string | null;
}