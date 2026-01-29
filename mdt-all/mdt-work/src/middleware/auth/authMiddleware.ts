import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/database/prisma";

interface JwtPayload {
  userId: string;
  type: string;
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "access_secret"
    ) as JwtPayload;

    if (decoded.type !== "access") {
      res.status(401).json({
        success: false,
        error: "Invalid token type",
      });
      return;
    }

    // Fetch user from database
    const user = await prisma.user.findUnique({
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
    (req as any).user = {
      user_id: user.user_id,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error: any) {
    if (error instanceof jwt.JsonWebTokenError) {
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
