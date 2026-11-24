import { NextFunction, Request, Response } from "express";
import { FavoritesService } from "./favorites.service.js";
import { AddFavoriteDTO } from "./favorites.types.js";

export class FavoritesController {
    private favoritesService: FavoritesService

    constructor(favoritesService: FavoritesService) {
        this.favoritesService = favoritesService
    }

    addFavorite = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { product_id } = req.body as AddFavoriteDTO
            const favorite = await this.favoritesService.add(req.user.userId, product_id)
            return res.status(201).json({ data: favorite })
        } catch (error) {
            next(error)
        }
    }

    removeFavorite = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.favoritesService.remove(
                req.user.userId,
                req.params.productId as string
            )
            return res.status(204).send()
        } catch (error) {
            next(error)
        }
    }

    getFavorites = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const favorites = await this.favoritesService.list(req.user.userId)
            return res.status(200).json({ data: favorites })
        } catch (error) {
            next(error)
        }
    }
}
