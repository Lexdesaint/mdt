"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordService = exports.forgotPasswordService = exports.userLogin = exports.UserRegister = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../config/database/prisma");
// Token generation helper functions
const ACCESS_TOKEN_EXPIRES = "15m";
const REFRESH_TOKEN_EXPIRES = "7d";
const generateAccessToken = (userId) => {
    const options = { expiresIn: ACCESS_TOKEN_EXPIRES };
    const token = jsonwebtoken_1.default.sign({ userId, type: "access" }, process.env.JWT_SECRET, options);
    return token;
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (userId) => {
    const options = { expiresIn: REFRESH_TOKEN_EXPIRES };
    const token = jsonwebtoken_1.default.sign({ userId, type: "refresh" }, process.env.JWT_REFRESH_SECRET, options);
    return token;
};
exports.generateRefreshToken = generateRefreshToken;
// ---------- Services ----------
const UserRegister = async (userData) => {
    try {
        const { name, email, password, confirm_password } = userData;
        // Check if email already exists
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            return {
                success: false,
                error: "Email already registered",
                isSuccess: false,
            };
        }
        if (password !== confirm_password) {
            return {
                success: false,
                error: "Passwords do not match",
                isSuccess: false,
            };
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        // Create user with simplified schema
        const user = await prisma_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name,
            },
        });
        return {
            success: true,
            isSuccess: true,
            data: {
                user: {
                    id: user.user_id,
                    email: user.email,
                    name: user.name,
                    createdAt: user.createdAt,
                },
            },
        };
    }
    catch (error) {
        return {
            success: false,
            error: error.message || "Internal Server Error",
            isSuccess: false,
        };
    }
};
exports.UserRegister = UserRegister;
const userLogin = async (email, password) => {
    const user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
        return { success: false, error: "Invalid email or password" };
    }
    const isMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isMatch) {
        return { success: false, error: "Invalid email or password" };
    }
    const accessToken = (0, exports.generateAccessToken)(user.user_id);
    const refreshToken = (0, exports.generateRefreshToken)(user.user_id);
    // Save refresh token
    await prisma_1.prisma.token.create({
        data: {
            user_id: user.user_id,
            token: refreshToken,
            token_type: "refresh",
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
    });
    return {
        success: true,
        data: {
            user: {
                id: user.user_id,
                email: user.email,
                name: user.name,
            },
            tokens: {
                accessToken,
                refreshToken,
            },
        },
    };
};
exports.userLogin = userLogin;
const forgotPasswordService = async (email) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return { success: false, error: "User not found" };
        }
        // Generate password reset token (valid for 1 hour)
        const resetToken = jsonwebtoken_1.default.sign({ userId: user.user_id, type: "password_reset" }, process.env.JWT_SECRET || "access_secret", { expiresIn: "1h" });
        // In a real app, send this token via email
        // For now, return it in response (NOT recommended for production)
        return {
            success: true,
            data: { resetToken, message: "Password reset token generated" },
        };
    }
    catch (error) {
        console.error("❌ Error in forgotPasswordService:", error);
        return { success: false, error: error.message || "Internal Server Error" };
    }
};
exports.forgotPasswordService = forgotPasswordService;
const resetPasswordService = async (email, resetToken, newPassword) => {
    const decoded = jsonwebtoken_1.default.verify(resetToken, process.env.JWT_ACCESS_SECRET);
    if (decoded.type !== "password_reset") {
        return { success: false, error: "Invalid token" };
    }
    const tokenRecord = await prisma_1.prisma.token.findFirst({
        where: {
            token: resetToken,
            token_type: "password_reset",
            is_used: false,
        },
    });
    if (!tokenRecord) {
        return { success: false, error: "Token expired or already used" };
    }
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
    await prisma_1.prisma.$transaction([
        prisma_1.prisma.user.update({
            where: { user_id: decoded.userId },
            data: { password: hashedPassword },
        }),
        prisma_1.prisma.token.update({
            where: { id: tokenRecord.id },
            data: { is_used: true },
        }),
    ]);
    return { success: true };
};
exports.resetPasswordService = resetPasswordService;
