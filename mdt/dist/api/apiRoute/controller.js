"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiRouteController = void 0;
const service_1 = require("./service");
class ApiRouteController {
    static async getRoutes(req, res) {
        const routes = await service_1.ApiRouteService.getRoutes();
        res.json(routes);
    }
    static async updateRoute(req, res) {
        const { path } = req.params;
        const { enabled, status, message } = req.body;
        try {
            const updated = await service_1.ApiRouteService.updateRoute(path, { enabled, status, message });
            res.json(updated);
        }
        catch (err) {
            res.status(400).json({ error: "Could not update route" });
        }
    }
}
exports.ApiRouteController = ApiRouteController;
