import { CreateCategoryDTO, UpdateCategoryDTO } from "./categories.types.js";
import { BaseError } from "../../common/errors/base.error.js";
import { CategoriesRepository } from "./categories.repository.js";
import { S3StorageService } from "../../services/s3/s3.service.js";

export class CategoriesService {
    private repository: CategoriesRepository
    private s3StorageService: S3StorageService

    constructor(repository: CategoriesRepository, s3StorageService: S3StorageService) {
        this.repository = repository
        this.s3StorageService = s3StorageService
    }

    async create(data: CreateCategoryDTO, image?: Express.Multer.File) {
        if (!data?.name || !data?.slug || !data?.description) {
            throw new BaseError(
                "InvalidCategory",
                400,
                true,
                "Category name, slug, and description are required"
            )
        }

        const category = await this.repository.findByName(data.name)

        if (category) {
            throw new BaseError(
                "CategoryAlreadyExists",
                409,
                true,
                "A category with this name already exists"
            )
        }

        const imageUrl = image
            ? await this.s3StorageService.uploadImage(image, "categories")
            : (data.image ?? null)

        const newCategory = await this.repository.createCategory(data, imageUrl)

        return newCategory
    }

    async listAll() {
        const categories = await this.repository.findAll()
        return categories
    }


    async update(data: UpdateCategoryDTO, id: string, image?: Express.Multer.File) {
        const existingCategory = await this.repository.findById(id)
        if (!existingCategory) {
            throw new BaseError("CategoryNotFound", 404, true, "Category not found")
        }

        const imageUrl = image
            ? await this.s3StorageService.uploadImage(image, "categories")
            : data.image

        const updatedCategory = await this.repository.update(id, data, imageUrl);

        if (!updatedCategory) {
            throw new BaseError("CategoryNotFound", 404, true, "Category not found")
        }

        return updatedCategory
    }

    async updateImage(id: string, image?: Express.Multer.File) {
        if (!image) {
            throw new BaseError("CategoryImageRequired", 400, true, "A category image is required")
        }

        const existingCategory = await this.repository.findById(id)
        if (!existingCategory) {
            throw new BaseError("CategoryNotFound", 404, true, "Category not found")
        }

        const imageUrl = await this.s3StorageService.uploadImage(image, "categories")
        const updatedCategory = await this.repository.updateImage(id, imageUrl)

        if (!updatedCategory) {
            throw new BaseError("CategoryNotFound", 404, true, "Category not found")
        }

        return updatedCategory
    }
}