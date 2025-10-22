require("dotenv").config()
import express, { NextFunction, Request, Response } from "express";
export const app = express()
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middleware/error";
import userRoutes from "./routes/user.route";

app.use(express.json({ limit:"50mb" }))

app.use(cookieParser());

app.use(
    cors({
        origin: process.env.ORIGIN
    })
);

app.use("/api/v1/", userRoutes);


app.get("/test", (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        success:true,
        messahe: "APi is working"
    });
});

app.use(ErrorMiddleware);


