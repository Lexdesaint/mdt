"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../config/database/prisma");
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                error: "Access token required",
            });
            return;
        }
        const token = authHeader.substring(7);
        // Verify JWT token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || "access_secret");
        if (decoded.type !== "access") {
            res.status(401).json({
                success: false,
                error: "Invalid token type",
            });
            return;
        }
        // Fetch user from database
        const user = await prisma_1.prisma.user.findUnique({
            where: { user_id: decoded.userId },
        });
        if (!user) {
            res.status(401).json({
                success: false,
                error: "User not found",
            });
            return;
        }
        // Store user in request object for later use
        req.user = {
            user_id: user.user_id,
            email: user.email,
            name: user.name,
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                error: "Invalid or expired token",
            });
            return;
        }
        console.error("Auth middleware error:", error);
        res.status(401).json({
            success: false,
            error: "Invalid token",
        });
    }
};
exports.authMiddleware = authMiddleware;
