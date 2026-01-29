import { Request, Response, NextFunction } from "express";

export function isSuperAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;

  if (!user || !user.is_super_admin) {
    return res.status(403).json({ message: "Super Admins only" });
  }

  next();
}