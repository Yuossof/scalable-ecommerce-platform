import sql from "../../config/db.js";
import { CreateCategoryDTO, UpdateCategoryDTO } from "./categories.types.js";

export class CategoriesRepository {
    async findByName(categoryName: string) {
        const [existingCategory] = await sql`
          SELECT id FROM categories WHERE name = ${categoryName} LIMIT 1
        `;

        return existingCategory
    }

    async findById(id: string) {
        const [category] = await sql`
          SELECT id, name, slug, description, parent_id, image, created_at, updated_at
          FROM categories
          WHERE id = ${id} AND deleted_at IS NULL
          LIMIT 1
        `;

        return category
    }

    async createCategory(data: CreateCategoryDTO, imageUrl?: string | null) {
        const [newCategory] = await sql`
         INSERT INTO categories (name, slug, description, image) 
         VALUES (${data.name}, ${data.slug}, ${data.description}, ${imageUrl ?? null})
         RETURNING id, name, slug, description, parent_id, image, created_at
        `;

        return newCategory
    }

    async findAll() {
        const categories = await sql`
          SELECT * FROM categories
        `;

        return categories
    }

    async update(id: string, data: UpdateCategoryDTO, imageUrl?: string | null) {
        const shouldUpdateImage = imageUrl !== undefined;
        const [category] = await sql`
          UPDATE categories
          SET name = ${data.name},
              description = ${data.description},
              slug = ${data.slug},
              image = CASE WHEN ${shouldUpdateImage} THEN ${imageUrl ?? null} ELSE image END,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
          RETURNING id, name, slug, description, parent_id, image, created_at, updated_at
        `;

        return category
    }

    async updateImage(id: string, imageUrl: string) {
        const [category] = await sql`
          UPDATE categories
          SET image = ${imageUrl},
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
          RETURNING id, name, slug, description, parent_id, image, created_at, updated_at
        `;

        return category
    }
}