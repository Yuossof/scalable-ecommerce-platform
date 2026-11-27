import { CookieOptions, Request, Response } from "express";
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

/** Determines whether the incoming request arrived over HTTPS (directly or via proxy). */
export function isSecureRequest(req?: Request): boolean {
    if (!req) return false;
    if (req.secure) return true;
    const forwardedProto = req.headers["x-forwarded-proto"];
    const proto = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto;
    return proto?.split(",")[0]?.trim().toLowerCase() === "https";
}

export function buildAuthCookieOptions(req?: Request, maxAge?: number): CookieOptions {
    return {
        httpOnly: true,
        secure: isSecureRequest(req),
        sameSite: "lax",
        path: "/",
        ...(maxAge !== undefined ? { maxAge } : {}),
    };
}

export function setAccessTokenCookie(res: Response, accessToken: string, req?: Request) {
    res.cookie(
        "accessToken",
        accessToken,
        buildAuthCookieOptions(req ?? res.req, ACCESS_COOKIE_MAX_AGE)
    );
}

export function clearAuthCookies(res: Response, req?: Request) {
    const options = buildAuthCookieOptions(req ?? res.req);
    res.clearCookie("accessToken", options);
    res.clearCookie("refreshToken", options);
}

export const setAuthCookies = async (
    res: Response,
    userId: string,
    tokenService: TokenService,
    req?: Request
) => {
    const refreshToken = tokenService.generateRefreshToken(userId)
    const accessToken = tokenService.generateAccessToken(userId)
    const request = req ?? res.req;

    await client.set(`refresh_token:${userId}`, refreshToken, {
        expiration: { type: "EX", value: Math.floor(REFRESH_COOKIE_MAX_AGE / 1000) }
    });

    setAccessTokenCookie(res, accessToken, request)
    res.cookie("refreshToken", refreshToken, buildAuthCookieOptions(request, REFRESH_COOKIE_MAX_AGE))

    return { refreshToken, accessToken }
}
