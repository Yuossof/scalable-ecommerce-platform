import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { BaseError } from "../../common/errors/base.error.js";
import { CategoriesService } from "./categories.service.js";
import type { CreateCategoryDTO, UpdateCategoryDTO } from "./categories.types.js";

const mockFile = {
    originalname: "electronics.png",
    mimetype: "image/png",
    buffer: Buffer.from("fake-image"),
} as Express.Multer.File;

describe("CategoriesService", () => {
    it("uploads category image to S3 under categories folder on create", async () => {
        const uploadCalls: Array<{ file: Express.Multer.File; folder?: string }> = [];
        let createdPayload: { data: CreateCategoryDTO; imageUrl?: string | null } | undefined;

        const repository = {
            findByName: async () => undefined,
            createCategory: async (data: CreateCategoryDTO, imageUrl?: string | null) => {
                createdPayload = { data, imageUrl };
                return { id: "cat-1", ...data, image: imageUrl ?? null };
            },
        };
        const storage = {
            uploadImage: async (file: Express.Multer.File, folder?: string) => {
                uploadCalls.push({ file, folder });
                return "https://cdn.example.com/categories/uuid-1";
            },
        };

        const service = new CategoriesService(repository as never, storage as never);
        const result = await service.create(
            { name: "Electronics", slug: "electronics", description: "Devices and gadgets" },
            mockFile
        );

        assert.equal(uploadCalls.length, 1);
        assert.equal(uploadCalls[0]?.folder, "categories");
        assert.equal(createdPayload?.imageUrl, "https://cdn.example.com/categories/uuid-1");
        assert.equal(result.image, "https://cdn.example.com/categories/uuid-1");
    });

    it("creates a category with null image when no file is provided", async () => {
        let uploadCalled = false;
        let createdImageUrl: string | null | undefined;

        const repository = {
            findByName: async () => undefined,
            createCategory: async (data: CreateCategoryDTO, imageUrl?: string | null) => {
                createdImageUrl = imageUrl;
                return { id: "cat-1", ...data, image: imageUrl ?? null };
            },
        };
        const storage = {
            uploadImage: async () => {
                uploadCalled = true;
                return "https://cdn.example.com/categories/unused";
            },
        };

        const service = new CategoriesService(repository as never, storage as never);
        const result = await service.create({
            name: "Books",
            slug: "books",
            description: "Printed and digital books",
        });

        assert.equal(uploadCalled, false);
        assert.equal(createdImageUrl, null);
        assert.equal(result.image, null);
    });

    it("rejects duplicate category before uploading image to S3", async () => {
        let uploadCalled = false;

        const repository = {
            findByName: async () => ({ id: "existing-1" }),
        };
        const storage = {
            uploadImage: async () => {
                uploadCalled = true;
                return "https://cdn.example.com/categories/unused";
            },
        };

        const service = new CategoriesService(repository as never, storage as never);

        await assert.rejects(
            service.create(
                { name: "Electronics", slug: "electronics", description: "Devices" },
                mockFile
            ),
            (error: BaseError) =>
                error.name === "CategoryAlreadyExists" && error.statusCode === 409
        );
        assert.equal(uploadCalled, false);
    });

    it("rejects missing required fields before uploading image", async () => {
        let uploadCalled = false;

        const service = new CategoriesService({} as never, {
            uploadImage: async () => {
                uploadCalled = true;
                return "";
            },
        } as never);

        await assert.rejects(
            service.create({ name: "", slug: "s", description: "d" }, mockFile),
            (error: BaseError) => error.name === "InvalidCategory" && error.statusCode === 400
        );
        assert.equal(uploadCalled, false);
    });

    it("uploads replacement image on update and preserves image when omitted", async () => {
        const updateCalls: Array<{ id: string; data: UpdateCategoryDTO; imageUrl?: string | null }> = [];
        const uploadFolders: Array<string | undefined> = [];

        const repository = {
            findById: async (id: string) => ({ id, name: "Old", image: "https://cdn.example.com/categories/old" }),
            update: async (id: string, data: UpdateCategoryDTO, imageUrl?: string | null) => {
                updateCalls.push({ id, data, imageUrl });
                return { id, ...data, image: imageUrl ?? "https://cdn.example.com/categories/old" };
            },
        };
        const storage = {
            uploadImage: async (_file: Express.Multer.File, folder?: string) => {
                uploadFolders.push(folder);
                return "https://cdn.example.com/categories/new";
            },
        };

        const service = new CategoriesService(repository as never, storage as never);

        await service.update(
            { name: "Updated", slug: "updated", description: "Updated desc" },
            "cat-1",
            mockFile
        );
        await service.update(
            { name: "Updated 2", slug: "updated-2", description: "Updated desc 2" },
            "cat-1"
        );

        assert.deepEqual(uploadFolders, ["categories"]);
        assert.equal(updateCalls[0]?.imageUrl, "https://cdn.example.com/categories/new");
        assert.equal(updateCalls[1]?.imageUrl, undefined);
    });

    it("throws CategoryNotFound on update without uploading if category does not exist", async () => {
        let uploadCalled = false;

        const repository = {
            findById: async () => undefined,
        };
        const storage = {
            uploadImage: async () => {
                uploadCalled = true;
                return "https://cdn.example.com/categories/unused";
            },
        };

        const service = new CategoriesService(repository as never, storage as never);

        await assert.rejects(
            service.update(
                { name: "Updated", slug: "updated", description: "Desc" },
                "missing-id",
                mockFile
            ),
            (error: BaseError) => error.name === "CategoryNotFound" && error.statusCode === 404
        );
        assert.equal(uploadCalled, false);
    });

    it("updates only the category image via updateImage", async () => {
        let updatedArgs: { id: string; imageUrl: string } | undefined;

        const repository = {
            findById: async (id: string) => ({ id }),
            updateImage: async (id: string, imageUrl: string) => {
                updatedArgs = { id, imageUrl };
                return { id, image: imageUrl };
            },
        };
        const storage = {
            uploadImage: async (_file: Express.Multer.File, folder?: string) =>
                `https://cdn.example.com/${folder}/cat-img`,
        };

        const service = new CategoriesService(repository as never, storage as never);
        const result = await service.updateImage("cat-1", mockFile);

        assert.deepEqual(updatedArgs, {
            id: "cat-1",
            imageUrl: "https://cdn.example.com/categories/cat-img",
        });
        assert.equal(result.image, "https://cdn.example.com/categories/cat-img");

        await assert.rejects(
            service.updateImage("cat-1", undefined),
            (error: BaseError) =>
                error.name === "CategoryImageRequired" && error.statusCode === 400
        );
    });
});
