require('dotenv').config()
import { Request, Response, NextFunction } from "express"; 
import userModel, {IUser} from "../models/user.model";
import jwt, { Secret } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import ErrorHandler from "../utils/ErrorHandler";
import sendMail from "../utils/sendMail";
import CatchAsyncError from "../middleware/catchAsyncError";
import { sendToken } from "../utils/jwt";


// register user
interface IRegistrationBody{
    name: string;
    email: string;
    password:string;
    avatar?: string;
};

export const registrationUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body;

        const isEmailExist = await userModel.findOne({email});
        if(isEmailExist) {
            return next(new ErrorHandler("Email Already Exist", 400))
        };

        const user: IRegistrationBody = {
            name,
            email,
            password
        };
        const activationToken = createActivationToken(user)
        const activationCode = activationToken.activationCode;
        const data = {user: {name: user.name}, activationCode: activationCode};
        const html = await ejs.renderFile(path.join(__dirname, "../mails/activation-mail.ejs"), data)
        try {
            console.log(user.email)
            await sendMail({
                email: user.email,
                subject: "Activate your UCode Account",
                template: "activation-mail.ejs",
                data,
            });
            res.status(201).json({
                success: true,
                message: `Please check your email: ${user.email}`,
                activationToken: activationToken.token,
            });
        }catch (error: any) {
            return next(new ErrorHandler(error.message, 400))
        }
    }catch (error: any) {
        return next(new ErrorHandler(error.message, 404));
    }
});

interface IActivationToken{
    token: string;
    activationCode: string;
}

export const createActivationToken = (user: IRegistrationBody): IActivationToken => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString()
    console.log("createActivationToken" + user.email);
    const token = jwt.sign({
        user, activationCode
    }, process.env.ACTIVATION_SECRET as Secret,{
        expiresIn:"5m"
    });
    return {token, activationCode};
}

export default registrationUser;

// Activate User
interface IActivationRequest{
    activation_token: string;
    activation_code: string;
}

export const activateUser = CatchAsyncError(async(req: Request, res: Response, next: NextFunction) => {
    try {
        const {activation_token, activation_code} = req.body as IActivationRequest;
        const newUser: {user: IUser; activationCode: string} = jwt.verify(
            activation_token,
            process.env.ACTIVATION_SECRET as string
        ) as {user: IUser; activationCode: string};

        
        if (newUser.activationCode !== activation_code) {
            return next(new ErrorHandler("Invalid activation code", 400));
        }

        const { name, email, password} = newUser.user;
        console.log(email);
        const existUser = await userModel.findOne({ email });

        if (existUser) {
            return next(new ErrorHandler("Email already in used", 400))
        }        

        const user = await userModel.create({
            name,
            email,
            password
        })

        res.status(201).json({
            success: true,
        });

    }catch (error: any) {
        return next(new ErrorHandler(error.message, 400))
    }
})

// Login User
interface ILoginRequest {
    email: string,
    password: string
}

export const loginUser = CatchAsyncError(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, password} = req.body as ILoginRequest;

        if(!email || !password) {
            return next(new ErrorHandler("Please enter email or password", 400));
        }

        const user = await userModel.findOne({email}).select("+password");
        if(!user) {
            return next(new ErrorHandler("Invalid email or Password", 400));
        }
        const isPasswordMatch = await user?.comparePassword(password);
        if(!isPasswordMatch) {
            return next(new ErrorHandler("Invalid Email or Password", 400));
        }

        sendToken(user, 200, res);

    }catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
    }
})