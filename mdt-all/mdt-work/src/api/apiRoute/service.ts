import prisma from "../../config/database/prisma";
import { ApiRoute, ApiRouteStatus } from "../../generated/prisma";

export class ApiRouteService {
  // Fetch all routes
  static async getRoutes(): Promise<ApiRoute[]> {
    return prisma.apiRoute.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  // Update a route by path
  static async updateRoute(
    path: string,
    data: { enabled?: boolean; status?: ApiRouteStatus; message?: string }
  ): Promise<ApiRoute> {
    return prisma.apiRoute.update({
      where: { path },
      data,
    });
  }
}
