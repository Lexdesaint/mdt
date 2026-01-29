"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiRouteService = void 0;
const prisma_1 = __importDefault(require("../../config/database/prisma"));
class ApiRouteService {
    // Fetch all routes
    static async getRoutes() {
        return prisma_1.default.apiRoute.findMany({
            orderBy: { createdAt: "desc" },
        });
    }
    // Update a route by path
    static async updateRoute(path, data) {
        return prisma_1.default.apiRoute.update({
            where: { path },
            data,
        });
    }
}
exports.ApiRouteService = ApiRouteService;
