import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CookieOptions, NextFunction, Request, Response } from "express";

import { BaseError } from "../../../common/errors/base.error.js";
import { AuthController } from "../auth.controller.js";
import {
    ACCESS_COOKIE_MAX_AGE,
    buildAuthCookieOptions,
    clearAuthCookies,
    isSecureRequest,
    setAccessTokenCookie,
} from "../auth.helper.js";
import { AuthService } from "../auth.service.js";

describe("auth cookie helpers", () => {
    it("sets secure: false for plain HTTP requests even in production", () => {
        const previousEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = "production";
        try {
            const req = { secure: false, headers: {} } as unknown as Request;
            assert.equal(isSecureRequest(req), false);
            assert.deepEqual(buildAuthCookieOptions(req, ACCESS_COOKIE_MAX_AGE), {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                path: "/",
                maxAge: ACCESS_COOKIE_MAX_AGE,
            });
        } finally {
            process.env.NODE_ENV = previousEnv;
        }
    });

    it("sets secure: true when request arrives over HTTPS or x-forwarded-proto=https", () => {
        const directHttps = { secure: true, headers: {} } as unknown as Request;
        const proxiedHttps = {
            secure: false,
            headers: { "x-forwarded-proto": "https, http" },
        } as unknown as Request;

        assert.equal(isSecureRequest(directHttps), true);
        assert.equal(isSecureRequest(proxiedHttps), true);
        assert.equal(buildAuthCookieOptions(proxiedHttps).secure, true);
    });

    it("uses matching cookie options for setAccessTokenCookie and clearAuthCookies", () => {
        const setCalls: Array<{ name: string; value: string; options: CookieOptions }> = [];
        const clearCalls: Array<{ name: string; options: CookieOptions }> = [];

        const req = { secure: false, headers: {} } as unknown as Request;
        const res = {
            req,
            cookie: (name: string, value: string, options: CookieOptions) => {
                setCalls.push({ name, value, options });
                return res;
            },
            clearCookie: (name: string, options: CookieOptions) => {
                clearCalls.push({ name, options });
                return res;
            },
        } as unknown as Response;

        setAccessTokenCookie(res, "new-access-token", req);
        clearAuthCookies(res, req);

        assert.equal(setCalls.length, 1);
        assert.equal(setCalls[0]?.name, "accessToken");
        assert.equal(setCalls[0]?.value, "new-access-token");
        assert.equal(setCalls[0]?.options.secure, false);
        assert.equal(setCalls[0]?.options.path, "/");

        assert.equal(clearCalls.length, 2);
        assert.deepEqual(clearCalls[0]?.options, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
        });
        assert.deepEqual(clearCalls[1]?.options, clearCalls[0]?.options);
    });
});

describe("AuthController.refresh", () => {
    it("sets uncached new accessToken cookie matching request protocol", async () => {
        const headersSet: Record<string, string> = {};
        const cookiesSet: Array<{ name: string; value: string; options: CookieOptions }> = [];
        let responseStatus = 0;
        let responseBody: unknown;

        const authService = {
            refresh: async (userId: string, refreshToken: string) => {
                assert.equal(userId, "user-1");
                assert.equal(refreshToken, "valid-refresh-token");
                return "fresh-access-token";
            },
        };

        const controller = new AuthController(authService as never, {} as never);
        const req = {
            user: { userId: "user-1" },
            cookies: { refreshToken: "valid-refresh-token" },
            secure: false,
            headers: {},
        } as unknown as Request;
        const res = {
            req,
            set: (key: string, value: string) => {
                headersSet[key] = value;
                return res;
            },
            cookie: (name: string, value: string, options: CookieOptions) => {
                cookiesSet.push({ name, value, options });
                return res;
            },
            status: (code: number) => {
                responseStatus = code;
                return res;
            },
            json: (body: unknown) => {
                responseBody = body;
                return res;
            },
        } as unknown as Response;
        const next: NextFunction = (err) => {
            if (err) throw err;
        };

        await controller.refresh(req, res, next);

        assert.equal(headersSet["Cache-Control"], "no-store, no-cache, must-revalidate, private");
        assert.equal(headersSet["Pragma"], "no-cache");
        assert.equal(cookiesSet.length, 1);
        assert.equal(cookiesSet[0]?.name, "accessToken");
        assert.equal(cookiesSet[0]?.value, "fresh-access-token");
        assert.equal(cookiesSet[0]?.options.secure, false);
        assert.equal(cookiesSet[0]?.options.httpOnly, true);
        assert.equal(responseStatus, 200);
        assert.deepEqual(responseBody, {
            success: true,
            message: "Token refreshed successfully",
        });
    });
});

describe("AuthService.refresh", () => {
    it("rejects empty incoming refresh token with 401", async () => {
        const service = new AuthService(
            {} as never,
            {} as never,
            {} as never,
            {} as never
        );

        await assert.rejects(
            service.refresh("user-1", ""),
            (error: BaseError) =>
                error.name === "InvalidRefreshToken" && error.statusCode === 401
        );
    });
});
