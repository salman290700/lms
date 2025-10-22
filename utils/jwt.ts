require("dotenv").config();
import { Response } from "express";
import { IUser } from "../models/user.model";
import { createClient } from "redis";
import redis from "./redis";
import { loadavg } from "os";
import { access } from "fs";

interface ITokenOptions {
    expires: Date;
    maxAge: number;
    httpOnly: boolean;
    sameSite: 'lax' | 'strict' | 'none';
    secure?: boolean;
}

export const sendToken = async(user: IUser, statusCode: number, res: Response) => {
    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();
    await redis.set(`${user.id}`, `${JSON.stringify as any}`);


    // parse environtment variables to integrate with fallbacks value
    const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || '300', 10);
    const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || '1200', 10);

    const accessTokenOptions: ITokenOptions = {
        expires: new Date(Date.now() + accessTokenExpire * 1000),
        maxAge: accessTokenExpire * 1000,
        httpOnly: true,
        sameSite: 'lax',
    };

    const refreshTokenOtions: ITokenOptions = {
        expires: new Date(Date.now() + refreshTokenExpire * 1000),
        maxAge: refreshTokenExpire * 1000,
        httpOnly: true,
        sameSite: 'lax'
    };

    // only ser secure in production
    if (process.env.NODE_ENV === 'production') {
        accessTokenOptions.secure = true
    }

    res.cookie("access_token", accessToken, accessTokenOptions);
    res.cookie("refresh_token", refreshToken, refreshTokenOtions);

    res.status(statusCode).json({
        success: true,
        user,
        accessToken,
    });
}

// const redisRun = (id: string, json: any) => {
//     redis.set(id, json);
// }