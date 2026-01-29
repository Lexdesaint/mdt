"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.login = exports.verifyUserEmail = exports.register = void 0;
const response_1 = require("../../type/response");
const validator_1 = require("./validator");
const service_1 = require("./service");
const register = async (req, res) => {
    try {
        const { error, value } = validator_1.registerValidation.validate(req.body);
        if (error) {
            return response_1.ResponseFormatter.warning(res, error.details[0].message, null, 400);
        }
        const result = await (0, service_1.UserRegister)(value);
        if (!result.success) {
            if (result.error === "Email already registered") {
                return response_1.ResponseFormatter.error(res, result.error, 409);
            }
            return response_1.ResponseFormatter.error(res, result.error || "Registration failed", 400);
        }
        return response_1.ResponseFormatter.success(res, "Registration successful", result.data, 201);
    }
    catch (err) {
        console.error("Registration controller error:", err);
        return response_1.ResponseFormatter.error(res, "Internal server error", 500, err.message);
    }
};
exports.register = register;
const verifyUserEmail = async (req, res) => {
    try {
        return response_1.ResponseFormatter.success(res, "Email verification not yet implemented", null, 200);
    }
    catch (err) {
        console.error("Email verification controller error:", err);
        return response_1.ResponseFormatter.error(res, "Internal server error", 500, err.message);
    }
};
exports.verifyUserEmail = verifyUserEmail;
const login = async (req, res) => {
    try {
        const { error, value } = validator_1.loginValidation.validate(req.body);
        if (error) {
            return response_1.ResponseFormatter.warning(res, error.details[0].message, null, 400);
        }
        const { email, password } = value;
        const result = await (0, service_1.userLogin)(email, password);
        if (!result.success) {
            return response_1.ResponseFormatter.error(res, result.error || "Login failed", 401);
        }
        return response_1.ResponseFormatter.success(res, "Login successful", result.data, 200);
    }
    catch (err) {
        console.error("Login controller error:", err);
        return response_1.ResponseFormatter.error(res, "Internal server error", 500, err.message);
    }
};
exports.login = login;
const forgotPassword = async (req, res) => {
    try {
        const { error, value } = validator_1.forgotPasswordValidation.validate(req.body);
        if (error) {
            return response_1.ResponseFormatter.warning(res, error.details[0].message, null, 400);
        }
        const { email } = value;
        const result = await (0, service_1.forgotPasswordService)(email);
        if (!result.success) {
            if (result.error === "User not found") {
                return response_1.ResponseFormatter.error(res, "User not found", 404, "No account found with this email");
            }
            return response_1.ResponseFormatter.error(res, result.error || "Failed to generate reset token", 500);
        }
        return response_1.ResponseFormatter.success(res, "Password reset token generated", result.data, 200);
    }
    catch (err) {
        console.error("Forgot password controller error:", err);
        return response_1.ResponseFormatter.error(res, "Internal server error", 500, err.message);
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { error, value } = validator_1.resetPasswordValidation.validate(req.body);
        if (error) {
            return response_1.ResponseFormatter.warning(res, error.details[0].message, null, 400);
        }
        const { email, resetToken, new_password } = value;
        const result = await (0, service_1.resetPasswordService)(email, resetToken, new_password);
        if (!result.success) {
            return response_1.ResponseFormatter.error(res, result.error || "Failed to reset password", 400);
        }
        return response_1.ResponseFormatter.success(res, "Password reset successfully", result.data, 200);
    }
    catch (err) {
        console.error("Reset password controller error:", err);
        return response_1.ResponseFormatter.error(res, "Internal server error", 500, err.message);
    }
};
exports.resetPassword = resetPassword;
