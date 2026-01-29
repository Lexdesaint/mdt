import { Request, Response, NextFunction } from "express";

export function isAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user; 

  if (!user || user.role.toLowerCase() !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }

  next();
}
