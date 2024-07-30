import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/ErrorHandler";

const ErrorMiddleware= (err: any, req: Request, res: Response, next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    // Wrong mongodb id error
    if(err.name === 'CastError') {
        const message = `Resource not found. Invalid : ${err.path}`;
        err = new ErrorHandler(message, 400)
    }

    // Duplicate Key Error
    if (err.code === 1100) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`
        err = new ErrorHandler(message, 400);        
    }

    // wrong jwt token error
    if(err.name === 'JsonWebTokenError') {
        const message = `Json webtoken is expired, please login again`
        err = new ErrorHandler(message, 400)
    }

    res.status(err.statusCode).json({
        status: false,
        message: err.message
    })  
}

export default {ErrorMiddleware}