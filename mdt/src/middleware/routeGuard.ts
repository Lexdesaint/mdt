import { prisma } from "../config/database/prisma";
import { Request, Response, NextFunction } from "express";

export async function routeGuard(req: Request, res: Response, next: NextFunction) {
  try {
    const path = req.baseUrl;
    
    // Get all registered routes
    const routes = await prisma.apiRoute.findMany();
    
    // Find a route that matches the beginning of the request path
    const route = routes.find(r => path.startsWith(r.path));
    
    console.log("Route guard check for path:", path, "Matched route:", route?.path);
    if (!route) return res.status(404).json({ message: "Route not registered" });

    if (!route.enabled || route.status === "disabled") {
      return res.status(503).json({
        status: "disabled",
        message: route.message || "This route is currently disabled.",
      });
    }

    if (route.status === "maintenance") {
      return res.status(503).json({
        status: "maintenance",
        message: route.message || "This route is under maintenance.",
      });
    }

    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
