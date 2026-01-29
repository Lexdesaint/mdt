import { Request, Response } from "express";
import { ApiRouteService } from "./service";

export class ApiRouteController {
  static async getRoutes(req: Request, res: Response) {
    const routes = await ApiRouteService.getRoutes();
    res.json(routes);
  }

  static async updateRoute(req: Request, res: Response) {
    const { path } = req.params;
    const { enabled, status, message } = req.body;

    try {
      const updated = await ApiRouteService.updateRoute(path, { enabled, status, message });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: "Could not update route" });
    }
  }
}
