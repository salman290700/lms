import express from "express";
import registrationUser, { activateUser, loginUser } from "../controller/user.controller";
const userRoutes = express.Router()

userRoutes.post('/registration', registrationUser);
userRoutes.post('/activate-user', activateUser);

userRoutes.post('/login-user', loginUser);

export default userRoutes


