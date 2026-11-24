import { NextFunction, Request, Response } from "express";
import { CouponsService } from "./coupons.service.js";

export class CouponsController {
    private couponsService: CouponsService

    constructor(couponsService: CouponsService) {
        this.couponsService = couponsService
    }

    /** Validates the code and recalculates totals from the server-side cart. */
    applyCoupon = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { code } = req.body as { code?: string }
            const preview = await this.couponsService.applyForCart(
                req.user.userId,
                code ?? ""
            )
            return res.status(200).json({ data: preview })
        } catch (error) {
            next(error)
        }
    }
}
