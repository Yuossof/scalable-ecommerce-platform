import { NextFunction, Request, Response } from "express";
import { ProductsService } from "./products.service.js";
import { CreateProductAttributeDTO, CreateSkuDTO } from "./products.types.js";

export class ProductsController {
  private productService: ProductsService

  constructor(productService: ProductsService) {
    this.productService = productService
  }

  createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as {
        images?: Express.Multer.File[];
        cover?: Express.Multer.File[];
      };

      const images = files.images ?? [];
      const cover = files.cover?.[0] as Express.Multer.File

      const data = req.body

      const product = await this.productService.createProduct(data, images, cover)

      res.status(200).json({ data: product, success: true })

    } catch (error) {
      next(error)
    }
  }

  getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let page = Number(req.query.page)
      let limit = Number(req.query.limit)

      const products = await this.productService.listProducts(page, limit)

      return res.status(200).json({ data: products, success: true })
    } catch (error) {
      next(error)
    }
  }

  getProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const productId = req.params.productId as string
      const product = await this.productService.getProduct(productId)
      return res.status(200).json({
        data: product
      })

    } catch (error) {
      next(error)
    }
  }

  getProductsWithSkus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.productService.listCatalogWithSkus({
        category: typeof req.query.category === "string" ? req.query.category : undefined,
        price: typeof req.query.price === "string" ? req.query.price : undefined,
        minPrice: typeof req.query.minPrice === "string" ? req.query.minPrice : undefined,
        maxPrice: typeof req.query.maxPrice === "string" ? req.query.maxPrice : undefined,
        q: typeof req.query.q === "string" ? req.query.q : undefined,
        sort: typeof req.query.sort === "string" ? req.query.sort : undefined,
        page: typeof req.query.page === "string" ? req.query.page : undefined,
        limit: typeof req.query.limit === "string" ? req.query.limit : undefined,
      })
      return res.status(200).json({
        data: result.products,
        meta: result.meta,
        facets: result.facets,
      })
    } catch (error) {
      next(error)
    }
  }

  getCollections = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const collections = await this.productService.getCollections()
      return res.status(200).json({ data: collections })
    } catch (error) {
      next(error)
    }
  }

  setFeatured = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const product = await this.productService.setFeatured(
        req.params.productId as string,
        Boolean(req.body?.is_featured)
      )
      return res.status(200).json({ data: product })
    } catch (error) {
      next(error)
    }
  }

  setCompareAtPrice = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const value = req.body?.compare_at_price
      const sku = await this.productService.setCompareAtPrice(
        req.params.skuId as string,
        value === null || value === "" ? null : Number(value)
      )
      return res.status(200).json({ data: sku })
    } catch (error) {
      next(error)
    }
  }

  createProductAttribute = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as CreateProductAttributeDTO
      const attribute = await this.productService.createProductAttribute(data)

      return res.status(201).json({ data: attribute, success: true })
    } catch (error) {
      next(error)
    }
  }

  createSku = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const files = req.files as {
        images?: Express.Multer.File[];
        cover?: Express.Multer.File[];
      };

      const images = files.images ?? [];
      const cover = files.cover?.[0] as Express.Multer.File

      const data = req.body as CreateSkuDTO
      const sku = await this.productService.createSku(data, images, cover)
      return res.status(201).json({
        data: sku,
        message: "Product sku created"
      })
    } catch (error) {
      next(error)
    }
  }
}
