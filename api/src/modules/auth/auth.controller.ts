import { NextFunction, Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { CreateUserDTO, ILoginUser } from "./auth.types.js";
import {
  ACCESS_COOKIE_MAX_AGE,
  setAuthCookies,
} from "./auth.helper.js";
import { TokenService } from "../../shared/services/token.service.js";
import config from "../../config/env.js";
import { client } from "../../config/redis.js";

export class AuthController {
  private authService: AuthService;
  private tokenService: TokenService

  constructor(authService: AuthService, tokenService: TokenService) {
    this.authService = authService;
    this.tokenService = tokenService
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as CreateUserDTO;
      const newUser = await this.authService.register(data);
      await this.authService.sendVerificationLink(newUser.email)
      return res.status(200).json({
        success: true,
        data: newUser,
      });
    } catch (error) {
      next(error);
    }
  }

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as ILoginUser;
      const { userId } = await this.authService.login(data);

      await setAuthCookies(res, userId, this.tokenService)

      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: { userId },
      });

    } catch (error) {
      next(error);
    }
  }

  resendVerificationLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body
      await this.authService.sendVerificationLink(data.email)
      return res.status(200).json({
        message: "Verification link sent"
      })
    } catch (error) {
      next(error);
    }
  }

  verify = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.query.token
      if (typeof token !== "string" || !token) {
        return res.status(400).json({ success: false, message: "Verification token is required" })
      }
      const userId = await this.authService.verify(token)
      await setAuthCookies(res, userId, this.tokenService)
      return res.status(200).json({
        message: "email verified successfully"
      })
    } catch (error) {
      next(error);
    }
  }

  refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies["refreshToken"]
      const accessToken = await this.authService.refresh(req.user.userId, refreshToken)

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: config.nodeEnv === "production",
        sameSite: "lax",
        maxAge: ACCESS_COOKIE_MAX_AGE
      })

      return res.status(200).json({
        success: true,
        message: "Token refreshed successfully"
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clears both auth cookies and invalidates the stored refresh token. The
   * client needs this to complete the refresh-failure flow and to let users
   * sign out explicitly.
   */
  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies?.refreshToken
      if (typeof refreshToken === "string" && refreshToken) {
        try {
          const { userId } = this.tokenService.verifyRefreshToken(refreshToken)
          await client.del(`refresh_token:${userId}`)
        } catch {
          // An expired/invalid refresh cookie is already useless; still clear it.
        }
      }

      const cookieOptions = {
        httpOnly: true,
        secure: config.nodeEnv === "production",
        sameSite: "lax" as const,
      }
      res.clearCookie("accessToken", cookieOptions)
      res.clearCookie("refreshToken", cookieOptions)

      return res.status(200).json({ success: true, message: "Logged out" })
    } catch (error) {
      next(error)
    }
  }

}
