import { Request, Response } from "express";
import { ResponseFormatter } from "../../type/response";
import {
  loginValidation,
  registerValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from "./validator";
import {
  userLogin,
  UserRegister,
  forgotPasswordService,
  resetPasswordService,
  generateAccessTokenFromRefresh,
  issueRefreshTokenForUser,
} from "./service";

export const register = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { error, value } = registerValidation.validate(req.body);
    if (error) {
      return ResponseFormatter.warning(
        res,
        error.details[0].message,
        null,
        400
      );
    }

    const result = await UserRegister(value);
    if (!result.success) {
      if (result.error === "Email already registered") {
        return ResponseFormatter.error(res, result.error, 409);
      }
      return ResponseFormatter.error(
        res,
        result.error || "Registration failed",
        400
      );
    }

    return ResponseFormatter.success(
      res,
      "Registration successful",
      result.data,
      201
    );
  } catch (err: any) {
    console.error("Registration controller error:", err);
    return ResponseFormatter.error(
      res,
      "Internal server error",
      500,
      err.message
    );
  }
};

export const verifyUserEmail = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    return ResponseFormatter.success(
      res,
      "Email verification not yet implemented",
      null,
      200
    );
  } catch (err: any) {
    console.error("Email verification controller error:", err);
    return ResponseFormatter.error(
      res,
      "Internal server error",
      500,
      err.message
    );
  }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { error, value } = loginValidation.validate(req.body);

    if (error) {
      return ResponseFormatter.warning(
        res,
        error.details[0].message,
        null,
        400
      );
    }

    const { email, password } = value;

    const result = await userLogin(email, password);

    if (!result.success) {
      return ResponseFormatter.error(res, result.error || "Login failed", 401);
    }

    return ResponseFormatter.success(res, "Login successful", result.data, 200);
  } catch (err: any) {
    console.error("Login controller error:", err);
    return ResponseFormatter.error(
      res,
      "Internal server error",
      500,
      err.message
    );
  }
};

export const getRefreshToken = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const userId = (req as any).user?.user_id;
    const deviceName = req.get("User-Agent") || "Unknown Device";

    if (!userId) {
      return ResponseFormatter.error(res, "Unauthorized", 401);
    }

    const result = await issueRefreshTokenForUser(userId);

    if (!result.success) {
      return ResponseFormatter.error(res, result.error || "Failed", 400);
    }

    return ResponseFormatter.success(
      res,
      "Refresh token issued",
      result.data,
      200
    );
  } catch (err: any) {
    console.error("Get refresh token controller error:", err);
    return ResponseFormatter.error(
      res,
      "Internal server error",
      500,
      err.message
    );
  }
};

export const getAccessTokenFromRefresh = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { refreshToken } = req.body || {};
    const deviceName = req.get("User-Agent") || "Unknown Device";

    if (!refreshToken) {
      return ResponseFormatter.warning(
        res,
        "Refresh token is required",
        null,
        400
      );
    }

    const result = await generateAccessTokenFromRefresh(
      refreshToken
    );

    if (!result.success) {
      return ResponseFormatter.error(res, result.error || "Failed", 401);
    }

    return ResponseFormatter.success(
      res,
      "Access token generated",
      result.data,
      200
    );
  } catch (err: any) {
    console.error("Access token from refresh controller error:", err);
    return ResponseFormatter.error(
      res,
      "Internal server error",
      500,
      err.message
    );
  }
};
