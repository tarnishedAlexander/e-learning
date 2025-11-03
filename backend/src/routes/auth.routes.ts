import express from "express";
import { register, login } from "../controllers/auth.controller.js";

export const authRoutes = express.Router();

// POST /api/auth/register - Register a new user
authRoutes.post("/register", register);

// POST /api/auth/login - Login user
authRoutes.post("/login", login);
