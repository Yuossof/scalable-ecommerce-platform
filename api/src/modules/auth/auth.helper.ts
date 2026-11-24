import { Response } from "express";
import config from "../../config/env.js";
import { client } from "../../config/redis.js";
import { TokenService } from "../../shared/services/token.service.js";

/** Converts the JWT-style durations used in config (`30m`, `7d`) to milliseconds. */
export function durationToMs(value: string, fallback: number): number {
    const match = /^(\d+)\s*(s|m|h|d)$/i.exec(value.trim());
    if (!match) return fallback;

    const amount = Number(match[1]);
    const unitMs: Record<string, number> = {
        s: 1000,
        m: 60 * 1000,
        h: 60 * 60 * 1000,
        d: 24 * 60 * 60 * 1000,
    };

    return amount * unitMs[match[2].toLowerCase()];
}

export const ACCESS_COOKIE_MAX_AGE = durationToMs(config.accessTokenEx, 30 * 60 * 1000)
export const REFRESH_COOKIE_MAX_AGE = durationToMs(config.refreshTokenEx, 7 * 24 * 60 * 60 * 1000)

const cookieOptions = (maxAge: number) => ({
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "lax" as const,
    maxAge,
})

export const setAuthCookies = async (
    res: Response,
    userId: string,
    tokenService: TokenService
) => {
    const refreshToken = tokenService.generateRefreshToken(userId)
    const accessToken = tokenService.generateAccessToken(userId)

    await client.set(`refresh_token:${userId}`, refreshToken, {
        expiration: { type: "EX", value: Math.floor(REFRESH_COOKIE_MAX_AGE / 1000) }
    });

    res.cookie("accessToken", accessToken, cookieOptions(ACCESS_COOKIE_MAX_AGE))
    res.cookie("refreshToken", refreshToken, cookieOptions(REFRESH_COOKIE_MAX_AGE))

    return { refreshToken, accessToken }
}
