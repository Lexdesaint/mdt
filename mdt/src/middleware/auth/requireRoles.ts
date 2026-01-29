import { Request, Response, NextFunction } from "express";

// Require that the user has at least one of the specified roles.
// Super Admin bypasses all role checks.
export function requireRoles(requiredRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (user.is_super_admin) {
      return next();
    }

    const userRoles: string[] = Array.isArray(user.roles) ? user.roles : [];
    const hasRole = requiredRoles.some((r) =>
      userRoles.map((ur) => ur.toLowerCase()).includes(r.toLowerCase())
    );

    if (!hasRole) {
      return res.status(403).json({ message: "Forbidden: insufficient role" });
    }

    next();
  };
}